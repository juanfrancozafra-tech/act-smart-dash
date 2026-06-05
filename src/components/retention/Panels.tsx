import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles, AlertTriangle, Info, Zap } from "lucide-react";
import type { Account, RiskLevel } from "@/lib/retention-data";

function riskClass(level: RiskLevel) {
  if (level === "High") return "risk-pill-high";
  if (level === "Medium") return "risk-pill-medium";
  return "risk-pill-low";
}

export function AtRiskTable({ accounts }: { accounts: Account[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">At-risk accounts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {accounts.length} accounts likely to churn in the next 30 days · $89.8K ARR exposure
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">
          View all 47 →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-5 py-2.5">Account</th>
              <th className="text-left font-medium px-3 py-2.5">Health</th>
              <th className="text-left font-medium px-3 py-2.5">Primary risk</th>
              <th className="text-left font-medium px-3 py-2.5">Risk</th>
              <th className="text-left font-medium px-3 py-2.5">Invites</th>
              <th className="text-left font-medium px-3 py-2.5">Last active</th>
              <th className="text-right font-medium px-5 py-2.5">ARR</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr
                key={a.id}
                className="border-t border-border hover:bg-muted/40 transition-colors group"
              >
                <td className="px-5 py-3">
                  <Link to="/accounts/$id" params={{ id: a.id }} className="font-medium hover:text-primary">
                    {a.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{a.industry} · {a.seats} seats</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${a.healthScore}%`,
                          backgroundColor:
                            a.healthScore < 40
                              ? "var(--risk-high)"
                              : a.healthScore < 70
                              ? "var(--risk-medium)"
                              : "var(--risk-low)",
                        }}
                      />
                    </div>
                    <span className="tabular-nums font-medium">{a.healthScore}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-foreground">{a.primaryRisk}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${riskClass(a.riskLevel)}`}>
                    {a.riskLevel}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground tabular-nums">
                  {a.invitedSeats}/{a.seats}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{a.lastActive}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">
                  ${(a.arr / 1000).toFixed(1)}K
                </td>
                <td className="pr-4">
                  <Link
                    to="/accounts/$id"
                    params={{ id: a.id }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const sevIcons = {
  critical: AlertTriangle,
  warning: Zap,
  info: Info,
};
const sevStyles = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  warning: "text-warning-foreground bg-warning/20 border-warning/30",
  info: "text-primary bg-primary/10 border-primary/20",
};

export function AIInsightsPanel({
  insights,
}: {
  insights: { title: string; body: string; severity: "critical" | "warning" | "info"; action: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">AI insights</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Updated 2m ago</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Patterns detected across your cohort with recommended next steps
      </p>
      <div className="space-y-3">
        {insights.map((i) => {
          const Icon = sevIcons[i.severity];
          return (
            <div
              key={i.title}
              className={`rounded-lg border p-3 ${sevStyles[i.severity]}`}
            >
              <div className="flex items-start gap-2">
                <Icon className="size-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{i.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{i.body}</p>
                  <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    {i.action} →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InterventionsPanel({
  interventions,
}: {
  interventions: { name: string; impact: string; time: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Recommended interventions</h3>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
        One-click actions ordered by projected impact
      </p>
      <div className="space-y-2">
        {interventions.map((it) => (
          <button
            key={it.name}
            className="w-full flex items-center justify-between rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors px-3 py-2.5 text-left group"
          >
            <div>
              <div className="text-sm font-medium">{it.name}</div>
              <div className="text-xs text-muted-foreground">{it.time} · {it.impact} projected</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuotesStrip({
  quotes,
}: {
  quotes: { quote: string; person: string; context: string }[];
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
        Voice of churned customers
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {quotes.map((q) => (
          <figure key={q.person} className="text-xs">
            <blockquote className="text-foreground/85 leading-relaxed">"{q.quote}"</blockquote>
            <figcaption className="mt-2 text-muted-foreground">
              — {q.person}, <span className="italic">{q.context}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
