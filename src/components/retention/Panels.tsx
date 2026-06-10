import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Account, RiskLevel } from "@/lib/retention-data";

function riskClass(level: RiskLevel) {
  if (level === "High") return "risk-pill-high";
  if (level === "Medium") return "risk-pill-medium";
  return "risk-pill-low";
}

// ---------- Sort plumbing ----------

type SortKey = "name" | "healthScore" | "riskLevel" | "lastActive" | "arr";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

const STORAGE_KEY = "retain:atrisk-sort";
const RISK_RANK: Record<RiskLevel, number> = { High: 3, Medium: 2, Low: 1 };

/** Parse strings like "today", "3 hours ago", "6 days ago" into a sortable
 * number where smaller = more recent. Robust to unknown values. */
function lastActiveScore(s: string): number {
  const lower = s.toLowerCase().trim();
  if (lower === "today" || lower === "just now") return 0;
  const match = lower.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    minute: 1 / 1440,
    hour: 1 / 24,
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };
  return n * (multipliers[unit] ?? 1);
}

function getSortValue(a: Account, key: SortKey): number | string {
  switch (key) {
    case "name":
      return a.name.toLowerCase();
    case "healthScore":
      return a.healthScore;
    case "riskLevel":
      return RISK_RANK[a.riskLevel];
    case "lastActive":
      return lastActiveScore(a.lastActive);
    case "arr":
      return a.arr;
  }
}

function loadSort(): SortState {
  if (typeof window === "undefined") return { key: "riskLevel", dir: "desc" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { key: "riskLevel", dir: "desc" };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.key === "string" && (parsed.dir === "asc" || parsed.dir === "desc")) {
      return parsed as SortState;
    }
  } catch {
    /* ignore */
  }
  return { key: "riskLevel", dir: "desc" };
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  active: SortState;
  align?: "left" | "right";
  onToggle: (k: SortKey) => void;
}

function SortHeader({ label, sortKey, active, align = "left", onToggle }: SortHeaderProps) {
  const isActive = active.key === sortKey;
  const Icon = !isActive ? ChevronsUpDown : active.dir === "asc" ? ChevronUp : ChevronDown;
  const nextDir =
    !isActive
      ? sortKey === "name" || sortKey === "lastActive"
        ? "ascending"
        : "descending"
      : active.dir === "asc"
      ? "descending"
      : "ascending";

  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      aria-sort={isActive ? (active.dir === "asc" ? "ascending" : "descending") : "none"}
      aria-label={`Sort by ${label} ${nextDir}`}
      className={`group inline-flex items-center gap-1 -mx-1.5 px-1.5 py-0.5 rounded transition-colors hover:bg-muted hover:text-foreground ${
        isActive ? "text-foreground" : "text-muted-foreground"
      } ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <span className="font-medium">{label}</span>
      <Icon
        className={`size-3 transition-opacity ${
          isActive ? "opacity-100 text-primary" : "opacity-40 group-hover:opacity-80"
        }`}
        strokeWidth={2.5}
      />
    </button>
  );
}

export function AtRiskTable({ accounts }: { accounts: Account[] }) {
  const [sort, setSort] = useState<SortState>(() => loadSort());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sort));
    } catch {
      /* ignore */
    }
  }, [sort]);

  const sorted = useMemo(() => {
    // Default sort tuning: for name & lastActive, asc means most "natural" first
    // (A→Z, newest). For numeric metrics, desc surfaces the highest first.
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...accounts].sort((a, b) => {
      const av = getSortValue(a, sort.key);
      const bv = getSortValue(b, sort.key);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      // Stable tiebreaker by id
      return a.id.localeCompare(b.id);
    });
  }, [accounts, sort]);

  const toggle = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key !== key) {
        // First click: sensible default per column
        const dir: SortDir = key === "name" || key === "lastActive" ? "asc" : "desc";
        return { key, dir };
      }
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">At-risk accounts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {accounts.length} accounts likely to churn in the next 30 days · $89.8K ARR exposure
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">
          View all 47 →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-5 py-2.5">
                <SortHeader label="Account" sortKey="name" active={sort} onToggle={toggle} />
              </th>
              <th className="text-left font-medium px-3 py-2.5">
                <SortHeader label="Health" sortKey="healthScore" active={sort} onToggle={toggle} />
              </th>
              <th className="text-left font-medium px-3 py-2.5">Primary risk</th>
              <th className="text-left font-medium px-3 py-2.5">
                <SortHeader label="Risk" sortKey="riskLevel" active={sort} onToggle={toggle} />
              </th>
              <th className="text-left font-medium px-3 py-2.5">Invites</th>
              <th className="text-left font-medium px-3 py-2.5">
                <SortHeader label="Last active" sortKey="lastActive" active={sort} onToggle={toggle} />
              </th>
              <th className="text-right font-medium px-5 py-2.5">
                <SortHeader label="ARR" sortKey="arr" active={sort} align="right" onToggle={toggle} />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {sorted.map((a) => (
                <motion.tr
                  key={a.id}
                  layout
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-border hover:bg-muted/40 group"
                >
                  <td className="px-5 py-3">
                    <Link to="/accounts/$id" params={{ id: a.id }} className="font-medium hover:text-primary">
                      {a.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{a.industry} · {a.seats} seats</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${a.healthScore}%`,
                            backgroundColor:
                              a.healthScore < 40
                                ? "var(--risk-high)"
                                : a.healthScore < 70
                                ? "var(--risk-medium)"
                                : "var(--risk-low)",
                          }}
                        />
                      </div>
                      <span className="tabular-nums font-medium">{a.healthScore}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground">{a.primaryRisk}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${riskClass(a.riskLevel)}`}>
                      {a.riskLevel}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground tabular-nums">
                    {a.invitedSeats}/{a.seats}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{a.lastActive}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">
                    ${(a.arr / 1000).toFixed(1)}K
                  </td>
                  <td className="pr-4">
                    <Link
                      to="/accounts/$id"
                      params={{ id: a.id }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Re-export untouched panels ----------

import { Sparkles, AlertTriangle, Info, Zap } from "lucide-react";

const sevIcons = {
  critical: AlertTriangle,
  warning: Zap,
  info: Info,
};
const sevStyles = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  warning: "text-warning-foreground bg-warning/20 border-warning/30",
  info: "text-primary bg-primary/10 border-primary/20",
};

export function AIInsightsPanel({
  insights,
}: {
  insights: { title: string; body: string; severity: "critical" | "warning" | "info"; action: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">AI insights</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Updated 2m ago</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Patterns detected across your cohort with recommended next steps
      </p>
      <div className="space-y-3">
        {insights.map((i) => {
          const Icon = sevIcons[i.severity];
          return (
            <div
              key={i.title}
              className={`group cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-foreground/5 ${sevStyles[i.severity]}`}
            >
              <div className="flex items-start gap-2">
                <Icon className="size-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{i.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{i.body}</p>
                  <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    {i.action} →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InterventionsPanel({
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

export function QuotesStrip({
  quotes,
}: {
  quotes: { quote: string; person: string; context: string }[];
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
        Voice of churned customers
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {quotes.map((q) => (
          <figure key={q.person} className="text-xs">
            <blockquote className="text-foreground/85 leading-relaxed">"{q.quote}"</blockquote>
            <figcaption className="mt-2 text-muted-foreground">
              — {q.person}, <span className="italic">{q.context}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
