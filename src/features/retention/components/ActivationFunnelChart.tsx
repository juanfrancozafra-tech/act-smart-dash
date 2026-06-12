export function ActivationFunnelChart({ data }: { data: { stage: string; count: number; pct: number }[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Activation funnel</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Sign Up → Onboarding → Team Invite → Activation → Retained</p>
        </div>
        <span className="text-xs text-muted-foreground">Last 1,000 signups</span>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((s, i) => {
          const drop = i > 0 ? data[i - 1].pct - s.pct : 0;
          const isInviteStep = s.stage === "Team Invite";
          return (
            <div key={s.stage} className="flex items-center gap-3">
              <div className="w-24 text-xs font-medium text-muted-foreground">{s.stage}</div>
              <div className="flex-1 h-9 relative">
                <div
                  className={`h-full rounded-md flex items-center px-3 text-xs font-semibold text-primary-foreground transition-all ${
                    isInviteStep ? "bg-primary" : "bg-primary/70"
                  }`}
                  style={{ width: `${s.pct}%` }}
                >
                  {s.count.toLocaleString()}
                </div>
                {isInviteStep && (
                  <span className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full ml-2 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    pivot point
                  </span>
                )}
              </div>
              <div className="w-16 text-right text-xs tabular-nums">
                <span className="font-semibold">{s.pct}%</span>
                {drop > 0 && (
                  <div className="text-[10px] text-destructive">-{drop}pt</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
