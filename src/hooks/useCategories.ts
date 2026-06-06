import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  created_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as DbCategory[];
    },
  });
};
