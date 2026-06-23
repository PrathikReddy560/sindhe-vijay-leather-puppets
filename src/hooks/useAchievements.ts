import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AchievementItem[];
    },
  });
};
