# Product Requirements Document — Retention Engine

**Status:** Validation prototype
**Live preview:** https://act-smart-dash.lovable.app
**Repository:** committed alongside source (see `README.md`, `PROMPTS.md`)

---

## 1. What it does

Retention Engine is a focused B2B SaaS analytics surface that helps cross-functional teams diagnose **early churn** and act on it from a single screen. It turns raw account telemetry into a prioritized list of at-risk customers, explains *why* each one is at risk, and lets an operator launch a targeted intervention in under a minute — without leaving the dashboard.

It is intentionally narrow: one question, one triage view, one intervention flow.

## 2. Who it's for

Primary users (cross-functional, same surface):

- **Customer Success Managers** — need to know which accounts to call today and what to say.
- **Growth / Lifecycle PMs** — need to see which churn drivers are systemic vs. account-specific.
- **Product leaders** — need a single, legible view of where activation is breaking down.

Secondary: founders and executives who want a 10-second read on retention health.

## 3. Problem it solves

A B2B SaaS company is losing **30% of customers within the first 90 days**. Users sign up, explore briefly, and disappear. Internal theories are split between onboarding friction, collaboration gaps, feature adoption, and unclear value realization — but no one surface lets the team confirm which one matters most, identify the affected accounts, and intervene.

Today this work is spread across BI dashboards (data, no action), CRMs (action, no insight), and email tools (delivery, no targeting). Retention Engine collapses all three into one screen.

## 4. Hypothesis

> Early churn in B2B SaaS is driven less by product quality and more by **collaboration gaps during onboarding**. Accounts that never invite a teammate in the first 14 days are structurally exposed to churn, regardless of how much the primary user explores the product.

Implication: surfacing **team-invite signals + activation milestones** at the account level should let teams predict churn earlier and intervene with a single, targeted nudge — rather than waiting on usage decay or NPS.

The prototype is designed to make this hypothesis obviously correct or obviously wrong within seconds of opening the dashboard.

## 5. Screens

### 5.1 Retention Dashboard — `/`
**Purpose:** Triage. Answer *"who is at risk and why?"* in under 10 seconds.

Contains:
- **Page header** — title, status row, global Period Selector (7d / 30d / 90d / custom), Export Report.
- **KPI strip** — 90-day retention, churn rate, activated accounts, team invitation rate, average health. Hover reveals calculation, why-it-matters, and recommended next step.
- **Churn curve** — 12-week trend.
- **Activation funnel** — Sign Up → Onboarding → Team Invite → Activation → Retained.
- **Invite vs. Retention chart** — the headline visual: invited cohorts retain at ~2.7× the rate of solo accounts.
- **AI Insights panel** — plain-language summary of the dominant churn driver and a suggested action.
- **At-Risk Accounts table** — sortable (Account, Health, Risk, Last active, ARR), default Risk High → Low, persisted across navigation.

### 5.2 Account Detail — `/accounts/$id`
**Purpose:** Intervention. Go from *"this account looks bad"* to *"intervention sent"* in under 30 seconds.

Contains:
- **Client header** — name, industry, CSM, ARR, seats / invited seats.
- **Account Health gauge** — single-number score, color-coded by risk tier.
- **Key metrics cards** — onboarding completion, features adopted, weekly active users, days since signup.
- **Churn drivers** — ranked list (e.g. *"Solo usage pattern — no teammates invited in 21 days"*).
- **Activity timeline / onboarding checklist** — milestones completed vs. skipped.
- **Intervention panel** — clickable flow: `idle → compose (personalized re-engagement nudge) → sent (success + projected retention impact)`.

### 5.3 Loading and Empty States (behavioral, not separate routes)
- **Skeleton** — `AccountDetailSkeleton` renders during the ~750ms simulated fetch on every account detail visit.
- **Dashboard empty** — `DashboardEmpty` appears when the selected period yields no signals (e.g. *Last 7 days* with no at-risk accounts), with setup guidance.
- **Account empty** — `AccountEmpty` appears for accounts with no data yet (seeded *Horizon Data*), explaining why (recently created, sync in progress) and offering refresh / pick-another / return-to-dashboard.

## 6. User flow

```
                 ┌──────────────────────┐
                 │  Open shareable URL  │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │  Dashboard `/`       │
                 │  • Read KPI strip    │
                 │  • Scan invite chart │
                 │  • Read AI insight   │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │  Sort At-Risk table  │
                 │  (Risk High → Low)   │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │  Click account row   │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │  Account `/accounts` │
                 │  • Read health gauge │
                 │  • Read churn drivers│
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │  Intervention panel  │
                 │  idle → compose →    │
                 │  sent (impact shown) │
                 └──────────────────────┘
```

Supporting flows:
- Change global period → all visualizations recalculate.
- Export report (Markdown / CSV / Excel) from header.
- Return to dashboard from empty/error states.

## 7. Key metrics

**Product validation metrics (does the surface work?)**
- Time-to-first-insight: user identifies the top churn driver in **≤ 10 seconds**.
- Time-to-intervention: user goes from at-risk account to sent nudge in **≤ 30 seconds**.
- Hypothesis legibility: 100% of testers correctly state the invite-vs-retention relationship after one viewing.

**Business metrics surfaced inside the product**
- 90-day Retention Rate (target: improve from 70%)
- 90-day Churn Rate (target: reduce from 30%)
- Activated Accounts %
- Team Invitation Rate
- Average Health Score
- MRR at risk
- Cohort retention: With Invites (84%) vs. No Invites (31%)

**Intervention impact metrics (per recommended action)**
- Re-engagement nudge: +12% invites
- Onboarding session: +9% activation
- Invite teammates: +18% retention
- CSM outreach: +22% renewal

## 8. Mocked vs. real

### Real (functional in the prototype)
- All UI, routing, and navigation (TanStack Start v1, React 19, Vite 7).
- Global Period Selector — recalculates KPIs, churn curves, funnel counts, and at-risk accounts deterministically (`src/lib/retention-scaling.ts`).
- At-Risk table sorting — full sort/persistence/animation pipeline in `Panels.tsx`.
- Hover states on KPI / insight / chart cards.
- Report Export — generates real `.md`, `.csv`, `.xls` files client-side and downloads them.
- Skeleton and empty states — triggered by real data conditions, not toggles.
- Intervention flow — clickable end-to-end (idle → compose → sent).
- Custom SVG Health Gauge, Recharts visualizations.
- Responsive layout, shareable via a single public URL.

### Mocked (intentionally, for a validation prototype)
- **All account data, KPIs, trends, drivers, quotes** live in `src/lib/retention-data.ts` — no database, no telemetry pipeline.
- **AI insights** — pre-written narrative strings, not a live LLM call.
- **Account detail fetch** — `~750ms` simulated delay to demonstrate the skeleton state; there is no network call.
- **Sent interventions** — not persisted; resetting the page resets the flow.
- **Email / Slack delivery** for nudges — not wired to any provider.
- **Authentication and multi-tenancy** — intentionally absent so the prototype opens instantly from a link.

### Explicitly out of scope (next steps if the hypothesis holds)
- Real telemetry ingestion and warehouse connection.
- Auth, RBAC, multi-tenant isolation.
- Persisting interventions and their outcomes.
- Outbound delivery (email/Slack).
- Admin configuration of risk thresholds and scoring weights.

---

*Companion documents: `README.md` (build decisions, file map, success criteria) and `PROMPTS.md` (the iterative prompts used to evolve the prototype).*
