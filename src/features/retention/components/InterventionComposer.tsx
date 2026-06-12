import { useState } from "react";
import { Mail, Send, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type InterventionStep = "idle" | "compose" | "sent";

export function InterventionComposer({
  step,
  setStep,
  accountId,
  accountName,
  seats,
}: {
  step: InterventionStep;
  setStep: (s: InterventionStep) => void;
  accountId: string;
  accountName: string;
  seats: number;
}) {
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const body = `Hi there — we noticed your team hasn't been invited yet. Accounts that invite ${
        seats > 0 ? `their remaining ${seats} teammates` : "their teammates"
      } in the first month see 84% retention.`;
      const { error } = await supabase.from("interventions").insert({
        account_id: accountId,
        template_key: "re_engagement_nudge",
        body,
        channel: "email",
        sent_by: userData.user.id,
      });
      if (error) throw error;
      setStep("sent");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send";
      if (/row-level security/i.test(msg)) {
        toast.error("Only admins and CSMs can send interventions. Ask an admin to grant you the CSM role.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/40 bg-card p-5 ring-1 ring-primary/15">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Re-engagement nudge</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-primary">30s flow</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Send a templated, personalized message to the account owner.</p>

      {step === "idle" && (
        <button onClick={() => setStep("compose")} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          Start intervention
        </button>
      )}

      {step === "compose" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">To · Account owner at {accountName}</div>
            <div className="font-medium mb-2">Unlock collaboration with your team</div>
            <p className="text-foreground/80 leading-relaxed">
              Hi there — we noticed your team hasn't been invited yet. Accounts that invite{" "}
              {seats > 0 ? `their remaining ${seats} teammates` : "their teammates"} in the first month see 84% retention.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep("idle")} className="flex-1 border border-border rounded-md px-3 py-2 text-sm hover:bg-muted">Cancel</button>
            <button onClick={send} disabled={sending} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              <Send className="size-3.5" /> {sending ? "Sending…" : "Confirm send"}
            </button>
          </div>
        </div>
      )}

      {step === "sent" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-success/30 bg-success/10 p-3 flex items-start gap-2">
            <div className="size-7 rounded-full bg-success grid place-items-center shrink-0"><Check className="size-4 text-success-foreground" /></div>
            <div className="text-sm">
              <div className="font-semibold text-foreground">Nudge logged</div>
              <p className="text-muted-foreground text-xs mt-0.5">Saved to your interventions table. Delivery integration is next.</p>
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
          <button onClick={() => setStep("idle")} className="w-full border border-border rounded-md px-3 py-2 text-sm hover:bg-muted">Done</button>
        </div>
      )}
    </div>
  );
}
