# Integration Plan

## Section 1: M4 Status Check

| Check | Status | Evidence |
| --- | --- | --- |
| Number of screens | **3** | `/` Retention Dashboard (`_authenticated/index.tsx`), `/accounts/$id` Account Detail (`_authenticated/accounts.$id.tsx`), `/auth` Sign-in (`routes/auth.tsx`) |
| Living PRD / product requirements doc | ✅ Yes | `PRD.md`, `LIVINGPRD.md`, `ENGINEERINGHANDOFF.md` at repo root |
| Clean, descriptive variable/function names | ✅ Yes | e.g. `getScaledKpis`, `useRetentionData`, `RecommendedInterventionsPanel`, `handleNewUser` — domain-meaningful throughout |
| GitHub connected | ✅ Yes | Synced two-way with `github.com/juanfrancozafra-tech/act-smart-dash` |
| Database / backend connected | ✅ Yes | Lovable Cloud (Supabase) — 12 public tables, RLS enabled, `reports` storage bucket, auth wired via `@/integrations/supabase/client` |

---

## Section 2: Data Audit — What's Still Hardcoded?

Real DB-backed data already flows through `useRetentionData()` → `accounts`, `kpis`, `churn_trend`, `activation_funnel`, `invite_vs_retention`, `top_drivers`, `ai_insights`, `recommended_interventions`, `user_quotes`. The values below are the remaining hardcoded UI content.

| Screen / Component | Hardcoded Value | What It Should Query |
| --- | --- | --- |
| `RetentionDashboard.tsx` (header subtitle) | `"Q2 2026 cohort"` | `cohorts` table → `SELECT label FROM cohorts WHERE is_active` |
| `RetentionDashboard.tsx` (header) | `"Live data · Synced from your database"` status pill | Derive from `MAX(updated_at)` across retention tables |
| `AppShell.tsx` (sidebar footer) | `"Q2 2026 cohort"`, `"1,000 signups tracked"` | `cohorts` row + `SELECT count(*) FROM accounts WHERE cohort_id = ...` |
| `AppShell.tsx` (header breadcrumb) | `"Customer Success / Account Health"` | Static workspace label OK; per-page title should be derived from route `head().meta.title` |
| `AppShell.tsx` (nav) | Routes `/retention`, `/experiments`, `/accounts/acme-inc`, `/users`, `/settings` | `/accounts/acme-inc` is a hardcoded placeholder ID — should link to `/accounts` index or first account from `accounts` table; other routes don't exist yet |
| `retentionScaling.ts` `getScaledKpis` | All KPI scaling math (factor `days/90`, weights `0.5+0.5f`) | Replace with real time-window aggregation: KPIs computed per `period_days` from `events` / `account_activity` tables |
| `retentionScaling.ts` `kpiInfo` (calculation, why, recommendation strings) | Static prose per KPI | `kpi_definitions` table (key, calculation, why, recommendation) |
| `AccountDetailScreen.tsx` `onboardingSteps` | 5 step labels + `done` booleans derived from heuristics (`onboardingCompletion > 50`, `invitedSeats >= 3`, last step always `false`) | `onboarding_steps` (template) + `account_onboarding_progress` (per account, per step) |
| `AccountDetailScreen.tsx` callout | `"Accounts in this pattern churn at 69%"` | Computed from `accounts` cohort: `churn_rate WHERE invited_seats < 3` |
| `AccountDetailScreen.tsx` "Why this account is likely to churn" | 3 bullets w/ baked numbers: `"69% vs 16%"`, `"12/wk → 1/wk in last 14 days"`, `"18 days before churn"` | `account_risk_signals` table populated by analytics job; per-account weekly session counts from `account_activity` |
| `AccountDetailScreen.tsx` | `"Day {daysSinceSignup} of 90"` (90 hardcoded) | `cohorts.window_days` |
| `Account.lastActive` field | Stored as free-form `TEXT` (e.g. `"2d ago"`) | Should be `timestamptz` and formatted client-side |
| `accounts.csm` field | Stored as `TEXT` name, default `"Unassigned"` | FK to `profiles(id)` (a CSM user) |
| `ExportReportDialog` (per code references) | Local PDF/CSV synthesis from in-memory data | Persist exports to `reports` storage bucket + `exports` metadata table |
| `auth.tsx` | Brand strings `"Retain"`, `"Account health dashboard"` | OK as static brand copy |

