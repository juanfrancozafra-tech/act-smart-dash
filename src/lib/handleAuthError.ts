import { supabase } from "@/integrations/supabase/client";

/**
 * Detect auth failures (401 / JWT expired / invalid refresh token) and force a
 * clean sign-out + redirect to /auth?reason=expired. Returns true when the
 * error was an auth error and was handled.
 */
export function handleAuthError(err: unknown): boolean {
  const e = err as { status?: number; code?: string; message?: string; name?: string } | null;
  const status = e?.status;
  const code = e?.code;
  const msg = (e?.message ?? "").toLowerCase();

  const isAuthError =
    status === 401 ||
    code === "PGRST301" ||
    code === "401" ||
    /jwt expired/.test(msg) ||
    /invalid refresh token/.test(msg) ||
    /refresh token not found/.test(msg) ||
    /not authenticated/.test(msg) ||
    /unauthorized/.test(msg);

  if (!isAuthError) return false;

  if (typeof window !== "undefined") {
    // Fire and forget — listeners in __root.tsx will clear cache + redirect.
    void supabase.auth.signOut().catch(() => {});
    if (!window.location.pathname.startsWith("/auth")) {
      window.location.replace("/auth?reason=expired");
    }
  }
  return true;
}
