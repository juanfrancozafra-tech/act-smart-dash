# Retention Engine — Validation Prototype

A high-fidelity, clickable prototype that helps Product, Growth, and Customer Success teams diagnose early churn and take immediate action.

> **Question the prototype answers:**
> *Can teams quickly identify why accounts are likely to churn and take immediate action to prevent it?*

**Live preview:** https://act-smart-dash.lovable.app

---

## Hypothesis

> Early churn in B2B SaaS is driven less by product quality and more by **collaboration gaps during onboarding**. Accounts that never invite a teammate in the first 14 days are structurally exposed to churn, regardless of how much the primary user explores the product.

If this is true, then surfacing **team-invite signals + activation milestones** at the account level should let CS and Growth teams predict churn earlier and intervene with a single, targeted nudge — rather than waiting on usage decay or NPS to flag a problem.

The prototype is designed to make this hypothesis either obviously correct or obviously wrong within seconds of opening the dashboard.

---

## Scenario

A B2B SaaS company is losing **30% of customers within the first 90 days**. Users sign up, poke around, and disappear. Internal analysis suspects team invitations are related, but no one knows whether the real blocker is:

- onboarding friction,
- collaboration gaps,
- feature adoption, or
- unclear value realization.

The Retention Engine prototype gives a cross-functional team a single surface to triage the question, identify at-risk accounts, and launch an intervention — end-to-end, in under a minute.

---

## Key Screens

### 1. Retention Dashboard (`/`)
The triage surface. Designed so the dominant churn driver is legible in under 10 seconds.

- **KPI cards** — 90-day retention (70%), churn rate (30%), at-risk accounts, MRR at risk.
- **Churn curve** — 12-week trend showing where accounts drop off.
- **Activation funnel** — Signup → First action → Invite teammate → Repeat usage → Retained.
- **Team Invite vs. Retention** — the headline chart: accounts that invite a teammate retain at **2.7×** the rate of solo accounts. This is the visual answer to the hypothesis.
- **AI-generated insights panel** — plain-language summary of the biggest current risk driver.
- **At-Risk Accounts table** — sortable list with health score, risk tier, and primary churn signal. One click drills into an account.

### 2. Account Detail (`/accounts/$id`)
The intervention surface. Designed so a user can go from "this account looks bad" to "intervention sent" in under 30 seconds.

- **Health gauge** (custom SVG) — single-number account health, color-coded by risk tier.
- **Churn drivers** — ranked list (e.g. *"Solo usage pattern — no teammates invited in 21 days"*).
- **Onboarding progress** — checklist of activation milestones completed / skipped.
- **Intervention panel** — clickable end-to-end flow:
  `idle → compose (personalized re-engagement nudge) → sent (success state + projected retention impact)`.

---

## Build Decisions

### What we optimized for
- **Speed of comprehension over completeness.** Every screen has one job. The dashboard answers *"who is at risk and why?"*; the detail page answers *"what do I do about it?"*.
- **Clickable end-to-end over real backend.** This is a validation prototype, not a product. All data is mocked in `src/features/retention/data/retentionData.ts` so the entire flow works from a single shareable link with zero setup.
- **One distinctive visual direction.** Custom Inter-based theme with semantic risk tokens (High / Medium / Low) in OKLCH, rather than generic SaaS purple-on-white.

### Stack
- **TanStack Start v1** (React 19, Vite 7) for file-based routing and a single shareable public URL.
- **Lovable Cloud (Supabase)** for auth (email/password + Google), role-based access (`user_roles` + `has_role()` SECURITY DEFINER), and RLS-scoped writes on `interventions`.
- **Recharts** for the churn curve, activation funnel, and invite-vs-retention comparison.
- **Custom SVG** for the account health gauge — Recharts was the wrong primitive for a single-value radial.
- **Tailwind v4** via `src/styles.css` using native `@import` + theme variables (no legacy `tailwind.config.js`).

### Project structure

The codebase is grouped **by feature, not by type**. Each feature owns its
display components and its data layer side-by-side, and routes are kept
deliberately thin — they only declare URL, metadata, and the loader.

```
src/
  routes/                                  # thin TanStack Start route files
    __root.tsx                             # shell, providers, ErrorBoundary, OfflineBanner, auth listener
    index.tsx                              # /              → <RetentionDashboard />
    accounts.$id.tsx                       # /accounts/$id  → <AccountDetailScreen />
    auth.tsx                               # /auth          → email/password + Google + forgot-password
    reset-password.tsx                     # /reset-password (recovery flow)
    _authenticated/route.tsx               # pathless auth gate

  features/
    retention/
      data/                                # pure TypeScript — no JSX, no React
        retentionData.ts                   # mocked accounts, KPIs, drivers, quotes
        retentionScaling.ts                # deterministic scaling for period selector
        periodContext.tsx                  # React context for the time-range selector

      components/                          # display components (one per file)
        RetentionDashboard.tsx             # top-level dashboard screen
        AccountDetailScreen.tsx            # top-level account detail screen
        InterventionComposer.tsx           # idle → compose → sent flow
        AtRiskAccountsTable.tsx            # sortable, animated risk table
        AIInsightsPanel.tsx
        RecommendedInterventionsPanel.tsx
        UserQuotesStrip.tsx
        ChurnTrendChart.tsx
        ActivationFunnelChart.tsx
        InviteVsRetentionChart.tsx         # the "collaboration payoff" chart
        TopDriversChart.tsx
        HealthGauge.tsx
        KpiCard.tsx
        PeriodSelector.tsx
        ExportReportDialog.tsx
        DashboardEmptyState.tsx
        AccountEmptyState.tsx
        AccountDetailSkeleton.tsx

    shell/                                 # cross-feature app chrome
      AppShell.tsx                         # sidebar + topbar layout wrapper

  components/ui/                           # shadcn primitives (do not rename)
  hooks/                                   # generic React hooks
  lib/                                     # framework utilities (cn, error reporting, …)
  styles.css                               # theme tokens (incl. risk palette)
```

### Conventions

- **Naming.** Components are named for what the user sees, not for their
  shape: `RetentionDashboard`, `AccountDetailScreen`, `InterventionComposer`,
  `AtRiskAccountsTable`. Avoid generic names like `Panels`, `Charts`, `Utils`.
- **Data vs. display.** Files under `features/<name>/data/` are pure
  TypeScript — no JSX, no `useState`. Display components import data via
  relative paths within their feature; cross-feature imports go through
  `@/features/<other>/...`.
- **Routes are thin.** Route files only declare the URL, `head()` metadata,
  and the loader. The screen component lives in `features/<name>/components/`.
- **Where to add a new file.**
  - New screen or panel for an existing feature → `features/<name>/components/`
  - New mock data, scaling, or context for an existing feature → `features/<name>/data/`
  - New shadcn primitive → `components/ui/` (treat as vendored)
  - New cross-cutting hook → `hooks/`
  - New cross-cutting utility (formatter, error reporter, etc.) → `lib/`


### Explicitly out of scope
- Real telemetry / data pipeline
- Authentication and multi-tenant isolation
- Persisting sent interventions
- Email / Slack delivery for nudges
- Admin configuration of risk thresholds

These were cut so the prototype stays focused on the validation question. They are the obvious next steps if the hypothesis holds up.

---

## Success Criteria (from the brief)

- [x] A user can identify the top churn driver within 10 seconds.
- [x] A user can select an at-risk account and launch an intervention within 30 seconds.
- [x] The relationship between team invitations and retention is visually obvious.
- [x] The complete intervention flow is clickable end-to-end.
- [x] The prototype is responsive and shareable through a single public link.
