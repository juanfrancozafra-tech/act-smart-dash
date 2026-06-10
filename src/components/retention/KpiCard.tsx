import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  label: string;
  value: number;
  suffix?: string;
  delta: number;
  inverse?: boolean;
  highlight?: boolean;
  info?: {
    calculation: string;
    why: string;
    recommendation?: string;
  };
}

export function KpiCard({ label, value, suffix, delta, inverse, highlight, info }: Props) {
  const positive = inverse ? delta < 0 : delta > 0;
  const Icon = delta >= 0 ? ArrowUpRight : ArrowDownRight;

  const card = (
    <div
      className={`group cursor-pointer rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 hover:border-primary/40 ${
        highlight ? "border-primary/40 ring-1 ring-primary/15" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        {info && (
          <Info className="size-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
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

  if (!info) return card;

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>{card}</HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-80 text-xs space-y-2.5">
        <div>
          <div className="font-semibold text-sm text-foreground">{label}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
            How it's calculated
          </div>
          <p className="text-foreground/80 leading-relaxed">{info.calculation}</p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
            Why it matters
          </div>
          <p className="text-foreground/80 leading-relaxed">{info.why}</p>
        </div>
        {info.recommendation && (
          <div className="rounded-md bg-primary/8 border border-primary/20 p-2">
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-0.5">
              Recommended next step
            </div>
            <p className="text-foreground/85 leading-relaxed">{info.recommendation}</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
