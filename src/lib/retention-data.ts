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

export const kpis = {
  retention90: { value: 70, delta: -2.4, label: "90-Day Retention Rate", suffix: "%" },
  churn90: { value: 30, delta: 2.4, label: "90-Day Churn Rate", suffix: "%", inverse: true },
  activated: { value: 54, delta: 3.1, label: "Activated Accounts", suffix: "%" },
  inviteRate: { value: 82, delta: 5.6, label: "Team Invitation Rate", suffix: "%" },
  health: { value: 67, delta: -1.2, label: "Average Health Score", suffix: "/100" },
};

export const churnTrend = [
  { week: "W1", churn: 4.2, retention: 95.8 },
  { week: "W2", churn: 6.1, retention: 93.9 },
  { week: "W3", churn: 8.4, retention: 91.6 },
  { week: "W4", churn: 11.0, retention: 89.0 },
  { week: "W5", churn: 14.3, retention: 85.7 },
  { week: "W6", churn: 17.8, retention: 82.2 },
  { week: "W7", churn: 21.1, retention: 78.9 },
  { week: "W8", churn: 24.0, retention: 76.0 },
  { week: "W9", churn: 26.4, retention: 73.6 },
  { week: "W10", churn: 28.1, retention: 71.9 },
  { week: "W11", churn: 29.3, retention: 70.7 },
  { week: "W12", churn: 30.0, retention: 70.0 },
];

export const activationFunnel = [
  { stage: "Sign Up", count: 1000, pct: 100 },
  { stage: "Onboarding", count: 820, pct: 82 },
  { stage: "Team Invite", count: 670, pct: 67 },
  { stage: "Activation", count: 540, pct: 54 },
  { stage: "Retained", count: 380, pct: 38 },
];

export const inviteVsRetention = [
  { cohort: "With Invites", retained: 84, churned: 16 },
  { cohort: "No Invites", retained: 31, churned: 69 },
];

export const topDrivers = [
  { driver: "No team invitations sent", pct: 41, trend: "+6%" },
  { driver: "Incomplete onboarding", pct: 27, trend: "+2%" },
  { driver: "Low feature adoption", pct: 19, trend: "-1%" },
  { driver: "Unclear value realization", pct: 13, trend: "0%" },
];

export const accounts: Account[] = [
  {
    id: "acme-inc",
    name: "Acme Inc",
    industry: "Logistics",
    seats: 24,
    invitedSeats: 1,
    healthScore: 32,
    primaryRisk: "No team invites",
    riskLevel: "High",
    daysSinceSignup: 41,
    lastActive: "6 days ago",
    arr: 18000,
    onboardingCompletion: 45,
    featuresAdopted: 2,
    featuresTotal: 12,
    weeklyActiveUsers: 1,
    csm: "Priya Shah",
  },
  {
    id: "bright-labs",
    name: "Bright Labs",
    industry: "Biotech",
    seats: 12,
    invitedSeats: 5,
    healthScore: 41,
    primaryRisk: "Incomplete onboarding",
    riskLevel: "Medium",
    daysSinceSignup: 28,
    lastActive: "2 days ago",
    arr: 9600,
    onboardingCompletion: 38,
    featuresAdopted: 3,
    featuresTotal: 12,
    weeklyActiveUsers: 3,
    csm: "Marcus Lin",
  },
  {
    id: "nova-ai",
    name: "Nova AI",
    industry: "AI / ML",
    seats: 18,
    invitedSeats: 14,
    healthScore: 28,
    primaryRisk: "Low feature adoption",
    riskLevel: "High",
    daysSinceSignup: 55,
    lastActive: "8 days ago",
    arr: 24000,
    onboardingCompletion: 80,
    featuresAdopted: 2,
    featuresTotal: 12,
    weeklyActiveUsers: 4,
    csm: "Priya Shah",
  },
  {
    id: "vertex-health",
    name: "Vertex Health",
    industry: "Healthcare",
    seats: 32,
    invitedSeats: 2,
    healthScore: 36,
    primaryRisk: "No team invites",
    riskLevel: "High",
    daysSinceSignup: 33,
    lastActive: "4 days ago",
    arr: 31000,
    onboardingCompletion: 60,
    featuresAdopted: 4,
    featuresTotal: 12,
    weeklyActiveUsers: 2,
    csm: "Elena Ortiz",
  },
  {
    id: "cloudsync",
    name: "CloudSync",
    industry: "DevTools",
    seats: 9,
    invitedSeats: 6,
    healthScore: 49,
    primaryRisk: "Low engagement",
    riskLevel: "Medium",
    daysSinceSignup: 62,
    lastActive: "3 days ago",
    arr: 7200,
    onboardingCompletion: 92,
    featuresAdopted: 5,
    featuresTotal: 12,
    weeklyActiveUsers: 4,
    csm: "Marcus Lin",
  },
];

export const aiInsights = [
  {
    title: "Team invitations are the strongest retention signal",
    body:
      "Accounts that invite ≥3 teammates in week 1 retain at 84% vs 31% for solo accounts. Invitations explain 2.7× more retention variance than onboarding completion.",
    severity: "critical" as const,
    action: "Bulk re-engage 14 solo accounts",
  },
  {
    title: "Onboarding stalls at the 'Connect data source' step",
    body:
      "63% of churned accounts dropped off here. Adding a guided template or sample data could recover an estimated 8 pts of activation.",
    severity: "warning" as const,
    action: "Launch onboarding experiment",
  },
  {
    title: "Acme Inc and Vertex Health share the same churn signature",
    body:
      "Large seat count, single active user, zero invites past day 30. Group intervention recommended for 4 lookalike accounts worth $74K ARR.",
    severity: "info" as const,
    action: "Create cohort intervention",
  },
];

export const recommendedInterventions = [
  { name: "Send re-engagement nudge", impact: "+12% invites", time: "30s" },
  { name: "Schedule onboarding session", impact: "+9% activation", time: "2 min" },
  { name: "Invite additional teammates", impact: "+18% retention", time: "45s" },
  { name: "Trigger CSM outreach", impact: "+22% renewal", time: "1 min" },
];

export const userQuotes = [
  {
    quote:
      "I signed up, poked around for ten minutes, and never figured out what it actually did for my team.",
    person: "Ops Lead",
    context: "churned on day 12",
  },
  {
    quote:
      "Nobody on my team adopted it, so I stopped logging in. It felt like one more tool to babysit.",
    person: "Engineering Manager",
    context: "churned on day 47",
  },
  {
    quote:
      "The value was probably in there somewhere, but I needed it to prove itself in week one, not month three.",
    person: "Founder",
    context: "churned on day 63",
  },
  {
    quote: "We renewed once but couldn't point to a single number that changed because of it.",
    person: "VP Product",
    context: "did not renew",
  },
];

export function getAccount(id: string) {
  return accounts.find((a) => a.id === id);
}
