# Refactor Plan

Goal: feature-grouped files, descriptive component names, data logic separated from display, and a README that documents the new structure.

## New folder structure

```text
src/
  features/
    retention/
      data/                         # pure data + scaling (no JSX)
        retentionData.ts            # from lib/retention-data.ts
        retentionScaling.ts         # from lib/retention-scaling.ts
        periodContext.tsx           # from lib/period-context.tsx
      components/
        RetentionDashboard.tsx      # was routes/index.tsx body
        AccountDetailScreen.tsx     # was routes/accounts.$id.tsx body
        KpiStrip.tsx                # was KpiCard.tsx (+ strip wrapper)
        ChurnTrendChart.tsx         # split from Charts.tsx
        ActivationFunnelChart.tsx
        InviteVsRetentionChart.tsx  # = CollaborationPayoff chart
        TopDriversChart.tsx
        AtRiskAccountsTable.tsx     # split from Panels.tsx
        AIInsightsPanel.tsx
        RecommendedInterventions.tsx
        UserQuotesStrip.tsx
        InterventionComposer.tsx    # InviteFlow / compose→sent flow
        DashboardEmptyState.tsx     # from EmptyStates.tsx
        AccountDetailSkeleton.tsx   # from Skeletons.tsx
        PeriodSelector.tsx
        ExportReportDialog.tsx
    shell/
      AppShell.tsx
      SidebarNav.tsx                # extracted from AppShell
      TopBar.tsx                    # extracted from AppShell
  components/ui/                    # shadcn primitives (unchanged)
  hooks/                            # unchanged
  lib/
    utils.ts                        # cn() only
    error-capture.ts, error-page.ts, lovable-error-reporting.ts, config.server.ts, api/
  routes/                           # thin route files that import features
    __root.tsx
    index.tsx                       # renders <RetentionDashboard/>
    accounts.$id.tsx                # renders <AccountDetailScreen/>
```

## Renames (descriptive)

| Old | New |
|---|---|
| `Charts.tsx` (4 charts) | one file per chart in `features/retention/components/` |
| `Panels.tsx` (AtRiskTable, AIInsightsPanel, InterventionsPanel, QuotesStrip, intervention composer) | `AtRiskAccountsTable`, `AIInsightsPanel`, `RecommendedInterventions`, `UserQuotesStrip`, `InterventionComposer` |
| `KpiCard.tsx` | `KpiStrip.tsx` (exports `KpiCard` + `KpiStrip`) |
| `EmptyStates.tsx` | `DashboardEmptyState.tsx` |
| `Skeletons.tsx` | `AccountDetailSkeleton.tsx` |
| `routes/index.tsx` body | `RetentionDashboard` |
| `routes/accounts.$id.tsx` body | `AccountDetailScreen` |
| `lib/retention-data.ts` | `features/retention/data/retentionData.ts` |
| `lib/retention-scaling.ts` | `features/retention/data/retentionScaling.ts` |
| `lib/period-context.tsx` | `features/retention/data/periodContext.tsx` |

## Data vs. display separation

- All `features/retention/data/*` files are pure TS — no React components, no JSX.
- Components import data via `@/features/retention/data/*` only; no inline mock data inside display components.
- Move the small data shapes currently inlined in `Panels.tsx` (intervention copy, sort persistence keys) into `data/` constants.

## Route files become thin

`routes/index.tsx` and `routes/accounts.$id.tsx` keep their `createFileRoute` + `head()` and render the screen component. No business logic.

## README.md

Add a top-level `README.md` section "Project Structure" documenting:
- `features/<name>/{components,data}` convention
- when to add to `features/` vs `components/ui/` vs `lib/`
- route files are thin shells
- naming rule: components describe what the user sees (e.g. `RetentionDashboard`, `InterventionComposer`)

## Out of scope

- No behavior changes, no styling changes, no new features.
- `components/ui/*` (shadcn) stays as-is.
- `LIVINGPRD.md`, `PRD.md`, `PROMPTS.md` untouched.

## Risks

- Many import paths change; I'll update every importer in the same batch as each move and rely on the build to catch stragglers.
- `routeTree.gen.ts` is auto-regenerated — not edited by hand.
