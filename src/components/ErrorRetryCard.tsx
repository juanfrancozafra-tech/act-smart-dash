import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorRetryCard({
  title = "Something went wrong",
  message = "We couldn't load this view. Check your connection and try again.",
  onRetry,
  retryLabel = "Retry",
}: Props) {
  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="size-12 mx-auto rounded-full bg-destructive/10 grid place-items-center">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <h2 className="mt-4 text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground break-words">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            <RefreshCcw className="size-4" /> {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
