import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkshopItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  date: string;
  end_date?: string;
  timings: string;
  location: string;
  status: "ongoing" | "upcoming" | "completed";
  capacity?: string;
  contact_phone?: string;
  created_at?: string;
}

export const fallbackWorkshops: WorkshopItem[] = [
  {
    id: "ws-1",
    title: "Masterclass in Traditional Leather Shadow Puppet Making",
    description: "Learn the 500-year-old art of Thogalu Gombe from master artisan Sindhe Vijay. Participants will learn goat leather treatment, stencil tracing, fine chisel punching, and painting with natural drawing inks to create their own articulated puppet.",
    image_url: "/images/products/big-ganesha.jpg",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    timings: "10:30 AM – 2:00 PM (Daily)",
    location: "Artisans Craft Studio, Jeekavandlapalli, Bagepalli, Karnataka",
    status: "ongoing",
    capacity: "15 Participants",
    contact_phone: "+91 94803 26868",
  },
  {
    id: "ws-2",
    title: "Shadow Puppetry Storytelling & Performance Workshop",
    description: "An immersive hands-on performance workshop on puppetry manipulation, voice modulation, and traditional musical accompaniment behind the illuminated white screen. Perfect for educators, theatre artists, and art enthusiasts.",
    image_url: "/images/products/big-krishna-leela.jpg",
    video_url: null,
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    timings: "3:00 PM – 6:30 PM",
    location: "Chitrakala Parishath, Kumara Krupa Road, Bengaluru",
    status: "upcoming",
    capacity: "20 Participants",
    contact_phone: "+91 94803 26868",
  },
  {
    id: "ws-3",
    title: "Leather Lamp & Folk Art Miniature Painting Workshop",
    description: "Create your own decorative leather lampshade with traditional folk motifs and pin-hole illumination patterns. All authentic pure goat hide materials and tools provided.",
    image_url: "/images/products/lamp-2.jpg",
    video_url: null,
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    timings: "11:00 AM – 4:00 PM",
    location: "National Crafts Museum & Hastkala Academy, Pragati Maidan, New Delhi",
    status: "upcoming",
    capacity: "12 Participants",
    contact_phone: "+91 94803 26868",
  },
];

export const useWorkshops = () => {
  return useQuery({
    queryKey: ["workshops"],
    queryFn: async (): Promise<WorkshopItem[]> => {
      try {
        // Query events table or custom workshops if stored in events table
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("start_date", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Format DB event items into WorkshopItems
          const mapped: WorkshopItem[] = data.map((ev: any) => {
            const isOngoing =
              ev.start_date <= new Date().toISOString().split("T")[0] &&
              ev.end_date >= new Date().toISOString().split("T")[0];
            const isUpcoming = ev.start_date > new Date().toISOString().split("T")[0];

            let timings = ev.stall_no || "10:00 AM – 1:30 PM";
            let videoUrl: string | null = null;

            // Extract timings or video if encoded in stall_no or description
            if (ev.stall_no && ev.stall_no.includes("http")) {
              videoUrl = ev.stall_no;
              timings = "10:00 AM – 1:30 PM";
            }

            return {
              id: ev.id,
              title: ev.title,
              description: ev.description,
              image_url: ev.image_url,
              video_url: videoUrl,
              date: ev.start_date,
              end_date: ev.end_date,
              timings: timings,
              location: ev.location,
              status: isOngoing ? "ongoing" : isUpcoming ? "upcoming" : "completed",
              capacity: "15-20 Participants",
              contact_phone: "+91 94803 26868",
              created_at: ev.created_at,
            };
          });

          // Combine with rich demo workshops if needed
          return mapped;
        }

        return fallbackWorkshops;
      } catch (err) {
        console.warn("Could not fetch workshops from DB, using fallback dataset:", err);
        return fallbackWorkshops;
      }
    },
  });
};
