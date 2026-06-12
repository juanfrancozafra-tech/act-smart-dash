import { Sparkles, AlertTriangle, Info, Zap } from "lucide-react";

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
              className={`group cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-foreground/5 ${sevStyles[i.severity]}`}
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
