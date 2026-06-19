# Engineering Handoff — Retention Engine

> Practical onboarding for the engineer picking this prototype up.
> Companion to `LIVINGPRD.md` (product) and `README.md` (build).

---

## Start here (15-minute orientation)

1. **Read the product context first** — `LIVINGPRD.md` §1–4. The whole codebase exists to test one hypothesis (team invites → retention). Don't refactor before you understand that.
2. **Run it.** `bun install && bun run dev`. Open `/`. Click any row in the At-Risk table. Click an intervention. You've now seen 100% of the user-visible surface.
3. **Read the file map** below, then open these four files in order. They are the spine of the app:
   - `src/features/retention/data/retentionData.ts` — the mock "database".
   - `src/features/retention/data/retentionScaling.ts` — period selector math.
   - `src/features/retention/data/periodContext.tsx` — global state for the period.
   - `src/features/retention/components/RetentionDashboard.tsx` — how the dashboard composes the rest.
4. **Skim** `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/accounts.$id.tsx`. Routes are thin shells — all logic lives in features.
5. **Pick your first task** from "3 biggest technical decisions" below. None of them are cosmetic; each unblocks a real shipping decision.

### Project conventions (non-obvious)
- **Feature folders, not type folders.** All retention code lives under `src/features/retention/{data,components}`. `src/components/ui/` is shadcn primitives only.
- **Data files are pure TS, no JSX.** Components import from `data/`; data never imports from `components/`. Don't break this.
- **Routes are thin.** A route file should set head/meta and render one feature component. No business logic.
- **Tokens, not hex.** All color/spacing/radius come from `src/styles.css` semantic tokens. Never hardcode `text-white` / `bg-[#...]`.
- **TanStack Start v1 + React 19 + Vite 7.** No `src/pages/`. No `react-router-dom`. Use `@tanstack/react-router`.

---

## Component inventory

### Routes (`src/routes/`)
| File | Purpose |
| --- | --- |
| `__root.tsx` | Root layout, head/meta, `QueryClientProvider`, `PeriodProvider`, `<ErrorBoundary>`, `<OfflineBanner>`, error + 404 boundaries. Subscribes to `supabase.auth.onAuthStateChange` — on `SIGNED_OUT` / token-refresh-with-null clears the query cache and redirects to `/auth?reason=expired`. |
| `index.tsx` | `/` — thin shell that renders `<AppShell><RetentionDashboard /></AppShell>`. |
| `accounts.$id.tsx` | `/accounts/:id` — thin shell rendering `<AccountDetailScreen />` with the route param. |
| `auth.tsx` | `/auth` — email/password + Google. Includes "Forgot password?" (`resetPasswordForEmail` → `/reset-password`) and a session-expired banner when `?reason=expired`. |
| `reset-password.tsx` | `/reset-password` — public; requires `type=recovery` in the URL fragment, then calls `supabase.auth.updateUser({ password })`. |
| `_authenticated/route.tsx` | Pathless auth gate; child routes redirect to `/auth` when there's no session. |

### App shell (`src/features/shell/`)
| Component | Purpose |
| --- | --- |
| `AppShell` | Page chrome: title bar, period selector slot, export button, content area. Wraps every screen. |

### Retention data layer (`src/features/retention/data/`) — pure TS, no JSX
| File | Purpose |
| --- | --- |
| `retentionData.ts` | The mock dataset: KPIs, churn series, funnel, at-risk accounts, drivers, quotes, AI insights. **Single source of truth for everything visible.** |
| `retentionScaling.ts` | Deterministic transforms that recompute KPIs/series/funnel/at-risk for the selected period (7d/30d/90d/custom). Pure functions, fully testable. |
| `periodContext.tsx` | React context exposing `{ period, setPeriod }`. Consumed by every chart and the At-Risk table. |

