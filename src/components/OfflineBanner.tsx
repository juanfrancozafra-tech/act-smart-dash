import { useEffect, useState } from "react";
import { WifiOff, RefreshCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function OfflineBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      // Refetch any data that may have failed while offline.
      queryClient.invalidateQueries();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [queryClient]);

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
          onClick={() => {
            if (navigator.onLine) {
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