---

## Section 3: Schema Design

### Existing tables (from M4 migrations)

| Table | Fields | Status |
| --- | --- | --- |
| `profiles` | `id uuid pk→auth.users`, `full_name text`, `avatar_url text`, `created_at ts`, `updated_at ts` | Existing |
| `user_roles` | `id uuid pk`, `user_id uuid→auth.users`, `role app_role`, `created_at ts`, unique(user_id, role) | Existing |
| `accounts` | `id text pk`, `name text`, `industry text`, `seats int`, `invited_seats int`, `health_score int`, `primary_risk text`, `risk_level text`, `days_since_signup int`, `last_active text`, `arr int`, `onboarding_completion int`, `features_adopted int`, `features_total int`, `weekly_active_users int`, `csm text`, `created_at ts` | Existing |
| `kpis` | `key text pk`, `value numeric`, `delta numeric`, `label text`, `suffix text`, `inverse bool` | Existing |
| `churn_trend` | `week text pk`, `ordinal int`, `churn numeric`, `retention numeric` | Existing |
| `activation_funnel` | `stage text pk`, `ordinal int`, `count int`, `pct numeric` | Existing |
| `invite_vs_retention` | `cohort text pk`, `retained numeric`, `churned numeric` | Existing |
| `top_drivers` | `id uuid pk`, `ordinal int`, `driver text`, `pct numeric`, `trend text` | Existing |
| `ai_insights` | `id uuid pk`, `ordinal int`, `title text`, `body text`, `severity text`, `action text` | Existing |
| `recommended_interventions` | `id uuid pk`, `ordinal int`, `name text`, `impact text`, `time_estimate text` | Existing |
| `user_quotes` | `id uuid pk`, `ordinal int`, `quote text`, `person text`, `context text` | Existing |
| `interventions` | `id uuid pk`, `account_id text→accounts`, `template_key text`, `body text`, `channel text`, `sent_by uuid→auth.users`, `sent_at ts` | Existing |

### Proposed new tables / field changes

| Table | Fields | Status | Purpose |
| --- | --- | --- | --- |
| `cohorts` | `id uuid pk`, `label text` ("Q2 2026"), `window_days int` (default 90), `started_at ts`, `is_active bool` | **New** | Replace hardcoded "Q2 2026 cohort" and "90-day" window strings |
| `accounts` (alter) | add `cohort_id uuid→cohorts`, `last_active_at timestamptz`, `csm_user_id uuid→profiles`; drop reliance on `last_active text` and `csm text` | **Modify** | Real timestamps and CSM as a real user |
| `account_activity` | `id uuid pk`, `account_id text→accounts`, `week_start date`, `active_sessions int`, `weekly_active_users int` | **New** | Powers "12/wk → 1/wk" trend on Account Detail and weekly engagement metrics |
| `onboarding_steps` | `id uuid pk`, `ordinal int`, `key text`, `label text` | **New** | Replaces hardcoded 5-step onboarding list |
| `account_onboarding_progress` | `id uuid pk`, `account_id text→accounts`, `step_id uuid→onboarding_steps`, `completed_at timestamptz null`, unique(account_id, step_id) | **New** | Per-account completion state instead of heuristic booleans |
| `account_risk_signals` | `id uuid pk`, `account_id text→accounts`, `rank int`, `title text`, `body text`, `severity text` ("critical"/"warning"/"info"), `computed_at ts` | **New** | Replaces hardcoded "Why this account is likely to churn" bullets |
| `kpi_definitions` | `key text pk` (matches `kpis.key`), `calculation text`, `why text`, `recommendation text` | **New** | Replaces `kpiInfo` constant in `retentionScaling.ts` |
| `exports` | `id uuid pk`, `created_by uuid→auth.users`, `period_label text`, `storage_path text` (path in `reports` bucket), `format text` ("pdf"/"csv"), `size_bytes int`, `created_at ts` | **New** | Persist exports so users can re-download from history |