### Retention components (`src/features/retention/components/`)
| Component | Purpose |
| --- | --- |
| `RetentionDashboard` | Composition root for `/`. Lays out the **hero At-Risk table** (above the fold), KPI strip, charts, AI panel, and the full At-Risk table. Holds dashboard-level state (sort, empty detection). The hero block filters `atRisk` to `High`/`Medium`, sorts by `RISK_RANK desc` then `healthScore asc`, slices to 6, and renders `<AtRiskAccountsTable variant="hero" />`. Falls back to "lowest 6 health" if no High/Medium rows exist. |
| `AccountDetailScreen` | Composition root for `/accounts/$id`. Owns the simulated 750ms fetch, skeleton, empty state, and intervention flow state machine. |
| `KpiCard` | Single KPI tile with hover popover (definition, why-it-matters, next step). Rendered five times in a strip. |
| `ChurnTrendChart` | 12-week churn line (Recharts). Reads scaled data from period context. |
| `ActivationFunnelChart` | Sign Up → Onboarding → Team Invite → Activation → Retained funnel. |
| `InviteVsRetentionChart` | The hero/headline visual: invited vs. solo cohort retention curves. |
| `TopDriversChart` | Ranked bar chart of dominant churn drivers across the portfolio. |
| `AIInsightsPanel` | Plain-language summary + suggested action. Currently static text from `retentionData.ts`. |
| `AtRiskAccountsTable` | Sortable account table with two variants. **`variant="hero"`** (above-the-fold triage block): title *"Accounts Requiring Immediate Attention"*, primary-tinted border/ring, columns `Account · Health · Primary risk · Risk · Activation · Recommended next action · ARR`. **`variant="default"`** (full list, below the fold): columns `Account · Health · Primary risk · Risk · Invites · Last active · ARR`. Owns sort persistence (`localStorage` key `retain:atrisk-sort`) and FLIP row animation. `activationStatus()` derives the color-coded onboarding badge (`<40%` danger, `<80%` warn, else ok); `nextAction()` derives the recommended next step from invite ratio, onboarding %, primary-risk text, and health score. Links every row to `/accounts/$id`. |
| `RecommendedInterventionsPanel` | Cards of pre-baked recommended actions with projected lift. |
| `UserQuotesStrip` | Static qualitative quotes supporting the narrative. |
| `HealthGauge` | Custom SVG single-number gauge, color-coded by risk tier. Account detail only. |
| `InterventionComposer` | The `idle → compose → sent` micro-flow. Renders the projected retention impact on send. Not persisted. |
| `PeriodSelector` | 7d / 30d / 90d / custom segmented control. Writes to `periodContext`. |
| `ExportReportDialog` | Generates `.md` / `.csv` / `.xls` client-side from current scaled data and triggers download. No backend. |
| `DashboardEmptyState` | Shown when the selected period yields no signals. |
| `AccountEmptyState` | Shown for accounts with no data yet (e.g. seeded *Horizon Data*). |
| `AccountDetailSkeleton` | Skeleton shown during the simulated 750ms fetch on every account visit. |

### Shared
- `src/components/ui/*` — unmodified shadcn primitives. Treat as a vendor library.
- `src/components/ErrorBoundary.tsx` — global render-error boundary; renders `<ErrorRetryCard>` on caught errors. Wrapped around the route tree in `__root.tsx`.
- `src/components/ErrorRetryCard.tsx` — centered card with error message + Retry button. Used by `RetentionDashboard`, `AccountDetailScreen`, and `ErrorBoundary` so query, render, and network failures share one visual.
- `src/components/OfflineBanner.tsx` — actively probes connectivity with `HEAD /?offlineProbe=…` (3.5s timeout, abortable, `cache: no-store`). Shows only when a real request fails; auto-dismisses on the next successful probe or `online` event. Mounted once in `__root.tsx`.
- `src/features/retention/components/skeletons.tsx` — shared loading skeletons for the dashboard and account detail.
- `src/hooks/useCurrentRole.ts` — reads the current user's role from `user_roles` via `has_role`. Drives read-only UI for `viewer` and gates write affordances for `csm` / `admin`.
- `src/lib/handleAuthError.ts` — single helper for 401s from server fns / supabase calls; clears the query cache and redirects to `/auth?reason=expired`.
- `src/lib/rlsToast.ts` — detects Postgres `42501` / RLS errors on writes and surfaces the inline "You don't have permission to do this" toast.
- `src/lib/seed.functions.ts` — admin-only server fn that seeds the two demo users (admin + viewer) and their `user_roles` rows.
- `src/hooks/*` — generic React hooks. No retention logic.
- `src/lib/lovable-error-reporting.ts` — error reporter wired into the root error boundary.

---

## Data model — real vs. mocked

