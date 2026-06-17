import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "csm" | "viewer";

export function useCurrentRole() {
  const query = useQuery({
    queryKey: ["current-user-roles"],
    queryFn: async (): Promise<AppRole[]> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
    staleTime: 60_000,
  });

  const roles = query.data ?? [];
  const isAdmin = roles.includes("admin");
  const isCsm = roles.includes("csm");
  const isViewer = roles.includes("viewer");
  // Anyone with admin/csm can also act; viewer is read-only.
  const canWrite = isAdmin || isCsm;

  return { roles, isAdmin, isCsm, isViewer, canWrite, isLoading: query.isLoading };
}
