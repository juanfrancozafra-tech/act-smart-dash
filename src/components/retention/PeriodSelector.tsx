import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { usePeriod, type PeriodKey } from "@/lib/period-context";
import { format, differenceInCalendarDays } from "date-fns";

const PRESETS: { key: Exclude<PeriodKey, "custom">; label: string; days: number }[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
];

export function PeriodSelector() {
  const { period, setPeriod } = usePeriod();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date } | undefined>(period.range);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPeriod({ key: p.key, days: p.days, label: p.label });
    setShowCustom(false);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!range?.from || !range?.to) return;
    const days = Math.max(1, differenceInCalendarDays(range.to, range.from) + 1);
    setPeriod({
      key: "custom",
      days,
      label: `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`,
      range: { from: range.from, to: range.to },
    });
    setShowCustom(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-surface hover:bg-muted text-xs font-medium">
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          {period.label}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-2">
        {!showCustom ? (
          <div className="space-y-1">
            {PRESETS.map((p) => {
              const active = period.key === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm hover:bg-muted"
                >
                  <span>{p.label}</span>
                  {active && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm hover:bg-muted border-t border-border mt-1 pt-2"
            >
              <span>Custom range…</span>
              {period.key === "custom" && <Check className="size-4 text-primary" />}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-medium px-1 pt-1">Pick a date range</div>
            <Calendar
              mode="range"
              selected={range as any}
              onSelect={(r: any) => setRange(r)}
              numberOfMonths={1}
              className="p-0 pointer-events-auto"
            />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowCustom(false)}>
                Back
              </Button>
              <Button size="sm" className="flex-1" disabled={!range?.from || !range?.to} onClick={applyCustom}>
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
