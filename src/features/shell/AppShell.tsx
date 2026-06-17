import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  LogOut,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCohortSummary, useFirstAccountId } from "@/features/retention/data/retentionData";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [initials, setInitials] = useState("·");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: cohortSummary } = useCohortSummary();
  const { data: firstAccountId } = useFirstAccountId();

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
        { to: firstAccountId ? `/accounts/${firstAccountId}` : "/", label: "Accounts", icon: Building2 },
        { to: "/users", label: "Users", icon: Users },
        { to: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u || cancelled) return;
      setEmail(u.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", u.id)
        .maybeSingle();
      if (cancelled) return;
      const name =
        profile?.full_name ||
        (u.user_metadata?.full_name as string | undefined) ||
        u.email ||
        "";
      setDisplayName(name);
      const parts = name.split(/[ @]/).filter(Boolean);
      const init = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
      setInitials(init.toUpperCase() || "U");
    })();
    return () => {
      cancelled = true;
    };
  }, []);


  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

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
                      to={item.to as string}
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
          <div className="text-[11px] font-semibold text-foreground">
            {cohortSummary?.cohort?.label ?? "—"} cohort
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {(cohortSummary?.signupCount ?? 0).toLocaleString()} signups tracked
            {cohortSummary?.cohort?.windowDays ? ` · ${cohortSummary.cohort.windowDays}-day window` : ""}
          </div>
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

          <div className="flex items-center gap-2 relative">
            <button className="size-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="size-4" />
            </button>
            <div className="h-5 w-px bg-border mx-1" />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-[12px] font-semibold hover:bg-primary/20"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-44 rounded-md border border-border bg-card shadow-md py-1">
                <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left">
                  <LogOut className="size-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
