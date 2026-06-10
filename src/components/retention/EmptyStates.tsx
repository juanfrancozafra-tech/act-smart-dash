import { Link } from "@tanstack/react-router";
import {
  Database,
  UsersRound,
  Rocket,
  Clock,
  Plug,
  RefreshCcw,
  ArrowLeft,
  Inbox,
  Activity,
} from "lucide-react";

export function DashboardEmpty() {
  const suggestions = [
    {
      icon: Plug,
      title: "Connect a data source",
      body: "Sync product analytics, billing, or CRM events so Retain can compute health scores.",
    },
    {
      icon: UsersRound,
      title: "Invite your team",
      body: "Add CSMs and PMs so signals and interventions can be assigned to owners.",
    },
    {
      icon: Rocket,
      title: "Complete onboarding",
      body: "Define your activation event and target cohort to anchor every metric.",
    },
    {
      icon: Clock,
      title: "Wait for activity",
      body: "We need ~24h of usage signals before the first churn driver is reliable.",
    },
  ];

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
        <EmptyIllustration />
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">No data available yet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          We haven't received enough signal to compute retention, churn drivers, or account
          health. Complete the setup steps below to populate your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            <Plug className="size-4" /> Connect data source
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-surface text-sm font-medium hover:bg-muted"
          >
            View example dashboard
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-foreground/5 hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AccountEmpty({ accountName }: { accountName?: string }) {
  const reasons = [
    "Account was created in the last few hours and data is still landing.",
    "Sync with your product analytics warehouse is in progress.",
    "No user activity has been recorded for this workspace yet.",
  ];

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
        <div className="size-14 mx-auto rounded-xl bg-muted grid place-items-center">
          <Inbox className="size-7 text-muted-foreground" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          {accountName ? `No data for ${accountName} yet` : "No client data available"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          We don't have enough information to render this client's health, activity, or
          churn signals. Charts and metrics are hidden until data arrives.
        </p>

        <ul className="mt-5 mx-auto max-w-md text-left space-y-2 text-sm text-muted-foreground">
          {reasons.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <Activity className="size-4 text-primary mt-0.5 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            <RefreshCcw className="size-4" /> Refresh data
          </button>
          <Link
            to="/accounts/$id"
            params={{ id: "bright-labs" }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-surface text-sm font-medium hover:bg-muted"
          >
            View another client
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-surface text-sm font-medium hover:bg-muted"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <div className="relative mx-auto size-28">
      <div className="absolute inset-0 rounded-full bg-primary/8 animate-pulse" />
      <div className="absolute inset-3 rounded-full bg-primary/12" />
      <div className="absolute inset-0 grid place-items-center">
        <Database className="size-10 text-primary" />
      </div>
    </div>
  );
}
