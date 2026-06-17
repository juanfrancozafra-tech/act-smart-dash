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
  /** Display string — derived from last_active_at when available, else legacy text. */
  lastActive: string;
  /** Raw timestamp when known; null when only the legacy text exists. */
  lastActiveAt: string | null;
  arr: number;
  onboardingCompletion: number;
  featuresAdopted: number;
  featuresTotal: number;
  weeklyActiveUsers: number;
  csm: string;
  cohortId: string | null;
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

export interface Cohort {
  id: string;
  label: string;
  windowDays: number;
  startedAt: string | null;
  isActive: boolean;
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
  cohort: Cohort | null;
  signupCount: number;
}

export function formatRelative(iso: string | null | undefined, fallback: string): string {
  if (!iso) return fallback || "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return fallback || "—";
  const diff = Date.now() - then;
  const mins = Math.max(0, Math.round(diff / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
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
    lastActive: row.last_active_at ? formatRelative(row.last_active_at, row.last_active ?? "") : (row.last_active ?? ""),
    lastActiveAt: row.last_active_at ?? null,
    arr: row.arr,
    onboardingCompletion: row.onboarding_completion,
    featuresAdopted: row.features_adopted,
    featuresTotal: row.features_total,
    weeklyActiveUsers: row.weekly_active_users,
    csm: row.csm,
    cohortId: row.cohort_id ?? null,
  };
}

async function fetchRetentionData(): Promise<RetentionData> {
  const [accountsR, kpisR, churnR, funnelR, inviteR, driversR, insightsR, recsR, quotesR, cohortR] = await Promise.all([
    supabase.from("accounts").select("*"),
    supabase.from("kpis").select("*"),
    supabase.from("churn_trend").select("*").order("ordinal"),
    supabase.from("activation_funnel").select("*").order("ordinal"),
    supabase.from("invite_vs_retention").select("*"),
    supabase.from("top_drivers").select("*").order("ordinal"),
    supabase.from("ai_insights").select("*").order("ordinal"),
    supabase.from("recommended_interventions").select("*").order("ordinal"),
    supabase.from("user_quotes").select("*").order("ordinal"),
    supabase.from("cohorts").select("*").eq("is_active", true).order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const firstError = [accountsR, kpisR, churnR, funnelR, inviteR, driversR, insightsR, recsR, quotesR, cohortR].find((r) => r.error);
  if (firstError?.error) throw new Error(firstError.error.message);

  const kpisByKey: Record<string, Kpi> = {};
  (kpisR.data ?? []).forEach((r: any) => {
    kpisByKey[r.key] = { value: Number(r.value), delta: Number(r.delta), label: r.label, suffix: r.suffix, inverse: r.inverse };
  });

  const accounts = (accountsR.data ?? []).map(mapAccount);

  return {
    accounts,
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
    cohort: cohortR.data
      ? {
          id: cohortR.data.id,
          label: cohortR.data.label,
          windowDays: cohortR.data.window_days,
          startedAt: cohortR.data.started_at,
          isActive: cohortR.data.is_active,
        }
      : null,
    signupCount: accounts.length,
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

// ---------------- New hooks ----------------

export interface KpiDefinition {
  key: string;
  calculation: string;
  why: string;
  recommendation: string | null;
}

export function useKpiDefinitions() {
  return useQuery({
    queryKey: ["kpi-definitions"],
    queryFn: async (): Promise<Record<string, KpiDefinition>> => {
      const { data, error } = await supabase.from("kpi_definitions").select("*");
      if (error) throw new Error(error.message);
      const map: Record<string, KpiDefinition> = {};
      (data ?? []).forEach((r: any) => {
        map[r.key] = { key: r.key, calculation: r.calculation, why: r.why, recommendation: r.recommendation };
      });
      return map;
    },
    staleTime: 5 * 60_000,
  });
}

export interface OnboardingStepRow {
  id: string;
  ordinal: number;
  key: string;
  label: string;
  done: boolean;
  completedAt: string | null;
}

export function useAccountOnboarding(accountId: string) {
  return useQuery({
    queryKey: ["account-onboarding", accountId],
    queryFn: async (): Promise<OnboardingStepRow[]> => {
      const [stepsR, progressR] = await Promise.all([
        supabase.from("onboarding_steps").select("*").order("ordinal"),
        supabase.from("account_onboarding_progress").select("*").eq("account_id", accountId),
      ]);
      if (stepsR.error) throw new Error(stepsR.error.message);
      if (progressR.error) throw new Error(progressR.error.message);
      const progressByStep = new Map<string, any>();
      (progressR.data ?? []).forEach((p: any) => progressByStep.set(p.step_id, p));
      return (stepsR.data ?? []).map((s: any) => {
        const p = progressByStep.get(s.id);
        return {
          id: s.id,
          ordinal: s.ordinal,
          key: s.key,
          label: s.label,
          done: !!p?.completed_at,
          completedAt: p?.completed_at ?? null,
        };
      });
    },
  });
}

export interface RiskSignal {
  id: string;
  rank: number;
  title: string;
  body: string;
  severity: "critical" | "warning" | "info";
}

export function useAccountRiskSignals(accountId: string) {
  return useQuery({
    queryKey: ["account-risk-signals", accountId],
    queryFn: async (): Promise<RiskSignal[]> => {
      const { data, error } = await supabase
        .from("account_risk_signals")
        .select("*")
        .eq("account_id", accountId)
        .order("rank");
      if (error) throw new Error(error.message);
      return (data ?? []).map((r: any) => ({
        id: r.id,
        rank: r.rank,
        title: r.title,
        body: r.body,
        severity: r.severity,
      }));
    },
  });
}

export interface CohortSummary {
  cohort: Cohort | null;
  signupCount: number;
}

export function useCohortSummary() {
  return useQuery({
    queryKey: ["cohort-summary"],
    queryFn: async (): Promise<CohortSummary> => {
      const [cohortR, countR] = await Promise.all([
        supabase.from("cohorts").select("*").eq("is_active", true).order("started_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("accounts").select("*", { count: "exact", head: true }),
      ]);
      if (cohortR.error) throw new Error(cohortR.error.message);
      if (countR.error) throw new Error(countR.error.message);
      return {
        cohort: cohortR.data
          ? {
              id: cohortR.data.id,
              label: cohortR.data.label,
              windowDays: cohortR.data.window_days,
              startedAt: cohortR.data.started_at,
              isActive: cohortR.data.is_active,
            }
          : null,
        signupCount: countR.count ?? 0,
      };
    },
    staleTime: 60_000,
  });
}

export function useFirstAccountId() {
  return useQuery({
    queryKey: ["first-account-id"],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.from("accounts").select("id").order("name").limit(1).maybeSingle();
      if (error) throw new Error(error.message);
      return data?.id ?? null;
    },
    staleTime: 5 * 60_000,
  });
}
