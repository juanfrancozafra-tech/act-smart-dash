import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Sheet, X } from "lucide-react";
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
import { getScaledKpis, getScaledFunnel } from "../data/retentionScaling";
import { accounts, topDrivers } from "../data/retentionData";

type Format = "md" | "csv" | "xls";

const FORMATS: { key: Format; label: string; ext: string; icon: any; desc: string }[] = [
  { key: "md", label: "Markdown", ext: ".md", icon: FileText, desc: "Human-readable summary" },
  { key: "csv", label: "CSV", ext: ".csv", icon: Sheet, desc: "Account-level raw data" },
  { key: "xls", label: "Excel", ext: ".xls", icon: FileSpreadsheet, desc: "Multi-section spreadsheet" },
];

export function ExportReportDialog({ trigger }: { trigger: React.ReactNode }) {
  const { period } = usePeriod();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("md");

  const kpis = useMemo(() => getScaledKpis(period.days), [period.days]);
  const funnel = useMemo(() => getScaledFunnel(period.days), [period.days]);

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

  const download = () => {
    const fmt = FORMATS.find((f) => f.key === format)!;
    const filename = `retention-report-${period.key}${fmt.ext}`;
    let content = "";
    let mime = "text/plain";

    if (format === "md") {
      mime = "text/markdown";
      content = buildMarkdown(period.label, kpis, funnel);
    } else if (format === "csv") {
      mime = "text/csv";
      content = buildCsv();
    } else {
      mime = "application/vnd.ms-excel";
      content = buildXlsHtml(period.label, kpis, funnel);
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Export retention report</DialogTitle>
          <DialogDescription>
            Snapshot of the current cohort for sharing with Product, Growth, and Customer Success.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Format
            </div>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => {
                const Icon = f.icon;
                const active = format === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFormat(f.key)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="text-sm font-medium">{f.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Analysis period
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
              <span>{period.label}</span>
              <span className="text-xs text-muted-foreground">{period.days} days</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Change the period using the selector in the header.
            </p>
          </section>

          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Preview
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 text-xs space-y-2 max-h-44 overflow-auto">
              <div className="font-semibold text-sm text-foreground">
                Retention report · {period.label}
              </div>
              <ul className="space-y-1 text-muted-foreground">
                {summary.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
                <li>· {accounts.length} at-risk accounts included</li>
                <li>· Top driver: {topDrivers[0].driver} ({topDrivers[0].pct}%)</li>
              </ul>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X className="size-4" /> Cancel
          </Button>
          <Button onClick={download}>
            <Download className="size-4" /> Download report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildMarkdown(
  periodLabel: string,
  kpis: ReturnType<typeof getScaledKpis>,
  funnel: ReturnType<typeof getScaledFunnel>,
) {
  return `# Retention Report

**Analysis period:** ${periodLabel}

## KPIs
- Retention rate: ${kpis.retention90.value}%
- Churn rate: ${kpis.churn90.value}%
- Activation rate: ${kpis.activated.value}%
- Team invitation rate: ${kpis.inviteRate.value}%
- Average health score: ${kpis.health.value}/100

## Activation funnel
${funnel.map((s) => `- ${s.stage}: ${s.count.toLocaleString()} (${s.pct}%)`).join("\n")}

## Top churn drivers
${topDrivers.map((d) => `- ${d.driver}: ${d.pct}% (${d.trend})`).join("\n")}

## At-risk accounts
${accounts
  .map(
    (a) =>
      `- **${a.name}** (${a.industry}) — health ${a.healthScore}, risk ${a.riskLevel}, primary: ${a.primaryRisk}`,
  )
  .join("\n")}

_Generated by Retain · Account Health Dashboard_
`;
}

function buildCsv() {
  const header = [
    "name",
    "industry",
    "seats",
    "invited_seats",
    "health_score",
    "risk_level",
    "primary_risk",
    "days_since_signup",
    "last_active",
    "arr_usd",
    "onboarding_completion",
    "features_adopted",
    "weekly_active_users",
    "csm",
  ];
  const rows = accounts.map((a) =>
    [
      a.name,
      a.industry,
      a.seats,
      a.invitedSeats,
      a.healthScore,
      a.riskLevel,
      a.primaryRisk,
      a.daysSinceSignup,
      a.lastActive,
      a.arr,
      a.onboardingCompletion,
      a.featuresAdopted,
      a.weeklyActiveUsers,
      a.csm,
    ]
      .map((v) => {
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      })
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

function buildXlsHtml(
  periodLabel: string,
  kpis: ReturnType<typeof getScaledKpis>,
  funnel: ReturnType<typeof getScaledFunnel>,
) {
  const kpiRows = [
    ["Retention rate (%)", kpis.retention90.value],
    ["Churn rate (%)", kpis.churn90.value],
    ["Activation rate (%)", kpis.activated.value],
    ["Team invitation rate (%)", kpis.inviteRate.value],
    ["Average health score (/100)", kpis.health.value],
  ];
  const funnelRows = funnel.map((s) => [s.stage, s.count, s.pct]);
  const accountRows = accounts.map((a) => [
    a.name,
    a.industry,
    a.healthScore,
    a.riskLevel,
    a.primaryRisk,
    a.invitedSeats,
    a.seats,
    a.arr,
  ]);

  const tbl = (title: string, head: string[], rows: (string | number)[][]) => `
    <h3>${title}</h3>
    <table border="1" cellspacing="0" cellpadding="4">
      <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
        .join("")}</tbody>
    </table>`;

  return `<html><head><meta charset="utf-8"><title>Retention Report</title></head>
  <body>
    <h1>Retention Report</h1>
    <p><strong>Analysis period:</strong> ${periodLabel}</p>
    ${tbl("KPIs", ["Metric", "Value"], kpiRows)}
    ${tbl("Activation funnel", ["Stage", "Accounts", "%"], funnelRows)}
    ${tbl(
      "At-risk accounts",
      ["Name", "Industry", "Health", "Risk", "Primary risk", "Invited", "Seats", "ARR"],
      accountRows,
    )}
  </body></html>`;
}
