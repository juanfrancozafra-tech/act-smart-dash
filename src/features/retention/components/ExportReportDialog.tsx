import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Save, Sheet, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePeriod } from "../data/periodContext";
import type { Account, Driver, FunnelStep, KpiBundle } from "../data/retentionData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyIfRlsError } from "@/lib/rlsToast";
import { handleAuthError } from "@/lib/handleAuthError";


type Format = "md" | "csv" | "xls";

const FORMATS: { key: Format; label: string; ext: string; icon: any; desc: string; mime: string }[] = [
  { key: "md", label: "Markdown", ext: ".md", icon: FileText, desc: "Human-readable summary", mime: "text/markdown" },
  { key: "csv", label: "CSV", ext: ".csv", icon: Sheet, desc: "Account-level raw data", mime: "text/csv" },
  { key: "xls", label: "Excel", ext: ".xls", icon: FileSpreadsheet, desc: "Multi-section spreadsheet", mime: "application/vnd.ms-excel" },
];

interface Props {
  trigger: React.ReactNode;
  accounts: Account[];
  topDrivers: Driver[];
  kpis: KpiBundle;
  funnel: FunnelStep[];
}

export function ExportReportDialog({ trigger, accounts, topDrivers, kpis, funnel }: Props) {
  const { period } = usePeriod();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("md");
  const [saveToCloud, setSaveToCloud] = useState(true);
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const summary = useMemo(
    () => [
      `Retention: ${kpis.retention90.value}%`,
      `Churn: ${kpis.churn90.value}%`,
      `Activation: ${kpis.activated.value}%`,
      `Invite rate: ${kpis.inviteRate.value}%`,
      `Avg health: ${kpis.health.value}/100`,
    ],
    [kpis],
  );

  const download = async () => {
    setBusy(true);
    setExportError(null);
    try {
      const fmt = FORMATS.find((f) => f.key === format)!;
      const filename = `retention-report-${period.key}-${Date.now()}${fmt.ext}`;
      const content =
        format === "md" ? buildMarkdown(period.label, kpis, funnel, accounts, topDrivers)
        : format === "csv" ? buildCsv(accounts)
        : buildXlsHtml(period.label, kpis, funnel, accounts);

      const blob = new Blob([content], { type: fmt.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (saveToCloud) {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userData.user) throw new Error("Not signed in");
        const path = `${userData.user.id}/${filename}`;
        const { error: uploadError } = await supabase.storage.from("reports").upload(path, blob, { contentType: fmt.mime, upsert: false });
        if (uploadError) throw uploadError;
        const { error: metaError } = await supabase.from("exports").insert({
          created_by: userData.user.id,
          period_label: period.label,
          storage_path: path,
          format: format,
          size_bytes: blob.size,
        });
        if (metaError) throw metaError;
        toast.success("Report downloaded and saved to your reports.");
      } else {
        toast.success("Report downloaded.");
      }
      setOpen(false);
    } catch (err) {
      if (handleAuthError(err)) return;
      if (notifyIfRlsError(err)) {
        setExportError("You don't have permission to save reports.");
        return;
      }
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Export retention report</DialogTitle>
          <DialogDescription>Snapshot of the current cohort. Optionally saved to your private reports.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Format</div>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => {
                const Icon = f.icon;
                const active = format === f.key;
                return (
                  <button key={f.key} onClick={() => setFormat(f.key)} className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-surface hover:border-primary/40"}`}>
                    <Icon className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="text-sm font-medium">{f.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-border bg-surface p-3 hover:border-primary/40">
              <input type="checkbox" checked={saveToCloud} onChange={(e) => setSaveToCloud(e.target.checked)} className="mt-0.5" />
              <div>
                <div className="text-sm font-medium flex items-center gap-1.5"><Save className="size-3.5" /> Save to my reports</div>
                <div className="text-[11px] text-muted-foreground">Stored privately in your reports bucket — only you can read them.</div>
              </div>
            </label>
          </section>

          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preview</div>
            <div className="rounded-lg border border-border bg-surface p-4 text-xs space-y-2 max-h-44 overflow-auto">
              <div className="font-semibold text-sm text-foreground">Retention report · {period.label}</div>
              <ul className="space-y-1 text-muted-foreground">
                {summary.map((s) => <li key={s}>· {s}</li>)}
                <li>· {accounts.length} accounts included</li>
                {topDrivers[0] && <li>· Top driver: {topDrivers[0].driver} ({topDrivers[0].pct}%)</li>}
              </ul>
            </div>
          </section>
        </div>

        {exportError && (
          <p role="alert" className="text-[12px] text-destructive leading-snug">
            {exportError}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}><X className="size-4" /> Cancel</Button>
          <Button onClick={download} disabled={busy}><Download className="size-4" /> {busy ? "Working…" : "Download report"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildMarkdown(periodLabel: string, kpis: KpiBundle, funnel: FunnelStep[], accounts: Account[], topDrivers: Driver[]) {
  return `# Retention Report\n\n**Analysis period:** ${periodLabel}\n\n## KPIs\n- Retention rate: ${kpis.retention90.value}%\n- Churn rate: ${kpis.churn90.value}%\n- Activation rate: ${kpis.activated.value}%\n- Team invitation rate: ${kpis.inviteRate.value}%\n- Average health score: ${kpis.health.value}/100\n\n## Activation funnel\n${funnel.map((s) => `- ${s.stage}: ${s.count.toLocaleString()} (${s.pct}%)`).join("\n")}\n\n## Top churn drivers\n${topDrivers.map((d) => `- ${d.driver}: ${d.pct}% (${d.trend})`).join("\n")}\n\n## At-risk accounts\n${accounts.map((a) => `- **${a.name}** (${a.industry}) — health ${a.healthScore}, risk ${a.riskLevel}, primary: ${a.primaryRisk}`).join("\n")}\n\n_Generated by Retain · Account Health Dashboard_\n`;
}

function buildCsv(accounts: Account[]) {
  const header = ["name","industry","seats","invited_seats","health_score","risk_level","primary_risk","days_since_signup","last_active","arr_usd","onboarding_completion","features_adopted","weekly_active_users","csm"];
  const rows = accounts.map((a) => [a.name,a.industry,a.seats,a.invitedSeats,a.healthScore,a.riskLevel,a.primaryRisk,a.daysSinceSignup,a.lastActive,a.arr,a.onboardingCompletion,a.featuresAdopted,a.weeklyActiveUsers,a.csm].map((v) => { const s = String(v).replace(/"/g, '""'); return /[",\n]/.test(s) ? `"${s}"` : s; }).join(","));
  return [header.join(","), ...rows].join("\n");
}

function buildXlsHtml(periodLabel: string, kpis: KpiBundle, funnel: FunnelStep[], accounts: Account[]) {
  const kpiRows: (string | number)[][] = [["Retention rate (%)", kpis.retention90.value],["Churn rate (%)", kpis.churn90.value],["Activation rate (%)", kpis.activated.value],["Team invitation rate (%)", kpis.inviteRate.value],["Average health score (/100)", kpis.health.value]];
  const funnelRows = funnel.map((s) => [s.stage, s.count, s.pct]);
  const accountRows = accounts.map((a) => [a.name,a.industry,a.healthScore,a.riskLevel,a.primaryRisk,a.invitedSeats,a.seats,a.arr]);
  const tbl = (title: string, head: string[], rows: (string | number)[][]) => `<h3>${title}</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return `<html><head><meta charset="utf-8"><title>Retention Report</title></head><body><h1>Retention Report</h1><p><strong>Analysis period:</strong> ${periodLabel}</p>${tbl("KPIs", ["Metric","Value"], kpiRows)}${tbl("Activation funnel", ["Stage","Accounts","%"], funnelRows)}${tbl("At-risk accounts", ["Name","Industry","Health","Risk","Primary risk","Invited","Seats","ARR"], accountRows)}</body></html>`;
}
