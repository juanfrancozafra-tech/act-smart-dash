import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Mail,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Sparkles,
  Send,
  Check,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/retention/AppShell";
import { HealthGauge } from "@/components/retention/Charts";
import { AccountDetailSkeleton } from "@/components/retention/Skeletons";
import { AccountEmpty } from "@/components/retention/EmptyStates";
import { getAccount, recommendedInterventions } from "@/lib/retention-data";

export const Route = createFileRoute("/accounts/$id")({
  loader: ({ params }) => {
    const account = getAccount(params.id);
    if (!account) throw notFound();
    return { account };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.account.name ?? "Account"} · Retain` },
      { name: "description", content: "Account health, churn risk and one-click retention interventions." },
    ],
  }),
  component: AccountDetail,
});

type FlowStep = "idle" | "compose" | "sent";

function AccountDetail() {
  const { account } = Route.useLoaderData();
  const [step, setStep] = useState<FlowStep>("idle");

  // Simulate the brief client-side fetch every time the user lands on a client
  // detail page — the skeleton tracks the real loading window.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 750);
    return () => clearTimeout(t);
  }, [account.id]);

  if (loading) {
    return (
      <AppShell>
        <AccountDetailSkeleton />
      </AppShell>
    );
  }

  // Brand-new accounts have no recorded signals yet — show the empty state
  // instead of rendering meaningless zeroed-out charts.
  const hasNoSignal =
    account.weeklyActiveUsers === 0 &&
    account.onboardingCompletion < 10 &&
    account.invitedSeats === 0;

  if (hasNoSignal) {
    return (
      <AppShell>
        <AccountEmpty accountName={account.name} />
      </AppShell>
    );
  }


  const onboardingSteps = [
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

        {/* Header */}
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
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Metric
                icon={Users}
                label="Team activity"
                value={`${account.weeklyActiveUsers}/${account.seats}`}
                hint="weekly active users"
                tone={account.weeklyActiveUsers < 3 ? "bad" : "ok"}
              />
              <Metric
                icon={Mail}
                label="Invitations sent"
                value={`${account.invitedSeats}/${account.seats}`}
                hint={account.invitedSeats < 3 ? "below 3-invite threshold" : "healthy"}
                tone={account.invitedSeats < 3 ? "bad" : "ok"}
              />
              <Metric
                icon={TrendingUp}
                label="Features adopted"
                value={`${account.featuresAdopted}/${account.featuresTotal}`}
                hint={`${Math.round((account.featuresAdopted / account.featuresTotal) * 100)}% of core surface`}
                tone={account.featuresAdopted < 4 ? "warn" : "ok"}
              />
            </div>

            {/* Onboarding */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Onboarding progress</h3>
                  <p className="text-xs text-muted-foreground">{account.onboardingCompletion}% complete</p>
                </div>
                <div className="text-xs text-muted-foreground">Day {account.daysSinceSignup} of 90</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${account.onboardingCompletion}%` }}
                />
              </div>
              <ol className="space-y-2">
                {onboardingSteps.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 text-sm">
                    {s.done ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                    <span className={s.done ? "" : "text-muted-foreground"}>{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Churn explanation */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Why this account is likely to churn</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                <li className="flex gap-3">
                  <span className="size-5 grid place-items-center rounded-full bg-destructive/15 text-destructive text-xs font-bold shrink-0">1</span>
                  <span>
                    <strong>Solo usage pattern.</strong> {account.invitedSeats} of {account.seats} seats invited —
                    solo accounts churn at 69% vs 16% for teams.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="size-5 grid place-items-center rounded-full bg-warning/30 text-warning-foreground text-xs font-bold shrink-0">2</span>
                  <span>
                    <strong>Engagement collapse.</strong> Active sessions dropped from 12/wk to 1/wk in the last 14 days.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="size-5 grid place-items-center rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0">3</span>
                  <span>
                    <strong>Stalled activation.</strong> Reached only {account.featuresAdopted} of {account.featuresTotal} core
                    features — typically a leading indicator 18 days before churn.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right rail: intervention flow */}
          <aside className="space-y-6">
            <ReengageFlow
              step={step}
              setStep={setStep}
              accountName={account.name}
              seats={account.seats - account.invitedSeats}
            />

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Other interventions</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Ranked by projected impact</p>
              <div className="space-y-2">
                {recommendedInterventions.slice(1).map((it) => (
                  <button
                    key={it.name}
                    className="w-full flex items-center justify-between rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors px-3 py-2.5 text-left"
                  >
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

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  tone: "ok" | "warn" | "bad";
}) {
  const toneColor =
    tone === "bad" ? "text-destructive" : tone === "warn" ? "text-warning-foreground" : "text-success";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
      <div className={`text-xs mt-1 ${toneColor}`}>{hint}</div>
    </div>
  );
}

function ReengageFlow({
  step,
  setStep,
  accountName,
  seats,
}: {
  step: FlowStep;
  setStep: (s: FlowStep) => void;
  accountName: string;
  seats: number;
}) {
  return (
    <div className="rounded-xl border border-primary/40 bg-card p-5 ring-1 ring-primary/15">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Re-engagement nudge</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-primary">
          30s flow
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Send a templated, personalized message to the account owner.
      </p>

      {step === "idle" && (
        <button
          onClick={() => setStep("compose")}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90"
        >
          Start intervention
        </button>
      )}

      {step === "compose" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              To · Account owner at {accountName}
            </div>
            <div className="font-medium mb-2">
              Unlock collaboration with your team
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Hi there — we noticed your team hasn't been invited yet. Accounts that invite{" "}
              {seats > 0 ? `their remaining ${seats} teammates` : "their teammates"} in the first
              month see 84% retention. Invite your team to unlock collaboration insights and
              increase adoption across your organization.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                Personalized
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                Includes invite link
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("idle")}
              className="flex-1 border border-border rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep("sent")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/90"
            >
              <Send className="size-3.5" /> Confirm send
            </button>
          </div>
        </div>
      )}

      {step === "sent" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-success/30 bg-success/10 p-3 flex items-start gap-2">
            <div className="size-7 rounded-full bg-success grid place-items-center shrink-0">
              <Check className="size-4 text-success-foreground" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-foreground">Nudge sent</div>
              <p className="text-muted-foreground text-xs mt-0.5">
                Delivered to account owner. Tracking opens, clicks, and invite events.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs">
            <div className="font-semibold text-foreground mb-1.5">Expected impact</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>· +3.2 invites projected within 7 days</li>
              <li>· +18 health-score points if 3+ seats activate</li>
              <li>· Account moves from <span className="text-destructive font-medium">High</span> → <span className="text-warning-foreground font-medium">Medium</span> risk</li>
            </ul>
          </div>
          <button
            onClick={() => setStep("idle")}
            className="w-full border border-border rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