---

## Section 4: Auth Model & Permissions

### Roles

The DB already defines `app_role ENUM ('admin', 'csm', 'viewer')`. New signups land as `viewer` via the `handle_new_user` trigger. This maps cleanly to the product:

| Role | Can see | Can do |
| --- | --- | --- |
| **viewer** | Dashboard, account detail, all read-only retention data, own profile | Read-only. Cannot send interventions, cannot manage users, cannot delete exports they don't own |
| **csm** | Everything viewer sees + their assigned accounts highlighted | Send interventions (insert into `interventions` where `sent_by = auth.uid()`), schedule calls, create exports, mark onboarding steps complete for their accounts |
| **admin** | Everything, including the `user_roles` table and all interventions/exports across users | Manage roles, reassign CSMs on accounts, manage cohort definitions, edit KPI definitions, delete any export |

### Row-Level Security rules

Most retention reference tables are organization-wide read; per-user isolation matters for `interventions`, `exports`, `storage.objects`, and `user_roles`.

| Table | Isolation | Policy |
| --- | --- | --- |
| `profiles` | Per-user write, org-wide read | SELECT: any authenticated. UPDATE/INSERT: `auth.uid() = id`. (Already in place.) |
| `user_roles` | Admin-only writes | SELECT: own rows OR `has_role(auth.uid(),'admin')`. ALL: `has_role(auth.uid(),'admin')`. (Already in place.) |
| `accounts`, `kpis`, `churn_trend`, `activation_funnel`, `invite_vs_retention`, `top_drivers`, `ai_insights`, `recommended_interventions`, `user_quotes`, `kpi_definitions`, `cohorts`, `account_activity`, `account_risk_signals`, `onboarding_steps` | Org-wide read for any signed-in user; writes admin/csm only | SELECT: `TO authenticated USING (true)`. INSERT/UPDATE/DELETE: `has_role(auth.uid(),'admin')` (or `'csm'` for `account_*` operational tables) |
| `account_onboarding_progress` | CSM or admin writes for their accounts; org-wide read | SELECT: any authenticated. INSERT/UPDATE: `has_role(auth.uid(),'csm') OR has_role(auth.uid(),'admin')` |
| `interventions` | Per-user (sender) isolation | SELECT: `sent_by = auth.uid() OR has_role(auth.uid(),'admin')`. INSERT: `sent_by = auth.uid() AND (has_role(...,'admin') OR has_role(...,'csm'))`. (Already in place.) |
| `exports` (new) | Per-user isolation | SELECT/DELETE: `created_by = auth.uid() OR has_role(auth.uid(),'admin')`. INSERT: `created_by = auth.uid()` |
| `storage.objects` (bucket `reports`) | Per-user folder isolation | SELECT/INSERT/DELETE: `bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]`. (Already in place.) |

All policies should reuse the existing `public.has_role(uuid, app_role)` SECURITY DEFINER function to avoid recursive RLS evaluation against `user_roles`.

---

## Section 5: Prompts

### Prompt 1 — Schema Expansion

````text
Extend the Lovable Cloud schema for the Retain dashboard and wire every remaining hardcoded UI value to real queries.

1. Create the following new tables (with GRANTs + RLS + policies in the same migration):
   - `cohorts` (id uuid pk, label text, window_days int default 90, started_at timestamptz, is_active boolean)
   - `account_activity` (id uuid pk, account_id text → accounts, week_start date, active_sessions int, weekly_active_users int, unique(account_id, week_start))
   - `onboarding_steps` (id uuid pk, ordinal int, key text unique, label text)
   - `account_onboarding_progress` (id uuid pk, account_id text → accounts, step_id uuid → onboarding_steps, completed_at timestamptz null, unique(account_id, step_id))
   - `account_risk_signals` (id uuid pk, account_id text → accounts, rank int, title text, body text, severity text check in 'critical','warning','info', computed_at timestamptz default now())
   - `kpi_definitions` (key text pk references kpis(key), calculation text, why text, recommendation text)
   - `exports` (id uuid pk, created_by uuid → auth.users, period_label text, storage_path text, format text, size_bytes int, created_at timestamptz default now())

