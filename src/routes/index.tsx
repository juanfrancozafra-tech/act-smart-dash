import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { AppShell } from "@/components/retention/AppShell";
import { PeriodSelector } from "@/components/retention/PeriodSelector";
import { ExportReportDialog } from "@/components/retention/ExportReportDialog";
import { KpiCard } from "@/components/retention/KpiCard";
import {
  ChurnTrendChart,
  InviteVsRetentionChart,
  ActivationFunnel,
  TopDriversChart,
} from "@/components/retention/Charts";
import {
  AtRiskTable,
  AIInsightsPanel,
  InterventionsPanel,
  QuotesStrip,
} from "@/components/retention/Panels";
import {
  topDrivers,
  aiInsights,
  recommendedInterventions,
  userQuotes,
} from "@/lib/retention-data";
import { DashboardEmpty } from "@/components/retention/EmptyStates";
import { usePeriod } from "@/lib/period-context";
import {
  getScaledKpis,
  getScaledChurnTrend,
  getScaledFunnel,
  getScaledAtRiskAccounts,
  kpiInfo,
} from "@/lib/retention-scaling";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Retention Dashboard · Retain" },
      { name: "description", content: "Identify churn drivers and launch retention interventions in seconds." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { period } = usePeriod();
  const kpis = useMemo(() => getScaledKpis(period.days), [period.days]);
  const churnTrend = useMemo(() => getScaledChurnTrend(period.days), [period.days]);
  const funnel = useMemo(() => getScaledFunnel(period.days), [period.days]);
  const atRisk = useMemo(() => getScaledAtRiskAccounts(period.days), [period.days]);

  const noSignals = atRisk.length === 0 && churnTrend.length <= 1;

  if (noSignals) {
    return (
      <AppShell>
        <DashboardEmpty />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-8 py-7 max-w-[1440px] mx-auto">
        {/* Page header — Stripe-style: large title, supporting copy, actions */}
        <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
          <div className="min-w-0">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-tight">
              Account Health
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              {period.label.toLowerCase()} · Q2 2026 cohort. {kpis.churn90.value}% of accounts
              churn within this window — trace where they drop off and act on it below.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" />
                Live data
              </span>
              <span className="text-border">·</span>
              <span>Synced 2 min ago</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PeriodSelector />
            <ExportReportDialog
              trigger={
                <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-[#1D4ED8] shadow-xs text-[13px] font-medium transition-colors">
                  <Download className="size-3.5" />
                  Export
                </button>
              }
            />
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px rounded-xl border border-border bg-border overflow-hidden mb-8">
          <KpiCard {...kpis.retention90} info={kpiInfo.retention90} variant="bare" />
          <KpiCard {...kpis.churn90} info={kpiInfo.churn90} variant="bare" />
          <KpiCard {...kpis.activated} info={kpiInfo.activated} variant="bare" />
          <KpiCard {...kpis.inviteRate} info={kpiInfo.inviteRate} highlight variant="bare" />
          <KpiCard {...kpis.health} info={kpiInfo.health} variant="bare" />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChurnTrendChart data={churnTrend} />
            <ActivationFunnel data={funnel} />
            <div className="grid md:grid-cols-2 gap-6">
              <InviteVsRetentionChart />
              <TopDriversChart drivers={topDrivers} />
            </div>
            <AtRiskTable accounts={atRisk.length ? atRisk : []} />
          </div>

          <aside className="space-y-6">
            <AIInsightsPanel insights={aiInsights} />
            <InterventionsPanel interventions={recommendedInterventions} />
          </aside>
        </div>

        <div className="mt-8">
          <QuotesStrip quotes={userQuotes} />
        </div>
      </div>
    </AppShell>
  );
}
