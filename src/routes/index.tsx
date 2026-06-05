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
  kpis,
  accounts,
  activationFunnel,
  topDrivers,
  aiInsights,
  recommendedInterventions,
  userQuotes,
} from "@/lib/retention-data";

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
  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">First 90 days · Q2 2026 cohort</h2>
            <p className="text-sm text-muted-foreground mt-1">
              30% of accounts churn within 90 days. The dashboard below traces where they drop off
              and what to do about it.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-muted">
              Last 90 days
            </button>
            <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Export report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard {...kpis.retention90} />
          <KpiCard {...kpis.churn90} />
          <KpiCard {...kpis.activated} />
          <KpiCard {...kpis.inviteRate} highlight />
          <KpiCard {...kpis.health} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChurnTrendChart />
            <ActivationFunnel data={activationFunnel} />
            <div className="grid md:grid-cols-2 gap-6">
              <InviteVsRetentionChart />
              <TopDriversChart drivers={topDrivers} />
            </div>
            <AtRiskTable accounts={accounts} />
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
