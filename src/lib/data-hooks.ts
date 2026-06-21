import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Plant = {
  id: string; user_id: string; name: string; crop_type: string; variety: string | null;
  planting_date: string; quantity: number; location: string | null; notes: string | null;
  estimated_harvest_date: string | null; status: string; created_at: string;
};

export function usePlants() {
  return useQuery({
    queryKey: ["plants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plants").select("*").order("planting_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Plant[];
    },
  });
}

export function useTable<T = any>(table: string, orderBy = "scheduled_at") {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as any).select("*").order(orderBy, { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useInsert(table: string, invalidate: string[] = [table]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, any>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from(table as any).insert({ ...row, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdate(table: string, invalidate: string[] = [table]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, any> }) => {
      const { error } = await supabase.from(table as any).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success("Updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDelete(table: string, invalidate: string[] = [table]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
