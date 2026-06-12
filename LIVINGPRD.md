# Living PRD — Retention Engine

> A living product requirements document. Updated as the prototype evolves.
> **Status:** Validation prototype · **Live:** https://act-smart-dash.lovable.app

---

## 1. What this product does

Retention Engine is a focused B2B SaaS analytics surface that helps cross-functional teams diagnose **early churn** and act on it from a single screen. It turns account telemetry into a prioritized list of at-risk customers, explains *why* each is at risk, and lets an operator launch a targeted intervention in under a minute — without leaving the dashboard.

It is intentionally narrow: one question, one triage view, one intervention flow.

## 2. Who it's for

Primary users (cross-functional, same surface):
- **Customer Success Managers** — which accounts to call today, and what to say.
- **Growth / Lifecycle PMs** — which churn drivers are systemic vs. account-specific.
- **Product leaders** — single legible view of where activation is breaking down.

Secondary: founders and executives who want a 10-second read on retention health.

## 3. The problem it solves

A B2B SaaS company is losing **30% of customers within the first 90 days**. Users sign up, explore briefly, and disappear. Internal theories are split between onboarding friction, collaboration gaps, feature adoption, and unclear value realization — but no single surface lets the team confirm which one matters most, identify affected accounts, and intervene.

Today this work is spread across BI dashboards (data, no action), CRMs (action, no insight), and email tools (delivery, no targeting). Retention Engine collapses those three jobs into one screen.

## 4. Hypothesis being tested

> Early churn in B2B SaaS is driven less by product quality and more by **collaboration gaps during onboarding**. Accounts that never invite a teammate in the first 14 days are structurally exposed to churn, regardless of how much the primary user explores the product.

Implication: surfacing **team-invite signals + activation milestones** at the account level should let teams predict churn earlier and intervene with a single, targeted nudge — rather than waiting on usage decay or NPS.

The prototype is designed to make this hypothesis obviously correct or obviously wrong within seconds of opening the dashboard.

## 5. Screens and their purpose

### 5.1 Retention Dashboard — `/`
**Purpose:** Triage. Answer *"who is at risk and why?"* in under 10 seconds.
- **Page header** — title, status row, global Period Selector (7d / 30d / 90d / custom), Export Report (.md / .csv / .xls).
- **KPI strip** — 90-day retention, churn rate, activated accounts, team-invite rate, average health. Hover reveals calculation, why-it-matters, and recommended next step.
- **Churn curve** — 12-week trend.
- **Activation funnel** — Sign Up → Onboarding → Team Invite → Activation → Retained.
- **Invite vs. Retention chart** — the headline visual: invited cohorts retain ~2.7× the rate of solo accounts.
- **AI Insights panel** — plain-language summary of the dominant churn driver and a suggested action.
- **At-Risk Accounts table** — sortable (Account, Health, Risk, Last active, ARR); default Risk High → Low; sort persists across navigation.

### 5.2 Account Detail — `/accounts/$id`
**Purpose:** Intervention. Go from *"this account looks bad"* to *"intervention sent"* in under 30 seconds.
- **Client header** — name, industry, CSM, ARR, seats / invited seats.
- **Health gauge** — single-number account health, color-coded by risk tier.
- **Key metric cards** — onboarding completion, features adopted, weekly active users, days since signup.
- **Churn drivers** — ranked list (e.g. *"Solo usage pattern — no teammates invited in 21 days"*).
- **Activity timeline / onboarding checklist** — milestones completed vs. skipped.
- **Intervention panel** — clickable flow: `idle → compose (personalized nudge) → sent (success + projected retention impact)`.

### 5.3 Loading and empty states (behavioral, not separate routes)
- **Skeleton** — `AccountDetailSkeleton` renders during the ~750ms simulated fetch on every account detail visit.
- **Dashboard empty** — appears when the selected period yields no signals (e.g. *Last 7 days* with no at-risk accounts), with setup guidance.
- **Account empty** — appears for accounts with no data yet (seeded *Horizon Data*), explaining why (recently created, sync in progress) and offering refresh / pick-another / return-to-dashboard.

## 6. User flow (first screen → last)

```
 Open shareable URL
        │
        ▼
 Dashboard `/`
   • Read KPI strip
   • Scan invite-vs-retention chart
   • Read AI insight
        │
        ▼
 Sort At-Risk table (Risk High → Low)
        │
        ▼
 Click an account row
        │
        ▼
 Account Detail `/accounts/$id`
   • Read health gauge
   • Read ranked churn drivers
        │
        ▼
 Intervention panel
   idle → compose → sent (impact shown)
```

Supporting flows: change global period → all visualizations recalculate · export report from header · return to dashboard from empty/error states.

