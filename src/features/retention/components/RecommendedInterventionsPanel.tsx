import { ChevronRight } from "lucide-react";

export function RecommendedInterventionsPanel({
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
