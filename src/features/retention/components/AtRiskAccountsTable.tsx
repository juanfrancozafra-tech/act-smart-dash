import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Account, RiskLevel } from "../data/retentionData";

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

export function AtRiskAccountsTable({ accounts, variant }: { accounts: Account[]; variant?: "hero" | "default" }) {
  const [sort, setSort] = useState<SortState>({ key: "riskLevel", dir: "desc" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSort(loadSort());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sort));
    } catch {
      /* ignore */
    }
  }, [sort, hydrated]);

  const sorted = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...accounts].sort((a, b) => {
      const av = getSortValue(a, sort.key);
      const bv = getSortValue(b, sort.key);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return a.id.localeCompare(b.id);
    });
  }, [accounts, sort]);

  const toggle = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key !== key) {
        const dir: SortDir = key === "name" || key === "lastActive" ? "asc" : "desc";
        return { key, dir };
      }
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  const isHero = variant === "hero";
  const title = isHero ? "Accounts Requiring Immediate Attention" : "At-risk accounts";
  const subtitle = isHero
    ? "These accounts show early churn signals based on activation gaps, engagement patterns, and team adoption metrics."
    : `${accounts.length} accounts likely to churn in the next 30 days · $89.8K ARR exposure`;

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h3 className="text-sm font-semibold">No at-risk accounts in this window — nice work</h3>
        <p className="text-xs text-muted-foreground mt-1">
          All accounts look healthy for the current period.{" "}
          <Link to="/" className="text-primary hover:underline">
            Widen the period
          </Link>{" "}
          to see longer-range patterns.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${isHero ? "border-primary/30 shadow-sm ring-1 ring-primary/10" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <h2 className={isHero ? "text-base font-semibold tracking-tight" : "text-sm font-semibold"}>{title}</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
        </div>
        {!isHero && (
          <button className="text-xs font-medium text-primary hover:underline shrink-0">
            View all 47 →
          </button>
        )}
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
