import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  FlaskConical,
  Settings,
  Activity,
} from "lucide-react";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/accounts/acme-inc", label: "Accounts", icon: Building2 },
  { to: "/users", label: "Users", icon: Users },
  { to: "/retention", label: "Retention", icon: TrendingUp },
  { to: "/experiments", label: "Experiments", icon: FlaskConical },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="size-8 rounded-lg bg-sidebar-primary grid place-items-center text-sidebar-primary-foreground">
            <Activity className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Retain</div>
            <div className="text-[11px] text-sidebar-foreground/60">Account Health</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to.split("/").slice(0, 2).join("/")) && item.to !== "/";
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-lg bg-sidebar-accent/60 p-3 text-xs text-sidebar-foreground/80">
          <div className="font-medium text-sidebar-foreground mb-1">Current cohort</div>
          Q2 2026 · 1,000 signups
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur flex items-center justify-between px-6">
          <div>
            <div className="text-xs text-muted-foreground">Customer Success</div>
            <h1 className="text-base font-semibold tracking-tight">Account Health Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-success" />
              Live · synced 2 min ago
            </div>
            <div className="size-9 rounded-full bg-primary/15 text-primary grid place-items-center text-sm font-semibold">
              PS
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
