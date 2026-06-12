import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { churnTrend } from "../data/retentionData";

const tooltipStyle = {
  backgroundColor: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  padding: "8px 10px",
  color: "var(--foreground)",
};

export function ChurnTrendChart({ data }: { data?: typeof churnTrend } = {}) {
  const series = data ?? churnTrend;
  const last = series[series.length - 1]?.churn ?? 0;
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:shadow-foreground/5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold">Churn curve · selected period</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cumulative % of accounts that have churned by week
          </p>
        </div>
        <span className="text-xs text-destructive font-medium">{last}% by W{series.length}</span>
      </div>
      <div className="h-56 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="churn"
              stroke="var(--chart-5)"
              strokeWidth={2}
              fill="url(#churnGrad)"
              name="Cumulative churn"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
