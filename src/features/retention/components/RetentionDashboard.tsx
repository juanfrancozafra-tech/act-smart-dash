import { useMemo } from "react";
import { Download } from "lucide-react";
import { AppShell } from "@/features/shell/AppShell";
import { PeriodSelector } from "./PeriodSelector";
import { ExportReportDialog } from "./ExportReportDialog";
import { KpiCard } from "./KpiCard";
import { ChurnTrendChart } from "./ChurnTrendChart";
import { InviteVsRetentionChart } from "./InviteVsRetentionChart";
import { ActivationFunnelChart } from "./ActivationFunnelChart";
import { TopDriversChart } from "./TopDriversChart";
import { AtRiskAccountsTable } from "./AtRiskAccountsTable";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { RecommendedInterventionsPanel } from "./RecommendedInterventionsPanel";
import { UserQuotesStrip } from "./UserQuotesStrip";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { useRetentionData, useKpiDefinitions, type KpiDefinition } from "../data/retentionData";
import { usePeriod } from "../data/periodContext";
import { useCurrentRole } from "@/hooks/useCurrentRole";

import {
  getScaledKpis,
  getScaledChurnTrend,
  getScaledFunnel,
  getScaledAtRiskAccounts,
  kpiInfo,
} from "../data/retentionScaling";

function infoFor(key: string, defs: Record<string, KpiDefinition> | undefined) {
  const d = defs?.[key];
  if (d) return { calculation: d.calculation, why: d.why, recommendation: d.recommendation ?? undefined };
  return kpiInfo[key as keyof typeof kpiInfo];
}

export function RetentionDashboard() {
  const { period } = usePeriod();
  const { data, isLoading, error } = useRetentionData();
  const { data: kpiDefs } = useKpiDefinitions();

  const scaled = useMemo(() => {
    if (!data) return null;
    return {
      kpis: getScaledKpis(data.kpis, period.days),
      churnTrend: getScaledChurnTrend(data.churnTrend, period.days),
      funnel: getScaledFunnel(data.funnel, period.days),
      atRisk: getScaledAtRiskAccounts(data.accounts, period.days),
    };
  }, [data, period.days]);

  if (isLoading || !data || !scaled) {
    return (
      <AppShell>
        <div className="px-8 py-7 max-w-[1440px] mx-auto">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-px rounded-xl border border-border bg-border overflow-hidden mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-card animate-pulse" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
              <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
            </div>
            <div className="h-96 bg-card border border-border rounded-xl animate-pulse" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="p-8 text-sm text-destructive">Failed to load retention data: {(error as Error).message}</div>
      </AppShell>
    );
  }

  const { kpis, churnTrend, funnel, atRisk } = scaled;
  const noSignals = atRisk.length === 0 && churnTrend.length <= 1;

  if (noSignals) {
    return (
      <AppShell>
        <DashboardEmptyState />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-8 py-7 max-w-[1440px] mx-auto">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
          <div className="min-w-0">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-tight">
              Account Health
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              {period.label.toLowerCase()} · {data.cohort?.label ?? "current"} cohort. {kpis.churn90.value}% of accounts
              churn within this window — trace where they drop off and act on it below.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" />
                Live data
              </span>
              <span className="text-border">·</span>
              <span>Synced from your database</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PeriodSelector />
            <ExportReportDialog
              accounts={data.accounts}
              topDrivers={data.topDrivers}
              kpis={kpis}
              funnel={funnel}
              trigger={
                <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-[#1D4ED8] shadow-xs text-[13px] font-medium transition-colors">
                  <Download className="size-3.5" />
                  Export
                </button>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px rounded-xl border border-border bg-border overflow-hidden mb-8">
          <KpiCard {...kpis.retention90} info={infoFor("retention90", kpiDefs)} variant="bare" />
          <KpiCard {...kpis.churn90} info={infoFor("churn90", kpiDefs)} variant="bare" />
          <KpiCard {...kpis.activated} info={infoFor("activated", kpiDefs)} variant="bare" />
          <KpiCard {...kpis.inviteRate} info={infoFor("inviteRate", kpiDefs)} highlight variant="bare" />
          <KpiCard {...kpis.health} info={infoFor("health", kpiDefs)} variant="bare" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChurnTrendChart data={churnTrend} />
            <ActivationFunnelChart data={funnel} />
            <div className="grid md:grid-cols-2 gap-6">
              <InviteVsRetentionChart data={data.inviteVsRetention} />
              <TopDriversChart drivers={data.topDrivers} />
            </div>
            <AtRiskAccountsTable accounts={atRisk} />
          </div>

          <aside className="space-y-6">
            <AIInsightsPanel insights={data.aiInsights} />
            <RecommendedInterventionsPanel interventions={data.recommendedInterventions} />
          </aside>
        </div>

        <div className="mt-8">
          <UserQuotesStrip quotes={data.userQuotes} />
        </div>
      </div>
    </AppShell>
  );
}