2. Alter `accounts`:
   - add `cohort_id uuid references cohorts(id)`
   - add `last_active_at timestamptz`
   - add `csm_user_id uuid references profiles(id)`
   Keep the existing `last_active` text and `csm` text columns for now; backfill the new columns from them.

3. Seed `cohorts` with one active row (label "Q2 2026", window_days 90). Seed `onboarding_steps` with: Workspace created, Profile completed, First data source connected, Team invitations sent, First report shared. Seed `kpi_definitions` from the `kpiInfo` constant in `src/features/retention/data/retentionScaling.ts`. Seed `account_activity` and `account_risk_signals` with realistic rows for each account in `accounts`.

4. Replace hardcoded UI:
   - `RetentionDashboard.tsx` header subtitle and `AppShell.tsx` sidebar footer: read cohort label + window_days + signup count from `cohorts` + `accounts`.
   - `AppShell.tsx` nav: change the Accounts link from `/accounts/acme-inc` to `/accounts` (or to the first account id queried from `accounts`).
   - `AccountDetailScreen.tsx`: replace the hardcoded `onboardingSteps` array with a join of `onboarding_steps` × `account_onboarding_progress` for the current account. Replace the "Why this account is likely to churn" bullets with rows from `account_risk_signals` ordered by rank. Replace `Day {daysSinceSignup} of 90` with `cohorts.window_days`.
   - `retentionScaling.ts`: replace the static `kpiInfo` map with a `useKpiDefinitions()` hook backed by `kpi_definitions`.
   - `ExportReportDialog.tsx`: on export, upload the generated file to the `reports` storage bucket under `${auth.uid()}/...` and insert a metadata row into `exports`.

5. Keep all `Account.lastActive` UI working by formatting `last_active_at` client-side; fall back to the existing string if null.

Generate the migration, then update `useRetentionData`, `useAccount`, `RetentionDashboard.tsx`, `AccountDetailScreen.tsx`, `AppShell.tsx`, and `ExportReportDialog.tsx` accordingly.
````

### Prompt 2 — Auth UI + Row-Level Security

````text
Harden auth and per-user data isolation for the Retain dashboard.

