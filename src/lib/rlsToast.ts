import { toast } from "sonner";

/**
 * Show a friendly permission toast for Postgres RLS / privilege errors.
 * Returns true when the error was an RLS denial (caller can stop further handling).
 */
export function notifyIfRlsError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  const code = e?.code;
  const msg = e?.message ?? "";
  if (
    code === "42501" ||
    code === "PGRST301" ||
    /row-level security/i.test(msg) ||
    /permission denied/i.test(msg)
  ) {
    toast.error("You don't have permission to do this");
    return true;
  }
  return false;
}
