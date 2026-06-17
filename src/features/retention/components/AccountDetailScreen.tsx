import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Mail,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/features/shell/AppShell";
import { HealthGauge } from "./HealthGauge";
import { AccountDetailSkeleton } from "./AccountDetailSkeleton";
import { AccountEmptyState } from "./AccountEmptyState";
import { InterventionComposer, type InterventionStep } from "./InterventionComposer";
import {
  useAccount,
  useRetentionData,
  useAccountOnboarding,
  useAccountRiskSignals,
  useCohortSummary,
} from "../data/retentionData";
import { useCurrentRole } from "@/hooks/useCurrentRole";


export function AccountDetailScreen({ accountId }: { accountId: string }) {
  const [step, setStep] = useState<InterventionStep>("idle");
  const { data: account, isLoading } = useAccount(accountId);
  const { data: retention } = useRetentionData();
  const { data: onboardingSteps } = useAccountOnboarding(accountId);
  const { data: riskSignals } = useAccountRiskSignals(accountId);
  const { data: cohortSummary } = useCohortSummary();
  const { canWrite } = useCurrentRole();
  const recommendedInterventions = retention?.recommendedInterventions ?? [];
  const windowDays = cohortSummary?.cohort?.windowDays ?? 90;


  if (isLoading) {
    return (
      <AppShell>
        <AccountDetailSkeleton />
      </AppShell>
    );
  }

  if (!account) {
    return (
      <AppShell>
        <div className="p-8 text-sm text-muted-foreground">Account not found.</div>
      </AppShell>
    );
  }

  const hasNoSignal =
    account.weeklyActiveUsers === 0 &&
    account.onboardingCompletion < 10 &&
    account.invitedSeats === 0;

  if (hasNoSignal) {
    return (
      <AppShell>
        <AccountEmptyState accountName={account.name} />
      </AppShell>
    );
  }

  const onboardingStepsList =
    onboardingSteps && onboardingSteps.length > 0
      ? onboardingSteps.map((s) => ({ label: s.label, done: s.done }))
      : [
          { label: "Workspace created", done: true },
          { label: "Profile completed", done: true },
          { label: "First data source connected", done: account.onboardingCompletion > 50 },
          { label: "Team invitations sent", done: account.invitedSeats >= 3 },
          { label: "First report shared", done: false },
        ];

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="rounded-xl border border-border bg-card p-6 flex flex-wrap items-start gap-6">
          <HealthGauge score={account.healthScore} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-semibold tracking-tight">{account.name}</h2>
              <span className="risk-pill-high inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {account.riskLevel} risk
              </span>
              <span className="text-sm text-muted-foreground">{account.industry} · {account.seats} seats · ${(account.arr / 1000).toFixed(1)}K ARR</span>
            </div>
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
              <AlertCircle className="size-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-destructive">Primary churn driver: {account.primaryRisk}.</span>{" "}
                <span className="text-foreground/80">
                  Only {account.invitedSeats} of {account.seats} seats have been invited. Accounts in this
                  pattern churn at 69%. CSM: <span className="font-medium">{account.csm}</span>.
                </span>
              </div>
            </div>
          </div>
          {canWrite ? (
            <div className="flex flex-col gap-2 min-w-[180px]">
              <button
                onClick={() => setStep("compose")}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90"
              >
                <Mail className="size-4" /> Send re-engagement nudge
              </button>
              <button className="inline-flex items-center justify-center gap-2 border border-border rounded-md px-4 py-2.5 text-sm font-medium hover:bg-muted">
                <Calendar className="size-4" /> Schedule CSM call
              </button>
            </div>
          ) : (
            <div className="min-w-[180px] text-[11px] text-muted-foreground self-center">
              View-only access. Ask an admin for CSM permissions to send interventions.
            </div>
          )}
        </div>


        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Metric icon={Users} label="Team activity" value={`${account.weeklyActiveUsers}/${account.seats}`} hint="weekly active users" tone={account.weeklyActiveUsers < 3 ? "bad" : "ok"} />
              <Metric icon={Mail} label="Invitations sent" value={`${account.invitedSeats}/${account.seats}`} hint={account.invitedSeats < 3 ? "below 3-invite threshold" : "healthy"} tone={account.invitedSeats < 3 ? "bad" : "ok"} />
              <Metric icon={TrendingUp} label="Features adopted" value={`${account.featuresAdopted}/${account.featuresTotal}`} hint={`${Math.round((account.featuresAdopted / account.featuresTotal) * 100)}% of core surface`} tone={account.featuresAdopted < 4 ? "warn" : "ok"} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Onboarding progress</h3>
                  <p className="text-xs text-muted-foreground">{account.onboardingCompletion}% complete</p>
                </div>
                <div className="text-xs text-muted-foreground">Day {account.daysSinceSignup} of {windowDays}</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <div className="h-full bg-primary rounded-full" style={{ width: `${account.onboardingCompletion}%` }} />
              </div>
              <ol className="space-y-2">
                {onboardingStepsList.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 text-sm">
                    {s.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                    <span className={s.done ? "" : "text-muted-foreground"}>{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Why this account is likely to churn</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {(riskSignals && riskSignals.length > 0
                  ? riskSignals
                  : [
                      { id: "f1", rank: 1, title: "Solo usage pattern", body: `${account.invitedSeats} of ${account.seats} seats invited — solo accounts churn at 69% vs 16% for teams.`, severity: "critical" as const },
                      { id: "f2", rank: 2, title: "Engagement collapse", body: "Active sessions dropped from 12/wk to 1/wk in the last 14 days.", severity: "warning" as const },
                      { id: "f3", rank: 3, title: "Stalled activation", body: `Reached only ${account.featuresAdopted} of ${account.featuresTotal} core features — typically a leading indicator 18 days before churn.`, severity: "info" as const },
                    ]
                ).map((s) => {
                  const badge =
                    s.severity === "critical"
                      ? "bg-destructive/15 text-destructive"
                      : s.severity === "warning"
                      ? "bg-warning/30 text-warning-foreground"
                      : "bg-primary/15 text-primary";
                  return (
                    <li key={s.id} className="flex gap-3">
                      <span className={`size-5 grid place-items-center rounded-full text-xs font-bold shrink-0 ${badge}`}>{s.rank}</span>
                      <span><strong>{s.title}.</strong> {s.body}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <InterventionComposer step={step} setStep={setStep} accountId={account.id} accountName={account.name} seats={account.seats - account.invitedSeats} />

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Other interventions</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Ranked by projected impact</p>
              <div className="space-y-2">
                {recommendedInterventions.slice(1).map((it) => (
                  <button key={it.name} className="w-full flex items-center justify-between rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors px-3 py-2.5 text-left">
                    <div>
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.time} · {it.impact}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: string; hint: string; tone: "ok" | "warn" | "bad" }) {
  const toneColor = tone === "bad" ? "text-destructive" : tone === "warn" ? "text-warning-foreground" : "text-success";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" /> {label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
      <div className={`text-xs mt-1 ${toneColor}`}>{hint}</div>
    </div>
  );
}
