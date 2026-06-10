import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  FlaskConical,
  Settings,
  Activity,
  Download,
  Eye,
} from "lucide-react";
import { PeriodSelector } from "./PeriodSelector";
import { ExportReportDialog } from "./ExportReportDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function StatePreviewMenu() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAccount = pathname.startsWith("/accounts/");
  const accountId = onAccount ? pathname.split("/")[2] : "acme-inc";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-dashed border-border bg-surface hover:bg-muted text-xs text-muted-foreground"
          title="Preview UI states"
        >
          <Eye className="size-3.5" />
          States
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1 text-sm">
        <div className="px-2.5 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Dashboard
        </div>
        <Link to="/" className="block px-2.5 py-1.5 rounded-md hover:bg-muted">Live data</Link>
        <Link to="/" search={{ demo: "empty" } as any} className="block px-2.5 py-1.5 rounded-md hover:bg-muted">Empty state</Link>
        <div className="px-2.5 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-t border-border mt-1">
          Client detail
        </div>
        <Link to="/accounts/$id" params={{ id: accountId }} className="block px-2.5 py-1.5 rounded-md hover:bg-muted">
          Live data
        </Link>
        <Link to="/accounts/$id" params={{ id: accountId }} search={{ demo: "loading" } as any} className="block px-2.5 py-1.5 rounded-md hover:bg-muted">
          Skeleton loading
        </Link>
        <Link to="/accounts/$id" params={{ id: accountId }} search={{ demo: "empty" } as any} className="block px-2.5 py-1.5 rounded-md hover:bg-muted">
          Empty state
        </Link>
      </PopoverContent>
    </Popover>
  );
}

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
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground mr-2">
              <span className="size-2 rounded-full bg-success" />
              Live · synced 2 min ago
            </div>
            <PeriodSelector />
            <StatePreviewMenu />
            <ExportReportDialog
              trigger={
                <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium">
                  <Download className="size-3.5" />
                  Export Report
                </button>
              }
            />
            <div className="size-9 rounded-full bg-primary/15 text-primary grid place-items-center text-sm font-semibold ml-1">
              PS
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
