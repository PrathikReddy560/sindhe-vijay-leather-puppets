import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  workshopStorage,
  WorkshopItem,
  WorkshopRegistration,
  GroupWorkshopEnquiry,
  WorkshopTestimonial,
  WorkshopSettings,
} from "@/lib/workshopStorage";

export type {
  WorkshopItem,
  WorkshopRegistration,
  GroupWorkshopEnquiry,
  WorkshopTestimonial,
  WorkshopSettings,
};

// -------------------------------------------------------------
// Hooks
// -------------------------------------------------------------
export const useWorkshops = () => {
  return useQuery({
    queryKey: ["workshops_v2"],
    queryFn: async (): Promise<WorkshopItem[]> => {
      return workshopStorage.getWorkshops();
    },
  });
};

export const useWorkshop = (slugOrId: string) => {
  return useQuery({
    queryKey: ["workshop", slugOrId],
    queryFn: async (): Promise<WorkshopItem | null> => {
      if (!slugOrId) return null;
      return workshopStorage.getWorkshopBySlugOrId(slugOrId);
    },
    enabled: Boolean(slugOrId),
  });
};

export const useWorkshopRegistrations = () => {
  return useQuery({
    queryKey: ["workshop_registrations"],
    queryFn: async (): Promise<WorkshopRegistration[]> => {
      return workshopStorage.getRegistrations();
    },
  });
};

export const useGroupEnquiries = () => {
  return useQuery({
    queryKey: ["group_enquiries"],
    queryFn: async (): Promise<GroupWorkshopEnquiry[]> => {
      return workshopStorage.getGroupEnquiries();
    },
  });
};

export const useWorkshopTestimonials = () => {
  return useQuery({
    queryKey: ["workshop_testimonials"],
    queryFn: async (): Promise<WorkshopTestimonial[]> => {
      return workshopStorage.getTestimonials();
    },
  });
};

export const useWorkshopSettings = () => {
  return useQuery({
    queryKey: ["workshop_settings"],
    queryFn: async (): Promise<WorkshopSettings> => {
      return workshopStorage.getSettings();
    },
  });
};
