import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { churnTrend, inviteVsRetention } from "@/lib/retention-data";

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

export function InviteVsRetentionChart() {
  return (
    <div className="rounded-xl border border-primary/30 bg-card p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground rounded-bl-lg">
        Key insight
      </div>
      <h3 className="text-sm font-semibold">Team invites vs retention</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Accounts that invite teammates retain 2.7× more
      </p>
      <div className="h-44 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={inviteVsRetention} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="%" />
            <YAxis dataKey="cohort" type="category" tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="retained" stackId="a" fill="var(--chart-3)" radius={[4, 0, 0, 4]} name="Retained" />
            <Bar dataKey="churned" stackId="a" fill="var(--chart-5)" radius={[0, 4, 4, 0]} name="Churned" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div className="rounded-md bg-success/10 border border-success/20 p-2">
          <div className="font-semibold text-success">With invites · 84% retained</div>
          <div className="text-muted-foreground">670 accounts</div>
        </div>
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2">
          <div className="font-semibold text-destructive">No invites · 31% retained</div>
          <div className="text-muted-foreground">330 accounts</div>
        </div>
      </div>
    </div>
  );
}

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

export function ActivationFunnel({ data }: { data: { stage: string; count: number; pct: number }[] }) {
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

export function HealthGauge({ score }: { score: number }) {
  const color = score < 40 ? "var(--risk-high)" : score < 70 ? "var(--risk-medium)" : "var(--risk-low)";
  const circumference = 2 * Math.PI * 42;
  return (
    <div className="relative size-32">
      <svg viewBox="0 0 100 100" className="size-full">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums">{score}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Health</div>
        </div>
      </div>
    </div>
  );
}