### What's real (in the prototype)
| Surface | Where | Notes |
| --- | --- | --- |
| Routing, head/meta, error boundaries | `src/routes/*`, `__root.tsx` | TanStack Start v1, fully real. |
| Period selector recalculation | `data/retentionScaling.ts` + `data/periodContext.tsx` | Deterministic, pure functions. Safe to unit-test as-is. |
| At-Risk table sort + FLIP animation | `AtRiskAccountsTable.tsx` | Sort state persists across navigation via context/localStorage. |
| Report export | `ExportReportDialog.tsx` | Real `.md` / `.csv` / `.xls` generated client-side from current scaled data. |
| Skeleton + empty states | `AccountDetailScreen.tsx`, `*EmptyState.tsx` | Triggered by real conditions (timer, empty dataset), not dev toggles. |
| Intervention micro-flow UI | `InterventionComposer.tsx` | Full state machine, just not persisted. |

### What's mocked
| Surface | Where | What needs to change |
| --- | --- | --- |
| Every account, KPI, trend, driver, quote | `data/retentionData.ts` | Replace with server fns reading the warehouse / DB. |
| AI Insights copy | `data/retentionData.ts` (strings) | Replace with a server fn calling the Lovable AI Gateway over real cohort deltas. |
| Account detail fetch | `AccountDetailScreen.tsx` (`setTimeout(750)`) | Replace with a real loader + suspense. |
| Sent interventions | `InterventionComposer.tsx` | Persist to `interventions` table; wire delivery (Resend / Slack). |
| Per-template lift (`+12% invites`, etc.) | `data/retentionData.ts` | Compute from `intervention_outcomes` join, don't hardcode. |

### What's now real (auth + resilience pass)
| Surface | Where | Notes |
| --- | --- | --- |
| Auth (email/password + Google, password reset) | `routes/auth.tsx`, `routes/reset-password.tsx` | Lovable Cloud / Supabase. No anonymous sign-ups. |
| Auth gate | `routes/_authenticated/route.tsx` | All protected screens live under this layout. |
| Role-based access | `hooks/useCurrentRole.ts`, `user_roles` table, `has_role()` SECURITY DEFINER fn | Roles: `admin`, `csm`, `viewer`. Viewer = read-only UI; writes gated server-side by RLS. |
| Per-user data isolation | RLS on `interventions` (and other write tables) | SELECT to `authenticated`; INSERT/UPDATE only for `csm` / `admin`. Reference tables: SELECT to `authenticated` only (no anon). |
| RLS write-failure UX | `lib/rlsToast.ts` | Detects Postgres `42501` and shows "You don't have permission to do this". |
| 401 / session expiry | `lib/handleAuthError.ts` + `__root.tsx` auth listener | Clears query cache, redirects to `/auth?reason=expired`, shows banner. |
| Global render-error recovery | `components/ErrorBoundary.tsx` + `ErrorRetryCard.tsx` | Uncaught render errors and query errors share one retry card. Retry calls `queryClient.invalidateQueries(...)`. |
| Offline handling | `components/OfflineBanner.tsx` | Probes `/?offlineProbe=…` instead of trusting `navigator.onLine`; auto-dismisses when the network returns. |

### Target schema (when you flip the switch — guidance, not code)
- `accounts(id, name, industry, csm_id, arr, seats, invited_seats, created_at)`
- `events(id, account_id, user_id, type, ts, props jsonb)` — append-only product events
- `health_scores(account_id, ts, score, risk_tier, weights_version)` — daily snapshot
- `churn_drivers(account_id, ts, driver_key, weight)` — ranked per account
- `interventions(id, account_id, template_key, body, sent_by, sent_at, channel)` — RLS live today
- `intervention_outcomes(intervention_id, retained_30d boolean, retained_90d boolean, measured_at)`
- `user_roles(user_id, role app_role)` — live today; queried via `has_role(uid, role)`

RLS on every table scoped by `org_id` (add to all write tables alongside the existing role-based policies). Reads via `createServerFn` with `requireSupabaseAuth`. Writes via server fns; webhooks under `/api/public/*` with HMAC verification.

---

## The 3 biggest technical decisions

### 1. Where does the data come from — warehouse pull or event ingestion?
**The call:** Do you (a) pull aggregates from an existing analytics warehouse (Snowflake / BigQuery / Segment) on a schedule, or (b) own ingestion via a `/api/public/events` webhook and compute everything yourself?

