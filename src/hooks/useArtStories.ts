import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArtStory {
  id: string;
  image_url: string;
  title: string;
  story: string;
  created_at: string;
}

export const useArtStories = () => {
  return useQuery({
    queryKey: ["art_stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_stories" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ArtStory[];
    },
  });
};