1. The `/auth` screen already exists with email/password + Google. Keep it but:
   - Add a "Forgot password?" link that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`.
   - Create a public `/reset-password` route that checks for `type=recovery` and calls `supabase.auth.updateUser({ password })`.

2. Header (`AppShell.tsx`):
   - Replace the initials-only avatar with the signed-in user's `full_name` from `public.profiles` (fall back to email). Show it next to the avatar.
   - Keep the existing Sign out button in the dropdown; ensure it calls `queryClient.clear()` before `supabase.auth.signOut()` (already done) and navigates to `/auth`.

3. Roles: the `app_role` enum (`admin`, `csm`, `viewer`) and `has_role()` already exist. Add a `useCurrentRole()` hook that selects from `user_roles` for `auth.uid()` and exposes `{ isAdmin, isCsm, isViewer }`. Use it to:
   - Hide the "Send re-engagement nudge" and "Schedule CSM call" buttons in `AccountDetailScreen.tsx` for `viewer`.
   - Hide the Export button in `RetentionDashboard.tsx` for `viewer`.

4. Tighten RLS:
   - `interventions`: keep existing policies (sender or admin reads; admin/csm inserts where sent_by = auth.uid()).
   - `exports` (new): SELECT/DELETE where `created_by = auth.uid() OR has_role(auth.uid(),'admin')`; INSERT where `created_by = auth.uid()`.
   - `account_onboarding_progress`: SELECT to authenticated; INSERT/UPDATE only for csm/admin.
   - Verify all existing retention reference tables still allow SELECT to authenticated only (no anon).

5. Demo data: seed two test users via Lovable Cloud Users — one admin, one viewer — and assign them rows in `user_roles`. Confirm the viewer sees the dashboard read-only and cannot insert into `interventions`.

Add an inline "You don't have permission to do this" toast when a write fails with a 42501 / RLS error.
````

### Prompt 3 — Edge Cases

````text
Add resilience across every screen of the Retain dashboard.

1. Database/connection failure:
   - In `RetentionDashboard.tsx` and `AccountDetailScreen.tsx`, replace the bare red error text with a centered card showing the error message and a "Retry" button that calls `queryClient.invalidateQueries({ queryKey: ['retention-data'] })` (or `['account', id]`).
   - Add a global `<ErrorBoundary>` in `__root.tsx` so an uncaught render error shows the same retry card instead of a blank screen.

2. Empty data:
   - `DashboardEmptyState.tsx` already exists — make sure it triggers when `accounts` is empty, not only when `atRisk` and `churnTrend` are short. Add a "Seed demo data" button (admin only) that invokes a server function to insert sample rows.
   - `AtRiskAccountsTable`: when filtered list is empty, show "No at-risk accounts in this window — nice work" with a link to widen the period.
   - `AccountEmptyState.tsx`: keep current behavior; add a "Send first invite" CTA that opens `InterventionComposer`.

3. Form submission failure:
   - `auth.tsx`, `InterventionComposer.tsx`, `ExportReportDialog.tsx`, and the future `/reset-password` form: catch the error, show it inline below the field, keep all field values intact (do not reset state), and re-enable the submit button.

4. Loading states:
   - Every `useQuery` consumer should render a skeleton, not a spinner or blank. `AccountDetailSkeleton.tsx` exists; create matching `RetentionDashboardSkeleton`, `AtRiskAccountsTableSkeleton`, and `ChartSkeleton` and use them in their parents.

5. Session expiry:
   - In `src/routes/__root.tsx`, on `supabase.auth.onAuthStateChange` event `SIGNED_OUT` OR `TOKEN_REFRESHED` with null session: `queryClient.clear()` and `router.navigate({ to: '/auth', search: { reason: 'expired' } })`.
   - On `/auth`, if `search.reason === 'expired'`, show a banner: "Your session expired. Please sign in again."
   - Any server fn / supabase call returning a 401 should also trigger the same redirect via a shared `handleAuthError(err)` helper.
````

---

## Section 6: Edge Case Checklist

- **Database connection failure** — All queries surface a retry card, never a blank dashboard.
- **Empty data states** — Zero-account, zero-at-risk, zero-interventions states all show contextual CTAs.
- **Form submission failure** — Auth, intervention composer, and export dialog preserve input and show inline errors.
- **Loading states** — Every screen that fetches data renders a skeleton matching its final layout.
- **Session expiry** — Expired tokens redirect to `/auth` with an explanatory banner, not a 401 white screen.
- **RLS denial** — Viewer attempting to send an intervention sees "You don't have permission" instead of a generic error.
- **OAuth cancellation** — Closing the Google popup returns the user to `/auth` with the form ready to retry.
- **Duplicate intervention send** — Submit button disables while in-flight; rapid clicks insert exactly one `interventions` row.
- **Account not found** — `/accounts/:id` for a deleted account shows "Account not found" with a back link instead of crashing.
- **Period selector edge values** — 7-day and 90-day windows both render without divide-by-zero in `getScaledKpis`.
- **Invalid CSV/PDF export** — Export failure surfaces a toast and does not leave a half-written object in the `reports` bucket.
- **Reset-password without recovery token** — Visiting `/reset-password` directly shows "Open the link from your email" rather than silently logging the user in.
- **Stale realtime data** — `onAuthStateChange` SIGNED_OUT clears the query cache so the next user does not see the previous user's accounts.
- **Long account names / long quotes** — Names truncate with ellipsis; user quotes wrap without breaking the strip layout.
- **Slow network** — Skeletons remain visible up to 10s; after that an inline "Still loading…" hint appears.
- **No CSM assigned** — Account detail falls back to "Unassigned" without breaking the primary-risk callout.

---

## Section 7: Stress Test Plan

### Test 1 — Offline mid-action (connection failure)

**Steps:** Sign in as a CSM. Open `/accounts/acme-inc`. Click "Send re-engagement nudge" and fill the composer. Open DevTools → Network → set throttling to "Offline". Click Send.

**Expected:** Submit button shows a loading state, then fails. An inline red error appears below the textarea ("Network error — your message was not sent"). The composer keeps the typed body, channel, and template selection. The Retry button re-submits cleanly once the network is restored. No partial row appears in `interventions`.

### Test 2 — Fresh signup, zero data (empty state)

**Steps:** Open `/auth` in an incognito window. Sign up with a brand-new email. Land on `/`.

**Expected:** Because the new user is a `viewer` and the seed data is org-wide-readable, the dashboard renders with existing accounts. If the project is reseeded so the new user sees no rows, the `DashboardEmptyState` appears with "No accounts to analyze yet" + an admin-only "Seed demo data" button (hidden for the viewer). Navigating to `/accounts/<unknown-id>` shows the "Account not found" state. The header avatar shows the new user's initials from email. No console errors, no white screens.

### Test 3 — Spam-click send (rapid repeated actions)

**Steps:** Sign in as a CSM. Open `/accounts/acme-inc`. Open the intervention composer, type a message. Click "Send" 10 times in under a second.

**Expected:** Exactly one `INSERT` into `interventions` (verify with a SQL count). The button disables on the first click and stays disabled until the request resolves. The success toast appears once. The composer resets to idle and the new intervention shows up in any "Other interventions" history. Re-opening the composer and sending again works normally.

---

## Section 8: Handoff Note

```markdown
# Retain — Handoff Note

