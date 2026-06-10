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
  /** "bare" removes the card border/radius for use inside a grouped strip. */
  variant?: "card" | "bare";
  info?: {
    calculation: string;
    why: string;
    recommendation?: string;
  };
}

export function KpiCard({ label, value, suffix, delta, inverse, highlight, info, variant = "card" }: Props) {
  const positive = inverse ? delta < 0 : delta > 0;
  const Icon = delta >= 0 ? ArrowUpRight : ArrowDownRight;

  const bareClasses = `group cursor-pointer relative bg-card p-5 transition-colors duration-200 hover:bg-muted/40 ${
    highlight ? "ring-1 ring-inset ring-primary/30" : ""
  }`;
  const cardClasses = `group cursor-pointer rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 ${
    highlight ? "border-primary/40 ring-1 ring-primary/15" : "border-border"
  }`;

  const card = (
    <div className={variant === "bare" ? bareClasses : cardClasses}>
      {variant === "bare" && highlight && (
        <span className="absolute top-3 right-3 text-[9.5px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          Key
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
          {label}
        </div>
        {info && variant === "card" && (
          <Info className="size-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-1">
        <span className="text-[28px] font-semibold tracking-tight tabular-nums text-foreground leading-none">
          {value}
        </span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <div
        className={`mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium ${
          positive ? "text-success" : "text-destructive"
        }`}
      >
        <Icon className="size-3.5" />
        {Math.abs(delta)}%
        <span className="text-muted-foreground font-normal ml-0.5">vs last cohort</span>
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
