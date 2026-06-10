# Prompts & Results

This document captures the three iterative prompts used to evolve the Retention Engine prototype, alongside the results each one produced.

---

## 1. Expand — Report Export, Period Selector, Card Hover States

### Prompt

> Enhance the prototype with the following improvements:
>
> **1. Report Export Flow**
> Create a new export experience accessible from both the dashboard and client detail pages.
> - Add an "Export Report" button in the top navigation area.
> - When clicked, open a modal that allows users to:
>   - Select the report format: Markdown (.md), CSV (.csv), Excel (.xls)
>   - Choose the analysis period to export.
>   - Preview the report summary before download.
> - Include primary and secondary actions.
>
> **2. Global Period Selector**
> - Period options: 7d, 30d, 90d, Custom range (date picker).
> - Refresh all visualizations and calculations automatically after selection.
>
> **3. Card Hover States**
> Improve dashboard discoverability by adding hover interactions to all metric and insight cards.
> - On hover: elevate the card with subtle shadow and animation.
> - Display contextual information explaining how the metric is calculated, why it matters, and recommended actions.
> - Change cursor to indicate interactivity.

### Result

- **Global Period Selection** — `src/lib/period-context.tsx` + `src/components/retention/PeriodSelector.tsx` manage timeframes (7d / 30d / 90d / Custom). Deterministic scaling in `src/lib/retention-scaling.ts` adjusts KPIs, churn curves, funnel counts, and at-risk accounts to the active window.
- **Report Export** — `src/components/retention/ExportReportDialog.tsx` opens from the global header. Supports `.md`, `.csv`, and `.xls` formats with a pre-download summary preview. Client-side blob generation triggers the file download immediately.
- **Interactive Hover States** — `KpiCard.tsx` now wraps every metric in a shadcn `HoverCard` exposing *Calculation*, *Why it matters*, and *Recommended next step*. KPI, insight, and chart cards lift on hover (`-translate-y-0.5` + shadow) with a pointer cursor.
- **Integration** — `AppShell.tsx` and `__root.tsx` wrap the app in `PeriodProvider` and expose the controls in the top nav. `index.tsx` and `Charts.tsx` consume the period context for live recalculation.

---

## 2. Behavior — Loading & Empty States (driven by real conditions)

### Prompt (initial)

> Enhance the prototype by improving loading and empty-state experiences to ensure users always receive clear feedback, even when data is loading or unavailable.
>
> **1. Client Details Page – Skeleton Loading State**
> Placeholder versions of: client header, account health score, key metrics, activity timeline, churn risk insights.
>
> **2. Dashboard Empty State**
> When no signals are available, communicate why (recently created, sync in progress, no activity yet), hide unavailable charts, and offer contextual actions.
>
> **3. Client Empty State**
> When client data is unavailable, explain possible reasons and offer recovery actions (refresh, view another client, return to dashboard).

### Prompt (refinement)

> Retire that menu — the states must be part of the prototype behavior according to what's happening and what's visible on the screen.

### Result

- **Skeleton Loading** — `src/components/retention/Skeletons.tsx` defines `AccountDetailSkeleton` mirroring the real page layout with a custom `shimmer` keyframe defined in `src/styles.css`. Triggered automatically by a `~750ms` simulated fetch on every account detail visit.
- **Dashboard Empty State** — `DashboardEmpty` renders when the selected period yields no signals (e.g. switching to *Last 7 days* leaves `atRisk.length === 0 && churnTrend.length <= 1`). Includes setup guidance (connect a source, invite teammates) and an illustration.
- **Account Empty State** — `AccountEmpty` triggers for the seeded *Horizon Data* account (`healthScore: 0`, `invitedSeats: 0`, `weeklyActiveUsers: 0`, etc.), explaining reasons (recently created, sync in progress) with refresh / pick-another / return-to-dashboard actions.
- **Behavior over toggles** — The earlier `StatePreviewMenu` and `validateSearch` plumbing were removed. All three states now surface naturally from real data conditions, not from a manual switcher.

---

## 3. Refine — Stripe-Inspired Dashboard Redesign

### Prompt

> Focus exclusively on redesigning the Dashboard experience.
>
> Use Stripe's dashboard experience as the primary visual and UX reference, emphasizing clarity, information hierarchy, generous whitespace, clean typography, and a professional B2B SaaS aesthetic. Do not copy Stripe directly; instead, adapt its design principles to create a unique, modern interface.
>
> **Palette**
> - Primary `#2563EB` · Primary Hover `#1D4ED8`
> - Background `#F8FAFC` · Card `#FFFFFF`
> - Primary Text `#0F172A` · Secondary Text `#64748B`
>
> The final result should feel like a premium SaaS analytics product combining the visual quality of Stripe with the simplicity and usability expected from modern AI-powered dashboards.

### Result

- **Design tokens** — `src/styles.css` re-baselined to the brief: `--primary` → `#2563EB`, `--background` → `#F8FAFC`, `--foreground` → `#0F172A`, `--muted-foreground` → `#64748B`, plus a Stripe-style elevation scale (`--shadow-xs/sm/md/lg`).
- **Light sidebar** — `AppShell.tsx` swaps the dark sidebar for a white, Stripe-style nav: workspace switcher, grouped sections (*Analyze* / *Manage*), refined active states, and a cohort summary footer.
- **Refined header** — Breadcrumb crumb, centered global search (`Search accounts, users, segments…`), notification bell, avatar. Period selector and Export moved into the page header so primary actions sit with the page title.
- **Page hierarchy** — `index.tsx` opens with a 28px page title (*Account Health*), supporting sentence, and a live-data status row. KPIs render as a unified strip with hairline dividers (using the `bare` variant on `KpiCard`) instead of disconnected cards — a hallmark Stripe pattern.
- **KPI variant** — `KpiCard.tsx` gained a `variant: "card" | "bare"` prop so the same component serves both the dashboard strip and the account detail grid without duplication.
- **Generous whitespace** — Container moved to `max-w-[1440px]` with `px-8 py-7`, KPI strip and main grid get full `mb-8` / `gap-6` breathing room.

---

*This file is committed alongside the source. Because the project is connected to GitHub, saving it here pushes it to the connected repository automatically.*