## What's Real vs. What's Mocked

| Feature | Status | Notes |
| --- | --- | --- |
| Email/password sign-in | Real | Supabase Auth via `@/integrations/supabase/client` |
| Google sign-in | Real | Routed through `@/integrations/lovable` broker |
| Password reset | Mocked | No `/reset-password` route yet |
| Dashboard KPIs | Real (data) / Mocked (period scaling) | Values come from `kpis` table; period scaling is client-side math in `retentionScaling.ts` |
| Churn trend / Activation funnel / Invite vs retention / Top drivers | Real | Tables: `churn_trend`, `activation_funnel`, `invite_vs_retention`, `top_drivers` |
| AI insights / Recommended interventions / User quotes | Real (seeded) | Static seed data in their respective tables |
| Accounts list + Account detail | Real | `accounts` table |
| Onboarding steps on Account detail | Mocked | Hardcoded 5-step array with heuristic `done` flags |
| "Why this account will churn" bullets | Mocked | Hardcoded copy with interpolated account fields |
| Cohort label "Q2 2026" / "1,000 signups" | Mocked | Hardcoded strings in `RetentionDashboard.tsx` and `AppShell.tsx` |
| Send intervention | Real (write) | Inserts into `interventions` (RLS: csm/admin only) |
| Export report | Partial | Generates file client-side; not yet persisted to `reports` bucket |
| Roles & permissions | Real (schema) / Mocked (UI) | `app_role` enum + `user_roles` + `has_role()` exist; UI does not yet gate buttons by role |

## Database Schema Summary

- `profiles` — user profile linked to `auth.users`
- `user_roles` — role assignments (`admin`, `csm`, `viewer`)
- `accounts` — customer accounts with health, ARR, seats, activation metrics
- `kpis` — top-line KPI values for the dashboard
- `churn_trend` — weekly churn vs retention series
- `activation_funnel` — stage-by-stage activation counts
- `invite_vs_retention` — retention by invite cohort
- `top_drivers` — ranked churn drivers
- `ai_insights` — narrative insights shown in the right rail
- `recommended_interventions` — playbook items
- `user_quotes` — qualitative quotes strip
- `interventions` — log of sent interventions per account
- (storage) `reports` bucket — per-user folder for exported reports

## Auth & RLS Model

- **viewer** (default on signup): read-only access to all dashboard and account data; cannot send interventions or export.
- **csm**: read-only on reference data; can `INSERT` into `interventions` where `sent_by = auth.uid()`; can read own interventions.
- **admin**: full read on `user_roles`, `interventions`, and all retention tables; can manage roles via `has_role()`-gated policies.
- Storage `reports` bucket: every object must live under `auth.uid()/...`; users can only read/write/delete their own folder.

## Edge Cases Handled

_To be filled after the lab._

## Known Gaps

_To be filled after stress testing._

## Live URL

_To be filled after deployment._
```
