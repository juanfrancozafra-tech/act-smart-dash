import type { Account, ChurnPoint, FunnelStep, KpiBundle } from "./retentionData";

function factorForDays(days: number) {
  return Math.min(1, Math.max(0.05, days / 90));
}

export function getScaledKpis(base: KpiBundle, days: number): KpiBundle {
  const f = factorForDays(days);
  const churn = +(base.churn90.value * f).toFixed(1);
  const retention = +(100 - churn).toFixed(1);
  const activated = Math.round(20 + (base.activated.value - 20) * f);
  const inviteRate = Math.round(45 + (base.inviteRate.value - 45) * f);
  const health = Math.round(80 - (80 - base.health.value) * f);
  const dscale = 0.5 + 0.5 * f;
  return {
    retention90: { ...base.retention90, value: retention, delta: +(base.retention90.delta * dscale).toFixed(1) },
    churn90: { ...base.churn90, value: churn, delta: +(base.churn90.delta * dscale).toFixed(1) },
    activated: { ...base.activated, value: activated, delta: +(base.activated.delta * dscale).toFixed(1) },
    inviteRate: { ...base.inviteRate, value: inviteRate, delta: +(base.inviteRate.delta * dscale).toFixed(1) },
    health: { ...base.health, value: health, delta: +(base.health.delta * dscale).toFixed(1) },
  };
}

export function getScaledChurnTrend(base: ChurnPoint[], days: number): ChurnPoint[] {
  const weeks = Math.max(1, Math.min(12, Math.ceil(days / 7)));
  return base.slice(0, weeks);
}

export function getScaledFunnel(base: FunnelStep[], days: number): FunnelStep[] {
  const f = factorForDays(days);
  const weights = [1, 1, 0.92 + 0.08 * f, 0.6 + 0.4 * f, 0.25 + 0.75 * f];
  return base.map((s, i) => ({ ...s, pct: Math.round(s.pct * weights[i]), count: Math.round(s.count * weights[i]) }));
}

export function getScaledAtRiskAccounts(base: Account[], days: number): Account[] {
  return base.filter((a) => a.daysSinceSignup <= days || days >= 90);
}

export interface KpiInfo { calculation: string; why: string; recommendation?: string }

export const kpiInfo: Record<keyof KpiBundle, KpiInfo> = {
  retention90: {
    calculation: "Accounts still active at day N ÷ total signups in the cohort.",
    why: "Retention is the single best proxy for product-market fit in B2B SaaS.",
    recommendation: "Drill into the activation funnel to see where the cohort drops off.",
  },
  churn90: {
    calculation: "1 − retention rate for the selected window.",
    why: "Every 1pt of early churn compounds into ~3pt of ARR loss over 12 months.",
    recommendation: "Open the top churn drivers panel and run a cohort intervention.",
  },
  activated: {
    calculation: "Accounts that completed 3+ core actions ÷ total signups.",
    why: "Activated accounts retain at 3× the rate of non-activated ones.",
    recommendation: "Inspect the activation funnel for the steepest drop.",
  },
  inviteRate: {
    calculation: "Accounts that invited ≥1 teammate ÷ total signups.",
    why: "The strongest predictor of 90-day retention in this cohort (2.7× lift).",
    recommendation: "Trigger the re-engagement nudge for solo accounts.",
  },
  health: {
    calculation: "Weighted blend of usage, invites, onboarding and feature adoption.",
    why: "A leading indicator — typically moves 14–21 days before churn.",
    recommendation: "Filter at-risk accounts by score < 40 and triage.",
  },
};
