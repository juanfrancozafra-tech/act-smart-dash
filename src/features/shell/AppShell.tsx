import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  FlaskConical,
  Settings,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

const navGroups = [
  {
    label: "Analyze",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/retention", label: "Retention", icon: TrendingUp },
      { to: "/experiments", label: "Experiments", icon: FlaskConical },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/accounts/acme-inc", label: "Accounts", icon: Building2 },
      { to: "/users", label: "Users", icon: Users },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-[232px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-5 h-16">
          <div className="size-7 rounded-md bg-sidebar-primary grid place-items-center text-sidebar-primary-foreground font-bold text-[13px]">
            R
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
            Retain
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={2.5} />
          </div>
        </div>

        <nav className="flex-1 px-3 pt-2 pb-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.to
                    : pathname.startsWith(item.to.split("/").slice(0, 2).join("/")) && item.to !== "/";
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-foreground/75 hover:bg-sidebar-accent/70 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" strokeWidth={2} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-3 mb-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="text-[11px] font-semibold text-foreground">Q2 2026 cohort</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">1,000 signups tracked</div>
          <button className="mt-2 text-[11px] font-medium text-primary hover:text-primary/80">
            Switch cohort →
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <span className="text-muted-foreground">Customer Success</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-medium text-foreground truncate">Account Health</span>
          </div>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                placeholder="Search accounts, users, segments…"
                className="w-full h-8 pl-8 pr-3 text-[13px] rounded-md border border-border bg-background hover:bg-muted/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="size-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="size-4" />
            </button>
            <div className="h-5 w-px bg-border mx-1" />
            <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-[12px] font-semibold">
              PS
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
