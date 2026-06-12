import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RiskLevel = "High" | "Medium" | "Low";

export interface Account {
  id: string;
  name: string;
  industry: string;
  seats: number;
  invitedSeats: number;
  healthScore: number;
  primaryRisk: string;
  riskLevel: RiskLevel;
  daysSinceSignup: number;
  lastActive: string;
  arr: number;
  onboardingCompletion: number;
  featuresAdopted: number;
  featuresTotal: number;
  weeklyActiveUsers: number;
  csm: string;
}

export interface Kpi {
  value: number;
  delta: number;
  label: string;
  suffix: string;
  inverse?: boolean;
}

export interface KpiBundle {
  retention90: Kpi;
  churn90: Kpi;
  activated: Kpi;
  inviteRate: Kpi;
  health: Kpi;
}

export interface ChurnPoint { week: string; churn: number; retention: number }
export interface FunnelStep { stage: string; count: number; pct: number }
export interface InviteCohort { cohort: string; retained: number; churned: number }
export interface Driver { driver: string; pct: number; trend: string }
export interface AiInsight { title: string; body: string; severity: "critical" | "warning" | "info"; action: string }
export interface RecommendedIntervention { name: string; impact: string; time: string }
export interface UserQuote { quote: string; person: string; context: string }

export interface RetentionData {
  accounts: Account[];
  kpis: KpiBundle;
  churnTrend: ChurnPoint[];
  funnel: FunnelStep[];
  inviteVsRetention: InviteCohort[];
  topDrivers: Driver[];
  aiInsights: AiInsight[];
  recommendedInterventions: RecommendedIntervention[];
  userQuotes: UserQuote[];
}

function mapAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    seats: row.seats,
    invitedSeats: row.invited_seats,
    healthScore: row.health_score,
    primaryRisk: row.primary_risk,
    riskLevel: row.risk_level as RiskLevel,
    daysSinceSignup: row.days_since_signup,
    lastActive: row.last_active,
    arr: row.arr,
    onboardingCompletion: row.onboarding_completion,
    featuresAdopted: row.features_adopted,
    featuresTotal: row.features_total,
    weeklyActiveUsers: row.weekly_active_users,
    csm: row.csm,
  };
}

async function fetchRetentionData(): Promise<RetentionData> {
  const [accountsR, kpisR, churnR, funnelR, inviteR, driversR, insightsR, recsR, quotesR] = await Promise.all([
    supabase.from("accounts").select("*"),
    supabase.from("kpis").select("*"),
    supabase.from("churn_trend").select("*").order("ordinal"),
    supabase.from("activation_funnel").select("*").order("ordinal"),
    supabase.from("invite_vs_retention").select("*"),
    supabase.from("top_drivers").select("*").order("ordinal"),
    supabase.from("ai_insights").select("*").order("ordinal"),
    supabase.from("recommended_interventions").select("*").order("ordinal"),
    supabase.from("user_quotes").select("*").order("ordinal"),
  ]);

  const firstError = [accountsR, kpisR, churnR, funnelR, inviteR, driversR, insightsR, recsR, quotesR].find((r) => r.error);
  if (firstError?.error) throw new Error(firstError.error.message);

  const kpisByKey: Record<string, Kpi> = {};
  (kpisR.data ?? []).forEach((r: any) => {
    kpisByKey[r.key] = { value: Number(r.value), delta: Number(r.delta), label: r.label, suffix: r.suffix, inverse: r.inverse };
  });

  return {
    accounts: (accountsR.data ?? []).map(mapAccount),
    kpis: {
      retention90: kpisByKey.retention90,
      churn90: kpisByKey.churn90,
      activated: kpisByKey.activated,
      inviteRate: kpisByKey.inviteRate,
      health: kpisByKey.health,
    },
    churnTrend: (churnR.data ?? []).map((r: any) => ({ week: r.week, churn: Number(r.churn), retention: Number(r.retention) })),
    funnel: (funnelR.data ?? []).map((r: any) => ({ stage: r.stage, count: r.count, pct: Number(r.pct) })),
    inviteVsRetention: (inviteR.data ?? []).map((r: any) => ({ cohort: r.cohort, retained: Number(r.retained), churned: Number(r.churned) })),
    topDrivers: (driversR.data ?? []).map((r: any) => ({ driver: r.driver, pct: Number(r.pct), trend: r.trend })),
    aiInsights: (insightsR.data ?? []).map((r: any) => ({ title: r.title, body: r.body, severity: r.severity, action: r.action })),
    recommendedInterventions: (recsR.data ?? []).map((r: any) => ({ name: r.name, impact: r.impact, time: r.time_estimate })),
    userQuotes: (quotesR.data ?? []).map((r: any) => ({ quote: r.quote, person: r.person, context: r.context })),
  };
}

export function useRetentionData() {
  return useQuery({ queryKey: ["retention-data"], queryFn: fetchRetentionData, staleTime: 60_000 });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? mapAccount(data) : null;
    },
  });
}