## 7. Key metrics

**Product validation (does the surface work?)**
- Time-to-first-insight: top churn driver identified in **≤ 10s**.
- Time-to-intervention: at-risk account → sent nudge in **≤ 30s**.
- Hypothesis legibility: 100% of testers correctly state the invite-vs-retention relationship after one viewing.

**Business metrics surfaced inside the product**
- 90-day Retention Rate (current 70%, target ↑)
- 90-day Churn Rate (current 30%, target ↓)
- Activated Accounts %
- Team Invitation Rate
- Average Health Score
- MRR at risk
- Cohort retention: With Invites 84% vs. No Invites 31%

**Intervention impact (per recommended action)**
- Re-engagement nudge: +12% invites
- Onboarding session: +9% activation
- Invite teammates: +18% retention
- CSM outreach: +22% renewal

## 8. Mocked vs. what would need real data

### Functional (real) in the prototype
- All UI, routing, navigation (TanStack Start v1, React 19, Vite 7).
- Global Period Selector — deterministic recalculation of KPIs, churn curves, funnel, at-risk list (`src/lib/retention-scaling.ts`).
- At-Risk table sorting — full sort / persistence / FLIP animation pipeline.
- Hover states on KPI / insight / chart cards.
- Report Export — generates real `.md` / `.csv` / `.xls` client-side and downloads.
- Skeleton and empty states — triggered by real data conditions, not toggles.
- Intervention flow — clickable end-to-end.
- Custom SVG health gauge, Recharts visualizations, responsive layout.

### Mocked (intentionally, for a validation prototype)
- **All account data, KPIs, trends, drivers, quotes** in `src/lib/retention-data.ts` — no DB, no telemetry.
- **AI insights** — pre-written strings, not a live LLM call.
- **Account detail fetch** — `~750ms` simulated delay to demonstrate the skeleton.
- **Sent interventions** — not persisted; reload resets the flow.
- **Email / Slack delivery** for nudges — not wired to any provider.
- **Authentication and multi-tenancy** — intentionally absent so the prototype opens instantly from a link.

### What would need real data to ship
| Surface | Required source |
| --- | --- |
| KPI strip, churn curve, funnel | Product analytics warehouse (Segment / Snowflake / BigQuery) or event store |
| At-Risk list + health score | Scoring service consuming usage + billing + onboarding events |
| Churn drivers per account | Feature store + rules engine (or trained model) |
| AI insights panel | LLM call over aggregated cohort stats with guardrails |
| Intervention delivery | Email (Resend / Customer.io) and/or Slack provider |
| Intervention outcomes | Write-back store to attribute retention lift |
| Multi-tenant access | Auth (Lovable Cloud / Supabase) + RBAC + row-level scoping |

## 9. Recommended next steps for engineering

**Phase 1 — Make it real for one tenant (2–3 weeks)**
1. Stand up Lovable Cloud: `accounts`, `events`, `health_scores`, `interventions`, `intervention_outcomes` tables with RLS.
2. Replace `retention-data.ts` reads with `createServerFn` loaders backed by the DB.
3. Add minimal ingestion: a `/api/public/events` webhook (HMAC-verified) to accept product events.
4. Add auth + a single-org gate; remove the public landing assumption.

**Phase 2 — Earn the health score (2 weeks)**
5. Implement a transparent scoring service (invite-rate, onboarding completion, WAU/MAU, days-since-active) with versioned weights.
6. Persist daily score snapshots so the churn curve is observed, not synthesized.
7. Add admin UI to tune thresholds without a deploy.

**Phase 3 — Close the intervention loop (2 weeks)**
8. Wire the Compose step to a real delivery provider (Resend for email, Slack for internal nudges).
9. Persist sent interventions and link outcomes via a `recipient_id → next_active_at` join.
10. Replace static "+12% invites" copy with measured, per-template lift.

**Phase 4 — Earn the "AI" label (1–2 weeks)**
11. Move AI Insights to a server function that summarizes cohort deltas via the Lovable AI Gateway; cache per period.
12. Add a feedback control ("useful / not useful") to tune prompts.

**Cross-cutting**
- Replace the simulated `750ms` skeleton trigger with real loader suspense once data is server-fetched.
- Add Playwright smoke tests for the two critical journeys (dashboard → intervention sent, period change → recalculation).
- Telemetry on the product itself: time-to-first-insight and time-to-intervention to validate the success criteria.

---

*Companions: `README.md` (build decisions, file map, success criteria) · `PROMPTS.md` (iterative prompts) · `PRD.md` (static snapshot).*
*This file is a living document — update it as scope, hypothesis, or architecture changes.*
