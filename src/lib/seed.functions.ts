import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEMO_ACCOUNTS = [
  {
    id: "demo-acme",
    name: "Acme Inc",
    industry: "Logistics",
    seats: 12,
    invited_seats: 3,
    health_score: 38,
    primary_risk: "Solo usage",
    risk_level: "High",
    days_since_signup: 42,
    last_active: "5 days ago",
    arr: 24000,
    onboarding_completion: 45,
    features_adopted: 3,
    features_total: 8,
    weekly_active_users: 1,
    csm: "Jamie Chen",
  },
  {
    id: "demo-bright",
    name: "Bright Labs",
    industry: "Research",
    seats: 8,
    invited_seats: 7,
    health_score: 78,
    primary_risk: "None",
    risk_level: "Low",
    days_since_signup: 60,
    last_active: "today",
    arr: 18000,
    onboarding_completion: 92,
    features_adopted: 7,
    features_total: 8,
    weekly_active_users: 6,
    csm: "Sam Patel",
  },
  {
    id: "demo-northwind",
    name: "Northwind Co",
    industry: "Retail",
    seats: 20,
    invited_seats: 8,
    health_score: 55,
    primary_risk: "Engagement collapse",
    risk_level: "Medium",
    days_since_signup: 30,
    last_active: "2 days ago",
    arr: 42000,
    onboarding_completion: 65,
    features_adopted: 5,
    features_total: 8,
    weekly_active_users: 3,
    csm: "Jamie Chen",
  },
];

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("accounts")
      .upsert(DEMO_ACCOUNTS, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { inserted: DEMO_ACCOUNTS.length };
  });
