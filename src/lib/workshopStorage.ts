import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

export interface WorkshopItem {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  image_url: string;
  images: string[];
  video_url: string | null;
  date: string;
  end_date?: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  total_seats: number;
  booked_seats?: number;
  available_seats?: number;
  status: "active" | "upcoming" | "ongoing" | "full" | "completed" | "inactive";
  instructor_name?: string;
  instructor_role?: string;
  instructor_experience?: string;
  instructor_image?: string;
  instructor_bio?: string;
  age_group?: string;
  what_you_will_learn?: string[];
  what_is_included?: string[];
  featured?: boolean;
  created_at?: string;
}

export interface WorkshopRegistration {
  id: string;
  workshop_id: string;
  workshop_title: string;
  full_name: string;
  phone: string;
  email: string;
  seats_booked: number;
  preferred_date?: string;
  message?: string;
  payment_status: "Pending" | "Paid" | "At Venue";
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
  created_at: string;
}

export interface GroupWorkshopEnquiry {
  id: string;
  org_name: string;
  contact_person: string;
  phone: string;
  email: string;
  participants_count: number;
  preferred_date: string;
  location: string;
  message: string;
  status: "Pending" | "Contacted" | "Confirmed" | "Completed" | "Cancelled";
  created_at: string;
}

export interface WorkshopTestimonial {
  id: string;
  name: string;
  role: string;
  review: string;
  rating: number;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkshopSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  instructor_name: string;
  instructor_experience: string;
  instructor_bio: string;
  instructor_image: string;
  default_learn_points: string[];
  default_inclusions: string[];
}

