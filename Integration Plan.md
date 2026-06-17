# Integration Plan

## Section 1: M4 Status Check

| Check | Status | Evidence |
| --- | --- | --- |
| Number of screens | **3** | `/` Retention Dashboard (`_authenticated/index.tsx`), `/accounts/$id` Account Detail (`_authenticated/accounts.$id.tsx`), `/auth` Sign-in (`routes/auth.tsx`) |
| Living PRD / product requirements doc | ✅ Yes | `PRD.md`, `LIVINGPRD.md`, `ENGINEERINGHANDOFF.md` at repo root |
| Clean, descriptive variable/function names | ✅ Yes | e.g. `getScaledKpis`, `useRetentionData`, `RecommendedInterventionsPanel`, `handleNewUser` — domain-meaningful throughout |
| GitHub connected | ❌ No | Only Lovable-internal git remotes (`git.private.lovable-gcp.code.storage`, `s3://lovable-repositories/...`); no `github.com` remote |
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
