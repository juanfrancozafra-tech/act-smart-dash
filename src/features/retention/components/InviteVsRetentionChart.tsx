import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inviteVsRetention } from "../data/retentionData";

const tooltipStyle = {
  backgroundColor: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  padding: "8px 10px",
  color: "var(--foreground)",
};

/**
 * CollaborationPayoff — the headline chart contrasting accounts that
 * invited teammates against those that didn't. This is the visual answer
 * to the product's core hypothesis.
 */
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
