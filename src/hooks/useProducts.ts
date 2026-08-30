import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as fallbackStaticProducts, Product as StaticProduct } from "@/data/products";
import { slugify } from "@/lib/slugify";

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  discount_price: number | null;
  category: string;
  inventory_tag: "in-stock" | "made-to-order" | "limited-edition";
  image_day: string;
  image_night: string | null;
  dimensions: string | null;
  material: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DisplayProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  discountPrice?: number;
  category: string;
  inventoryTag: "in-stock" | "made-to-order" | "limited-edition";
  featuredImage: string;
  images: string[];
  imagesObj: { day: string; night: string };
  dimensions?: string;
  material: string;
  featured: boolean;
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
      return (data || []) as DbProduct[];
    },
  });
};

export const useProduct = (slugOrId: string) => {
  return useQuery({
    queryKey: ["product", slugOrId],
    queryFn: async (): Promise<DbProduct | null> => {
      if (!slugOrId) return null;

      // Decode and normalize the search parameter
      const raw = decodeURIComponent(slugOrId).trim();
      const normalizedSlug = slugify(raw);

      // 1. Try finding by exact slug in DB
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", raw)
        .maybeSingle();

      if (!data && normalizedSlug && normalizedSlug !== raw) {
        const res = await supabase
          .from("products")
          .select("*")
          .eq("slug", normalizedSlug)
          .maybeSingle();
        data = res.data;
      }

      // 2. Fallback: try finding by ID in DB
      if (!data) {
        const res = await supabase
          .from("products")
          .select("*")
          .eq("id", raw)
          .maybeSingle();
        data = res.data;
      }

      // 3. Fallback: try case-insensitive or name match in DB
      if (!data && normalizedSlug) {
        const { data: allDb } = await supabase
          .from("products")
          .select("*");
        if (allDb && allDb.length > 0) {
          const match = allDb.find(
            (p) =>
              p.slug?.toLowerCase() === normalizedSlug ||
              slugify(p.slug || "") === normalizedSlug ||
              slugify(p.name || "") === normalizedSlug ||
              p.id === raw
          );
          if (match) data = match as DbProduct;
        }
      }

      // 4. Fallback: check static catalog if not found in DB
      if (!data) {
        const staticMatch = fallbackStaticProducts.find(
          (p) =>
            p.slug === raw ||
            p.slug === normalizedSlug ||
            slugify(p.slug || p.id) === normalizedSlug ||
            slugify(p.name) === normalizedSlug ||
            p.id === raw
        );

        if (staticMatch) {
          return {
            id: staticMatch.id,
            slug: staticMatch.slug || slugify(staticMatch.name) || staticMatch.id,
            name: staticMatch.name,
            description: staticMatch.description,
            long_description: staticMatch.longDescription,
            price: staticMatch.price,
            discount_price: staticMatch.discountPrice || null,
            category: staticMatch.category,
            inventory_tag: staticMatch.inventoryTag,
            image_day: staticMatch.images.day,
            image_night: staticMatch.images.night,
            dimensions: staticMatch.dimensions || null,
            material: staticMatch.material,
            featured: !!staticMatch.featured,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }

      return (data as DbProduct) || null;
    },
    enabled: !!slugOrId,
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
      return (data || []) as DbProduct[];
    },
  });
};

// Helper to convert DB product to standard DisplayProduct format
export const toDisplayProduct = (p: DbProduct): DisplayProduct => {
  let galleryImages: string[] = [];
  let extractedNightImage = "";

  if (p.image_night) {
    try {
      const parsed = JSON.parse(p.image_night);
      if (Array.isArray(parsed)) {
        galleryImages = parsed.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
        extractedNightImage = galleryImages.find((u) => u !== p.image_day) || galleryImages[1] || "";
      } else if (typeof parsed === "string") {
        galleryImages = [parsed];
        extractedNightImage = parsed;
      }
    } catch {
      // If not JSON, it is a regular image URL
      if (p.image_night.trim()) {
        galleryImages = [p.image_night.trim()];
        if (p.image_night.trim() !== p.image_day?.trim()) {
          extractedNightImage = p.image_night.trim();
        }
      }
    }
  }

  // Combine featured image (image_day), night image, and all gallery images into an ordered unique array
  const allImages: string[] = [];
  if (p.image_day && p.image_day.trim()) {
    allImages.push(p.image_day.trim());
  }
  if (extractedNightImage && !allImages.includes(extractedNightImage)) {
    allImages.push(extractedNightImage);
  }
  for (const img of galleryImages) {
    if (img && !allImages.includes(img)) {
      allImages.push(img);
    }
  }

  // Fallback if empty
  if (allImages.length === 0) {
    allImages.push("/images/products/big-ganesha.jpg");
  }

  const resolvedDayImage = p.image_day?.trim() || allImages[0];
  const resolvedNightImage = extractedNightImage || (allImages.length > 1 ? allImages[1] : resolvedDayImage);

  return {
    id: p.id,
    slug: p.slug || slugify(p.name) || p.id,
    name: p.name,
    description: p.description,
    longDescription: p.long_description,
    price: p.price,
    discountPrice: p.discount_price || undefined,
    category: p.category,
    inventoryTag: p.inventory_tag,
    featuredImage: allImages[0],
    images: allImages,
    imagesObj: { day: resolvedDayImage, night: resolvedNightImage },
    dimensions: p.dimensions || undefined,
    material: p.material,
    featured: p.featured,
  };
};
