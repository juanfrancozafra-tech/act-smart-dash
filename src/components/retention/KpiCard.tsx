import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: number;
  suffix?: string;
  delta: number;
  inverse?: boolean;
  highlight?: boolean;
}

export function KpiCard({ label, value, suffix, delta, inverse, highlight }: Props) {
  const positive = inverse ? delta < 0 : delta > 0;
  const Icon = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className={`rounded-xl border bg-card p-5 transition-colors ${
        highlight ? "border-primary/40 ring-1 ring-primary/15" : "border-border"
      }`}
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <div
        className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
          positive ? "text-success" : "text-destructive"
        }`}
      >
        <Icon className="size-3.5" />
        {Math.abs(delta)}% vs last cohort
      </div>
    </div>
  );
}
