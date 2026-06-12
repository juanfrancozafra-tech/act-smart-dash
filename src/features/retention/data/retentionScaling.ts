import {
  kpis as baseKpis,
  churnTrend as baseChurnTrend,
  activationFunnel as baseFunnel,
  accounts,
} from "./retention-data";

// Deterministic scaling so the dashboard reacts to the period selector.
// Shorter windows = less observed churn, more apparent retention.
function factorForDays(days: number) {
  const f = Math.min(1, Math.max(0.05, days / 90));
  return f;
}

export function getScaledKpis(days: number) {
  const f = factorForDays(days);
  // churn rises monotonically over the cohort lifetime
  const churn = +(baseKpis.churn90.value * f).toFixed(1);
  const retention = +(100 - churn).toFixed(1);
  const activated = Math.round(20 + (baseKpis.activated.value - 20) * f);
  const inviteRate = Math.round(45 + (baseKpis.inviteRate.value - 45) * f);
  const health = Math.round(80 - (80 - baseKpis.health.value) * f);
  // deltas scale subtly so the trend direction stays the same
  const dscale = 0.5 + 0.5 * f;
  return {
    retention90: {
      ...baseKpis.retention90,
      value: retention,
      delta: +(baseKpis.retention90.delta * dscale).toFixed(1),
    },
    churn90: {
      ...baseKpis.churn90,
      value: churn,
      delta: +(baseKpis.churn90.delta * dscale).toFixed(1),
    },
    activated: {
      ...baseKpis.activated,
      value: activated,
      delta: +(baseKpis.activated.delta * dscale).toFixed(1),
    },
    inviteRate: {
      ...baseKpis.inviteRate,
      value: inviteRate,
      delta: +(baseKpis.inviteRate.delta * dscale).toFixed(1),
    },
    health: {
      ...baseKpis.health,
      value: health,
      delta: +(baseKpis.health.delta * dscale).toFixed(1),
    },
  };
}

export function getScaledChurnTrend(days: number) {
  const weeks = Math.max(1, Math.min(12, Math.ceil(days / 7)));
  return baseChurnTrend.slice(0, weeks);
}

export function getScaledFunnel(days: number) {
  const f = factorForDays(days);
  // Late funnel stages haven't fully matured in shorter windows.
  const weights = [1, 1, 0.92 + 0.08 * f, 0.6 + 0.4 * f, 0.25 + 0.75 * f];
  return baseFunnel.map((s, i) => {
    const pct = Math.round(s.pct * weights[i]);
    const count = Math.round(s.count * weights[i]);
    return { ...s, pct, count };
  });
}

export function getScaledAtRiskAccounts(days: number) {
  return accounts.filter((a) => a.daysSinceSignup <= days || days >= 90);
}

export interface KpiInfo {
  calculation: string;
  why: string;
  recommendation?: string;
}

export const kpiInfo: Record<keyof ReturnType<typeof getScaledKpis>, KpiInfo> = {
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