const DEFAULT_WORKSHOPS: WorkshopItem[] = [
  {
    id: "ws-traditional-masterclass",
    slug: "traditional-leather-shadow-puppet-masterclass",
    title: "Masterclass in Traditional Leather Shadow Puppet Making",
    short_description: "Learn the 500-year-old art of Thogalu Gombe from master artisan Sindhe Vijay. Sculpt, punch, and paint your own articulated leather puppet.",
    full_description: "In this comprehensive 1-day immersive masterclass, participants discover the ancient art of Thogalu Gombe (leather shadow puppetry) under the direct mentorship of 8th-generation master craftsman Sindhe Vijay. You will experience the entire journey of creating an authentic leather puppet: understanding translucent goat hide treatment, drafting traditional epic motifs, using ancient iron punches for pinhole illumination, applying vibrant natural drawing inks, and assembling articulated joints for stage play.",
    image_url: "/images/products/big-ganesha.jpg",
    images: [
      "/images/products/big-ganesha.jpg",
      "/images/products/big-krishna-leela.jpg",
      "/images/products/lamp-2.jpg",
      "/images/products/peacock-hanging.jpg"
    ],
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "10:30 AM – 2:30 PM",
    duration: "4 Hours",
    location: "Karnataka Chitrakala Parishath, Kumara Krupa Road, Bengaluru",
    price: 2499,
    total_seats: 25,
    status: "upcoming",
    instructor_name: "Sindhe Vijay",
    instructor_role: "8th-Generation Master Artisan & State Awardee",
    instructor_experience: "25+ Years Experience",
    instructor_image: "/images/heritage/vijay-artisan.jpg",
    instructor_bio: "Sindhe Vijay is an acclaimed master artisan dedicated to preserving and revitalizing the traditional craft of Thogalu Gombe (Karnataka Leather Shadow Puppetry). Born into an 8th-generation puppeteer family in Jeekavandlapalli, his works have been exhibited at national cultural festivals and international galleries.",
    age_group: "12 Years & Above (No prior art experience required)",
    what_you_will_learn: [
      "Introduction to Indian Shadow Puppetry & Oral Traditions",
      "Understanding Translucent Goat Hide & Parchment Preparation",
      "Tracing Sacred & Folk Motifs (Ganesha, Hanuman, Dancing Peacocks)",
      "Traditional Iron Chisel Punching for Light Perforation",
      "Natural & Brilliant Drawing Inks Layering Techniques",
      "Limb Articulation, Jointing & Control Stick Attachment",
      "Live Performance Techniques Behind the Illuminated Screen"
    ],
    what_is_included: [
      "100% Authentic Cured Goat Hide Parchment",
      "Traditional Chisels, Mallets, and Punching Needles (for workshop use)",
      "Full Palette of Drawing Inks and Bamboo Brushes",
      "Bamboo Support Sticks & Brass Fasteners",
      "Official Certificate of Participation signed by Sindhe Vijay",
      "Take Home Your Complete, Articulated Handmade Puppet",
      "Refreshments & Tea included"
    ],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "ws-leather-lamp-crafting",
    slug: "leather-lamp-and-folk-illumination-workshop",
    title: "Handcrafted Leather Lamp & Luminous Miniature Workshop",
    short_description: "Craft your own ambient leather table lamp or wall hanging with pinhole perforation and vibrant folk patterns.",
    full_description: "Transform translucent parchment into glowing ambient home decor. Participants learn the sacred art of punching light holes that cast mesmerizing shadow geometries when illuminated from within. Ideal for home decor enthusiasts, designers, and craft lovers.",
    image_url: "/images/products/lamp-2.jpg",
    images: [
      "/images/products/lamp-2.jpg",
      "/images/products/lamp-3.jpg",
      "/images/products/lamp-1.jpg"
    ],
    video_url: null,
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "2:00 PM – 6:00 PM",
    duration: "4 Hours",
    location: "National Crafts Museum & Hastkala Academy, Pragati Maidan, New Delhi",
    price: 1999,
    total_seats: 20,
    status: "upcoming",
    instructor_name: "Sindhe Vijay",
    instructor_role: "Master Artisan",
    instructor_experience: "25+ Years Experience",
    instructor_image: "/images/heritage/vijay-artisan.jpg",
    instructor_bio: "Preserving 8th generation leather craftsmanship from Jeekavandlapalli, Karnataka.",
    age_group: "10 Years & Above",
    what_you_will_learn: [
      "History of Luminous Leather Craft in Karnataka",
      "Pattern Geometry & Light Filtration Dynamics",
      "Precision Punching with Custom Iron Chisels",
      "Traditional Vegetable & Drawing Inks Application",
      "Lamp Shade Framing & Assembly"
    ],
    what_is_included: [
      "Pre-cut Goat Parchment Lamp Set",
      "Complete Tool Set & Natural Inks",
      "Wooden / Metal Lamp Base with Electrical Fitting & Warm LED Bulb",
      "Take-Home Finished Decorative Lamp",
      "Certificate of Participation"
    ],
    featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: "ws-storytelling-performance",
    slug: "shadow-puppetry-storytelling-and-screen-play",
    title: "Shadow Puppetry Storytelling & Live Screen Performance",
    short_description: "Master puppet manipulation, dialogue delivery, and live screen performance of epic Ramayana stories.",
    full_description: "Step behind the illuminated cloth screen! Discover the rhythm, voice modulations, and musical cues that bring 3-foot shadow puppets to life in front of audiences. A dynamic workshop for theatre practitioners, educators, and storytellers.",
    image_url: "/images/products/big-krishna-leela.jpg",
    images: [
      "/images/products/big-krishna-leela.jpg",
      "/images/products/big-ganesha.jpg"
    ],
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "11:00 AM – 3:00 PM (Daily)",
    duration: "4 Hours Daily (3-Day Series)",
    location: "Artisans Heritage Center, Jeekavandlapalli, Bagepalli, Karnataka",
    price: 3499,
    total_seats: 15,
    status: "ongoing",
    instructor_name: "Sindhe Vijay & Family",
    instructor_role: "Master Puppeteers",
    instructor_experience: "Heritage Troupe",
    instructor_image: "/images/heritage/vijay-artisan.jpg",
    instructor_bio: "The Sindhe family has enacted puppetry narratives across Karnataka, Andhra Pradesh, and international cultural festivals.",
    age_group: "All Ages Welcome",
    what_you_will_learn: [
      "Behind-the-Screen Puppet Articulation",
      "Vocal Modulation & Epic Characterization",
      "Traditional Percussion Cues & Light Management",
      "Staging a 10-Minute Group Performance"
    ],
    what_is_included: [
      "Access to Family Collection of Vintage Puppets",
      "Stage Screen Setup Experience",
      "Lunch & Traditional Rural Hospitality",
      "Certificate of Performance"
    ],
    featured: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_TESTIMONIALS: WorkshopTestimonial[] = [
  {
    id: "test-1",
    name: "Ananya Sharma",
    role: "Visual Arts Student, Chitrakala Parishath",
    review: "Learning from Sindhe Vijay Sir was an unforgettable experience. The precision of punching leather and seeing light shine through the puppet I made with my own hands was truly magical!",
    rating: 5,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "test-2",
    name: "Dr. Rajesh Kulkarni",
    role: "Cultural Heritage Researcher, Bengaluru",
    review: "A deeply authentic workshop. Sindhe Vijay doesn't just teach the craft; he shares the sacred folklore and oral history behind every single motif. Highly recommended for art lovers.",
    rating: 5,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "test-3",
    name: "Pooja & Vikram Mehta",
    role: "Designers, Delhi",
    review: "We took the leather lamp crafting masterclass in Delhi. The materials were 100% authentic, the tools were fascinating, and our lamp is now the centerpiece of our living room!",
    rating: 5,
    avatar_url: "",
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS: WorkshopSettings = {
  hero_title: "Hands-On Leather Puppet Workshops & Masterclasses",
  hero_subtitle: "Experience the sacred 8th-generation folk heritage of Thogalu Gombe. Learn parchment preparation, fine chisel punching, and screen manipulation directly from master artisan Sindhe Vijay.",
  hero_image: "/images/products/big-ganesha.jpg",
  instructor_name: "Sindhe Vijay",
  instructor_experience: "8th Generation Master Craftsman · 25+ Years Experience",
  instructor_bio: "Sindhe Vijay is a state-awarded master craftsman dedicated to preserving the rare craft of Karnataka Leather Shadow Puppetry (Thogalu Gombe). His workshops offer an authentic, hands-on journey into traditional Indian folk art.",
  instructor_image: "/images/heritage/vijay-artisan.jpg",
  default_learn_points: [
    "Introduction to Shadow Puppetry & Oral Heritage",
    "History & Mythology of Thogalu Gombe",
    "Goat Leather Parchment Preparation",
    "Drawing Sacred & Epic Designs on Parchment",
    "Traditional Iron Chisel Punching Techniques",
    "Painting with Natural Drawing Inks",
    "Limb Articulation & Stick Joint Assembly",
    "Shadow Puppet Screen Manipulation & Performance"
  ],
  default_inclusions: [
    "100% Authentic Cured Goat Hide Parchment",
    "Full Set of Traditional Tools & Chisels (workshop use)",
    "Natural Drawing Inks, Brushes & Fasteners",
    "Personal Guidance by Master Artisan Sindhe Vijay",
    "Official Certificate of Participation",
    "Take Home Your Complete Handmade Artwork"
  ]
};

// Local storage keys
const STORAGE_KEYS = {
  WORKSHOPS: "sindhe_workshops_data_v2",
  REGISTRATIONS: "sindhe_workshop_registrations_v2",
  GROUP_ENQUIRIES: "sindhe_group_enquiries_v2",
  TESTIMONIALS: "sindhe_workshop_testimonials_v2",
  SETTINGS: "sindhe_workshop_settings_v2"
};

export const workshopStorage = {
  // -------------------------------------------------------------
  // Workshops CRUD
  // -------------------------------------------------------------
  getWorkshops: (): WorkshopItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSHOPS);
      let workshops: WorkshopItem[];
      if (stored === null) {
        // Initialize with default mock workshops on very first visit only
        workshops = DEFAULT_WORKSHOPS;
        localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(DEFAULT_WORKSHOPS));
      } else {
        workshops = JSON.parse(stored);
      }

      if (!Array.isArray(workshops)) return [];

      // Calculate real-time booked & available seats
      const registrations = workshopStorage.getRegistrations();
      return workshops.map((ws) => {
        const booked = registrations
          .filter((r) => r.workshop_id === ws.id && r.status !== "Cancelled")
          .reduce((sum, r) => sum + (Number(r.seats_booked) || 1), 0);
        const available = Math.max(0, (ws.total_seats || 20) - booked);
        const isFull = available <= 0;

        return {
          ...ws,
          booked_seats: booked,
          available_seats: available,
          status: isFull && ws.status !== "completed" ? "full" : ws.status,
        };
      });
    } catch {
      return [];
    }
  },

  getWorkshopBySlugOrId: (slugOrId: string): WorkshopItem | null => {
    const decoded = decodeURIComponent(slugOrId).toLowerCase().trim();
    const all = workshopStorage.getWorkshops();
    return (
      all.find(
        (w) =>
          w.slug.toLowerCase() === decoded ||
          w.id.toLowerCase() === decoded ||
          slugify(w.title) === decoded
      ) || null
    );
  },

  saveWorkshop: (workshop: Partial<WorkshopItem> & { title: string }): WorkshopItem => {
    const all = workshopStorage.getWorkshops();
    const cleanSlug = slugify(workshop.slug || workshop.title);

    let savedItem: WorkshopItem;
    if (workshop.id) {
      // Update existing
      all.forEach((item, idx) => {
        if (item.id === workshop.id) {
          savedItem = {
            ...item,
            ...workshop,
            slug: cleanSlug,
            images: workshop.images || item.images || [workshop.image_url || item.image_url],
          } as WorkshopItem;
          all[idx] = savedItem;
        }
      });
    } else {
      // Create new
      savedItem = {
        id: `ws-${Date.now()}`,
        slug: cleanSlug,
        title: workshop.title,
        short_description: workshop.short_description || "",
        full_description: workshop.full_description || workshop.short_description || "",
        image_url: workshop.image_url || "/images/products/big-ganesha.jpg",
        images: workshop.images && workshop.images.length > 0 ? workshop.images : [workshop.image_url || "/images/products/big-ganesha.jpg"],
        video_url: workshop.video_url || null,
        date: workshop.date || new Date().toISOString().split("T")[0],
        end_date: workshop.end_date || workshop.date || new Date().toISOString().split("T")[0],
        time: workshop.time || "10:30 AM – 2:00 PM",
        duration: workshop.duration || "3.5 Hours",
        location: workshop.location || "Jeekavandlapalli, Karnataka",
        price: Number(workshop.price) || 1999,
        total_seats: Number(workshop.total_seats) || 25,
        status: workshop.status || "upcoming",
        instructor_name: workshop.instructor_name || "Sindhe Vijay",
        instructor_role: workshop.instructor_role || "8th-Generation Master Artisan",
        instructor_experience: workshop.instructor_experience || "25+ Years Experience",
        instructor_image: workshop.instructor_image || "/images/heritage/vijay-artisan.jpg",
        instructor_bio: workshop.instructor_bio || "Master Artisan preserving the sacred art of Thogalu Gombe.",
        age_group: workshop.age_group || "12 Years & Above",
        what_you_will_learn: workshop.what_you_will_learn || DEFAULT_SETTINGS.default_learn_points,
        what_is_included: workshop.what_is_included || DEFAULT_SETTINGS.default_inclusions,
        featured: Boolean(workshop.featured),
        created_at: new Date().toISOString(),
      };
      all.unshift(savedItem);
    }

    localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(all));

    // Also sync to Supabase events table in the background
    try {
      supabase.from("events").upsert({
        id: savedItem!.id,
        title: savedItem!.title,
        description: savedItem!.short_description,
        location: savedItem!.location,
        start_date: savedItem!.date,
        end_date: savedItem!.end_date || savedItem!.date,
        stall_no: savedItem!.time,
        image_url: savedItem!.image_url,
      }).then();
    } catch (e) {
      console.warn("Supabase background sync event skipped:", e);
    }

    return savedItem!;
  },

  deleteWorkshop: (id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSHOPS);
      const all: WorkshopItem[] = stored ? JSON.parse(stored) : [];
      const filtered = all.filter((w) => w.id !== id);
      localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(filtered));

      supabase.from("events").delete().eq("id", id).then();
    } catch (e) {
      console.error("Error deleting workshop:", e);
    }
  },

  deleteAllWorkshops: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify([]));
    } catch (e) {
      console.error("Error deleting all workshops:", e);
    }
  },

  // -------------------------------------------------------------
  // Registrations CRUD
  // -------------------------------------------------------------
  getRegistrations: (): WorkshopRegistration[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addRegistration: (data: Omit<WorkshopRegistration, "id" | "created_at">): WorkshopRegistration => {
    const all = workshopStorage.getRegistrations();
    const newReg: WorkshopRegistration = {
      ...data,
      id: `REG-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newReg);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(all));
    return newReg;
  },

  updateRegistrationStatus: (id: string, status: WorkshopRegistration["status"]): void => {
    const all = workshopStorage.getRegistrations();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updated));
  },

  deleteRegistration: (id: string): void => {
    const all = workshopStorage.getRegistrations().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(all));
  },

  // -------------------------------------------------------------
  // Group Enquiries CRUD
  // -------------------------------------------------------------
  getGroupEnquiries: (): GroupWorkshopEnquiry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUP_ENQUIRIES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addGroupEnquiry: (data: Omit<GroupWorkshopEnquiry, "id" | "created_at">): GroupWorkshopEnquiry => {
    const all = workshopStorage.getGroupEnquiries();
    const newEnquiry: GroupWorkshopEnquiry = {
      ...data,
      id: `GRP-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newEnquiry);
    localStorage.setItem(STORAGE_KEYS.GROUP_ENQUIRIES, JSON.stringify(all));
    return newEnquiry;
  },

  updateGroupEnquiryStatus: (id: string, status: GroupWorkshopEnquiry["status"]): void => {
    const all = workshopStorage.getGroupEnquiries();
    const updated = all.map((e) => (e.id === id ? { ...e, status } : e));
    localStorage.setItem(STORAGE_KEYS.GROUP_ENQUIRIES, JSON.stringify(updated));
  },

  deleteGroupEnquiry: (id: string): void => {
    const all = workshopStorage.getGroupEnquiries().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.GROUP_ENQUIRIES, JSON.stringify(all));
  },

  // -------------------------------------------------------------
  // Testimonials CRUD
  // -------------------------------------------------------------
  getTestimonials: (): WorkshopTestimonial[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      return stored ? JSON.parse(stored) : DEFAULT_TESTIMONIALS;
    } catch {
      return DEFAULT_TESTIMONIALS;
    }
  },

  saveTestimonial: (test: Partial<WorkshopTestimonial> & { name: string; review: string }): WorkshopTestimonial => {
    const all = workshopStorage.getTestimonials();
    let saved: WorkshopTestimonial;
    if (test.id) {
      all.forEach((item, i) => {
        if (item.id === test.id) {
          saved = { ...item, ...test } as WorkshopTestimonial;
          all[i] = saved;
        }
      });
    } else {
      saved = {
        id: `tst-${Date.now()}`,
        name: test.name,
        role: test.role || "Workshop Participant",
        review: test.review,
        rating: test.rating || 5,
        avatar_url: test.avatar_url || "",
        is_active: test.is_active !== undefined ? test.is_active : true,
        created_at: new Date().toISOString(),
      };
      all.unshift(saved);
    }
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(all));
    return saved!;
  },

  deleteTestimonial: (id: string): void => {
    const all = workshopStorage.getTestimonials().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(all));
  },

  // -------------------------------------------------------------
  // Page Settings
  // -------------------------------------------------------------
  getSettings: (): WorkshopSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: Partial<WorkshopSettings>): WorkshopSettings => {
    const current = workshopStorage.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },
};
