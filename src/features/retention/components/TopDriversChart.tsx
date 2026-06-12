export function TopDriversChart({ drivers }: { drivers: { driver: string; pct: number; trend: string }[] }) {
  const colors = ["var(--chart-5)", "var(--chart-4)", "var(--chart-2)", "var(--chart-1)"];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Top churn drivers</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Attribution from 300 churned accounts</p>
      <div className="mt-4 space-y-3">
        {drivers.map((d, i) => (
          <div key={d.driver}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium">{d.driver}</span>
              <span className="tabular-nums text-muted-foreground">
                {d.pct}% <span className="ml-1 text-[10px]">{d.trend}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${d.pct * 2.2}%`, backgroundColor: colors[i] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
