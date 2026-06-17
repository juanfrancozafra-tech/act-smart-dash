import { Link } from "@tanstack/react-router";
import { RefreshCcw, ArrowLeft, Inbox, Activity, Mail } from "lucide-react";

interface Props {
  accountName?: string;
  onSendFirstInvite?: () => void;
}

export function AccountEmptyState({ accountName, onSendFirstInvite }: Props) {
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
          {onSendFirstInvite && (
            <button
              onClick={onSendFirstInvite}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              <Mail className="size-4" /> Send first invite
            </button>
          )}
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-surface text-sm font-medium hover:bg-muted">
            <RefreshCcw className="size-4" /> Refresh data
          </button>
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