- **Pull from warehouse** — fastest to a real number, no ingestion infra, but you inherit the warehouse's freshness (often 6–24h). Health scores stale. Cheaper.
- **Own ingestion** — sub-minute freshness, full control over the event schema, but you're now operating an event pipeline (idempotency, replay, backpressure, retention). More to run.
- **Hybrid (recommended default)** — warehouse for historical KPIs and the churn curve; live webhook for the at-risk list and health score recalculation. Costs you two code paths but matches how the product is actually consumed (history is "good enough" stale, triage must be fresh).

This decision shapes the schema, the cron surface, and what `createServerFn` loaders look like. Make it before writing any DB code.

### 2. How is the health score computed — and how transparent is it?
**The call:** Rules engine with versioned weights, or a trained model?

- **Rules engine (recommended for v1)** — explicit weights (invite rate 30%, onboarding 25%, WAU/MAU 25%, recency 20%). CSMs can read it. Admin UI tunes thresholds without a deploy. Easy to debug "why is this account red?".
- **Trained model** — better calibration once you have ground-truth churn labels (need ≥6 months of labeled data). Worse explainability — you'll need SHAP-style attributions to populate "churn drivers", and CSMs will distrust it.
- **Either way:** persist daily snapshots (`health_scores` table). The churn curve must be *observed*, not *recomputed from current state* — otherwise you can't show real trends and you can't backtest weight changes.

This decision determines whether "Churn drivers" in `AccountDetailScreen` is a simple `ORDER BY weight DESC` or a feature-attribution pipeline.

### 3. How are interventions delivered, and how is lift attributed?
**The call:** Who sends the nudge, and how do you prove it worked?

- **Delivery channel:** Resend (email) is the lowest-friction default. Slack works for internal CSM nudges but doesn't reach end users. Customer.io if lifecycle marketing already owns the relationship — but then you're integrating, not owning.
- **Attribution model:** the prototype shows fake "+12%" copy. To replace it honestly you need (a) a `recipient_id` on each intervention, (b) a forward-looking join to `events` to see if the recipient came back / invited a teammate within N days, and (c) ideally a holdout cohort (don't send to 10% of eligible accounts) so the lift number is causal, not just correlated.
- **Idempotency + safety rails:** rate-limit per account per template per week. Never send from a server fn without a confirmed user action — accidental loops here email real customers.

This decision determines whether the intervention panel becomes a real growth tool or stays a UI demo.

---

## Things that will bite you

- **Don't import data files into other data files's components, and don't import components into data files.** The boundary is intentional — breaking it makes the warehouse-swap in decision #1 painful.
- **Don't add a loader to a public route that calls a `requireSupabaseAuth` server fn.** It will 401 during SSR/prerender and fail the build. Use `useServerFn` + `useQuery` in the component, or move the route under `_authenticated/`.
- **Don't edit `src/routeTree.gen.ts`.** It's regenerated.
- **The 750ms skeleton timer in `AccountDetailScreen` is a prop, not a constant.** Remove it the moment a real loader exists — don't leave both.
- **Period scaling is deterministic by design.** If you swap to real data, keep the same function signatures in `retentionScaling.ts` so the charts don't need rewriting; just change what feeds them.
- **Every `CREATE TABLE public.*` migration MUST be paired with explicit `GRANT`s.** Lovable Cloud does not grant default Data API privileges. Forgetting them produces opaque "permission denied" errors at runtime, not at migration time.
- **Roles live in `user_roles`, not on `profiles`.** Never check role from the client by reading a column on the user — privilege-escalation risk. Use `useCurrentRole` for UI and `has_role()` (SECURITY DEFINER) for RLS.
- **Don't trust `navigator.onLine`.** The `OfflineBanner` learned this the hard way; always probe a real endpoint with a short timeout before declaring "offline".
- **Don't bypass `handleAuthError`.** A direct `supabase.auth.signOut()` or ad-hoc redirect on 401 fragments the session-expiry UX. Funnel every 401 through the helper so the cache is cleared and the banner reason is set.

---

*Last updated alongside the auth-hardening + resilience pass (auth gate, `user_roles` / RLS, `ErrorBoundary`, `ErrorRetryCard`, `OfflineBanner`, `handleAuthError`, `rlsToast`). Keep this file in sync when components move or the data layer changes.*
