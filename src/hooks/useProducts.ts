import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  category: "big-paintings" | "medium-paintings" | "hanging-lamps";
  inventory_tag: "in-stock" | "made-to-order" | "limited-edition";
  image_day: string;
  image_night: string | null;
  dimensions: string | null;
  material: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DbProduct[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as DbProduct | null;
    },
    enabled: !!slug,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DbProduct[];
    },
  });
};

// Helper to convert DB product to the format used by ProductCard
export const toDisplayProduct = (p: DbProduct) => ({
  id: p.slug,
  name: p.name,
  description: p.description,
  longDescription: p.long_description,
  price: p.price,
  category: p.category,
  inventoryTag: p.inventory_tag,
  images: { day: p.image_day, night: p.image_night || p.image_day },
  dimensions: p.dimensions || undefined,
  material: p.material,
  featured: p.featured,
});
