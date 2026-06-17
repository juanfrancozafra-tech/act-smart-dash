import { useEffect, useState } from "react";
import { WifiOff, RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

async function probeOnline(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;
  try {
    // Cache-busted same-origin request; resolves as long as the network reaches the server.
    await fetch(`/favicon.ico?_=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  }
}

export function OfflineBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const setStatus = (next: boolean) => {
      if (cancelled) return;
      setOnline((prev) => {
        if (prev === next) return prev;
        if (next) queryClient.invalidateQueries();
        return next;
      });
    };

    const check = async () => setStatus(await probeOnline());

    const startPolling = () => {
      if (pollId) return;
      pollId = setInterval(check, 4000);
    };
    const stopPolling = () => {
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
    };

    const handleOnline = () => {
      void check();
    };
    const handleOffline = () => {
      setStatus(false);
      startPolling();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial reconciliation: navigator.onLine can lie, so verify with a probe.
    void check();

    // Always re-check when the tab is refocused.
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Poll only while we believe we're offline.
    if (typeof navigator !== "undefined" && !navigator.onLine) startPolling();

    return () => {
      cancelled = true;
      stopPolling();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [queryClient]);

  // Whenever offline flips true, ensure we keep polling until recovery.
  useEffect(() => {
    if (online) return;
    const id = setInterval(async () => {
      if (await probeOnline()) {
        setOnline(true);
        queryClient.invalidateQueries();
      }
    }, 4000);
    return () => clearInterval(id);
  }, [online, queryClient]);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] flex justify-center px-3 pt-3"
    >
      <div className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-destructive/30 bg-destructive text-destructive-foreground shadow-lg px-4 py-3">
        <WifiOff className="size-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">You're offline</p>
          <p className="text-xs opacity-90 leading-snug mt-0.5">
            Check your internet connection. We'll reconnect automatically.
          </p>
        </div>
        <button
          onClick={async () => {
            if (await probeOnline()) {
              setOnline(true);
              queryClient.invalidateQueries();
            }
          }}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-background/15 hover:bg-background/25 text-xs font-medium transition-colors shrink-0"
        >
          <RefreshCcw className="size-3.5" /> Retry
        </button>
      </div>
    </div>
  );
}
