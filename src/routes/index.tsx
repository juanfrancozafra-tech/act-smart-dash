import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/retention/AppShell";
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

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {period.label} · Q2 2026 cohort
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {kpis.churn90.value}% of accounts churn within this window. The dashboard
              below traces where they drop off and what to do about it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard {...kpis.retention90} info={kpiInfo.retention90} />
          <KpiCard {...kpis.churn90} info={kpiInfo.churn90} />
          <KpiCard {...kpis.activated} info={kpiInfo.activated} />
          <KpiCard {...kpis.inviteRate} info={kpiInfo.inviteRate} highlight />
          <KpiCard {...kpis.health} info={kpiInfo.health} />
        </div>

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

        <QuotesStrip quotes={userQuotes} />
      </div>
    </AppShell>
  );
}
