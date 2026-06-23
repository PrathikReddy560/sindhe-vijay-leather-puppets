import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShowcaseVideo {
  id: string;
  video_url: string;
  title: string | null;
  created_at: string;
}

export const useShowcaseVideos = () => {
  return useQuery({
    queryKey: ["showcase_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showcase_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ShowcaseVideo[];
    },
  });
};
