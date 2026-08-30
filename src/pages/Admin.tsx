import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Upload, Shield, Loader2, Package, MessageCircle, Mail, Image, Video, BookOpen, Calendar, Award, GraduationCap, Star, Users, CheckCircle2, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useWorkshops, useWorkshopRegistrations, useGroupEnquiries, useWorkshopTestimonials, useWorkshopSettings, WorkshopItem } from "@/hooks/useWorkshops";
import { workshopStorage } from "@/lib/workshopStorage";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadManager } from "@/components/admin/ImageUploadManager";
import { slugify, generateUniqueSlug } from "@/lib/slugify";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const emptyProduct = {
  slug: "",
  name: "",
  description: "",
  long_description: "",
  price: 0,
  discount_price: 0,
  category: "lamps",
  inventory_tag: "in-stock" as const,
  image_day: "",
  image_night: "",
  dimensions: "",
  material: "",
  featured: false,
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: products, isLoading } = useProducts();
  const { data: dbCategories } = useCategories();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // New Category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [uploadingCategoryImg, setUploadingCategoryImg] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  // Edit Category state
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<{
    id: string;
    name: string;
    slug: string;
    originalSlug: string;
    image_url: string;
    display_order: number;
  } | null>(null);
  const [savingCat, setSavingCat] = useState(false);
  const [uploadingEditCatImg, setUploadingEditCatImg] = useState(false);

  // Delete Category state
  const [catToDelete, setCatToDelete] = useState<any | null>(null);
  const [deleteCatDialogOpen, setDeleteCatDialogOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState(false);

  // Product images & gallery state (including Day & Night images)
  const [productImages, setProductImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [dayImage, setDayImage] = useState<string>("");
  const [nightImage, setNightImage] = useState<string>("");
  const [uploadingDayImg, setUploadingDayImg] = useState(false);
  const [uploadingNightImg, setUploadingNightImg] = useState(false);

  const getCategoryLabel = (slug: string) => {
    const found = dbCategories?.find((c: any) => c.slug === slug);
    return found ? found.name : slug;
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();
    const cleanSlug = slugify(newCategorySlug.trim() || trimmedName);

    if (!trimmedName || !cleanSlug) {
      toast({ title: "Error", description: "Name and Slug are required", variant: "destructive" });
      return;
    }

    // Check slug uniqueness
    const exists = dbCategories?.some((c: any) => c.slug?.toLowerCase() === cleanSlug.toLowerCase());
    if (exists) {
      toast({ title: "Slug already exists", description: "Please choose a unique category slug.", variant: "destructive" });
      return;
    }

    setAddingCategory(true);
    try {
      // Get max display order
      const { data: maxOrderData } = await supabase
        .from("categories")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData[0] ? (maxOrderData[0].display_order + 1) : 1;

      const { error } = await supabase
        .from("categories")
        .insert({
          name: trimmedName,
          slug: cleanSlug,
          display_order: nextOrder,
          image_url: newCategoryImage.trim() || null
        });

      if (error) throw error;

      toast({ title: "Category added successfully" });
      setNewCategoryName("");
      setNewCategorySlug("");
      setNewCategoryImage("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast({ title: "Error adding category", description: err.message, variant: "destructive" });
    } finally {
      setAddingCategory(false);
    }
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCat({
      id: cat.id,
      name: cat.name || "",
      slug: cat.slug || "",
      originalSlug: cat.slug || "",
      image_url: cat.image_url || "",
      display_order: cat.display_order || 1,
    });
    setEditCatOpen(true);
  };

  const handleSaveEditedCategory = async () => {
    if (!editingCat) return;
    const trimmedName = editingCat.name.trim();
    const cleanSlug = slugify(editingCat.slug.trim() || trimmedName);

    if (!trimmedName || !cleanSlug) {
      toast({ title: "Error", description: "Category Name and Slug cannot be empty.", variant: "destructive" });
      return;
    }

    // Check uniqueness excluding itself
    const slugCollision = dbCategories?.some(
      (c: any) => c.id !== editingCat.id && c.slug?.toLowerCase() === cleanSlug.toLowerCase()
    );
    if (slugCollision) {
      toast({ title: "Slug already in use", description: "Please enter a unique slug for this category.", variant: "destructive" });
      return;
    }

    setSavingCat(true);
    try {
      // 1. If slug changed, update products referencing the old slug to prevent broken links
      if (editingCat.originalSlug && editingCat.originalSlug !== cleanSlug) {
        const { error: prodUpdateError } = await supabase
          .from("products")
          .update({ category: cleanSlug })
          .eq("category", editingCat.originalSlug);

        if (prodUpdateError) {
          console.warn("Could not cascade category slug update to products:", prodUpdateError);
        }
      }

      // 2. Update category record
      const { error } = await supabase
        .from("categories")
        .update({
          name: trimmedName,
          slug: cleanSlug,
          image_url: editingCat.image_url.trim() || null,
          display_order: Number(editingCat.display_order) || 1,
        })
        .eq("id", editingCat.id);

      if (error) throw error;

      toast({ title: "Category updated successfully" });
      setEditCatOpen(false);
      setEditingCat(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast({ title: "Error updating category", description: err.message, variant: "destructive" });
    } finally {
      setSavingCat(false);
    }
  };

  const handleOpenDeleteCategory = (cat: any) => {
    setCatToDelete(cat);
    setDeleteCatDialogOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!catToDelete) return;
    setDeletingCat(true);

    try {
      const { error } = await supabase.from("categories").delete().eq("id", catToDelete.id);
      if (error) throw error;

      toast({ title: "Category deleted successfully" });
      setDeleteCatDialogOpen(false);
      setCatToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast({ title: "Error deleting category", description: err.message, variant: "destructive" });
    } finally {
      setDeletingCat(false);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof emptyProduct & { id?: string }>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploadingDay, setUploadingDay] = useState(false);
  const [uploadingNight, setUploadingNight] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("products");

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Hero slides state
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [heroSlidesLoading, setHeroSlidesLoading] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [customSlideUrl, setCustomSlideUrl] = useState("");


  // Videos state
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);

  // Stories state
  const [stories, setStories] = useState<any[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryText, setNewStoryText] = useState("");
  const [newStoryImage, setNewStoryImage] = useState("");
  const [uploadingStoryImg, setUploadingStoryImg] = useState(false);
  const [savingStory, setSavingStory] = useState(false);

  // Events state
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventStartDate, setNewEventStartDate] = useState("");
  const [newEventEndDate, setNewEventEndDate] = useState("");
  const [newEventStallNo, setNewEventStallNo] = useState("");
  const [newEventImage, setNewEventImage] = useState("");
  const [uploadingEventImg, setUploadingEventImg] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  // Workshops state
  const [newWsTitle, setNewWsTitle] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [newWsLocation, setNewWsLocation] = useState("");
  const [newWsStartDate, setNewWsStartDate] = useState("");
  const [newWsEndDate, setNewWsEndDate] = useState("");
  const [newWsTimings, setNewWsTimings] = useState("");
  const [newWsImage, setNewWsImage] = useState("");
  const [newWsVideo, setNewWsVideo] = useState("");
  const [uploadingWsImg, setUploadingWsImg] = useState(false);
  const [savingWs, setSavingWs] = useState(false);

  const [editWsOpen, setEditWsOpen] = useState(false);
  const [editingWs, setEditingWs] = useState<any | null>(null);
  const [uploadingEditWsImg, setUploadingEditWsImg] = useState(false);
  const [savingEditWs, setSavingEditWs] = useState(false);

  // Achievements state
  const [achievementsList, setAchievementsList] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [newAchTitle, setNewAchTitle] = useState("");
  const [newAchDesc, setNewAchDesc] = useState("");
  const [newAchImage, setNewAchImage] = useState("");
  const [uploadingAchImg, setUploadingAchImg] = useState(false);
  const [savingAch, setSavingAch] = useState(false);

  const handleUploadCategoryImg = async (file: File) => {
    setUploadingCategoryImg(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setNewCategoryImage(publicUrl);
      toast({ title: "Category image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingCategoryImg(false);
    }
  };

  const handleUploadStoryImg = async (file: File) => {
    setUploadingStoryImg(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `stories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setNewStoryImage(publicUrl);
      toast({ title: "Story image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingStoryImg(false);
    }
  };

  const handleUploadEventImg = async (file: File) => {
    setUploadingEventImg(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setNewEventImage(publicUrl);
      toast({ title: "Event image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingEventImg(false);
    }
  };

  const handleUploadAchImg = async (file: File) => {
    setUploadingAchImg(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `achievements/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setNewAchImage(publicUrl);
      toast({ title: "Achievement image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAchImg(false);
    }
  };

  const fetchVideos = async () => {
    setVideosLoading(true);
    const { data, error } = await supabase.from("showcase_videos").select("*").order("created_at", { ascending: false });
    if (!error && data) setVideos(data);
    setVideosLoading(false);
  };

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return;
    setSavingVideo(true);
    try {
      const { error } = await supabase.from("showcase_videos").insert({
        video_url: newVideoUrl.trim(),
        title: newVideoTitle.trim() || null
      });
      if (error) throw error;
      toast({ title: "Video added successfully" });
      setNewVideoUrl("");
      setNewVideoTitle("");
      fetchVideos();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      const { error } = await supabase.from("showcase_videos").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Video deleted" });
      fetchVideos();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const fetchStories = async () => {
    setStoriesLoading(true);
    const { data, error } = await supabase.from("art_stories").select("*").order("created_at", { ascending: false });
    if (!error && data) setStories(data);
    setStoriesLoading(false);
  };

  const handleAddStory = async () => {
    if (!newStoryTitle.trim() || !newStoryText.trim() || !newStoryImage.trim()) {
      toast({ title: "Error", description: "Title, Story text, and Image are required", variant: "destructive" });
      return;
    }
    setSavingStory(true);
    try {
      const { error } = await supabase.from("art_stories").insert({
        title: newStoryTitle.trim(),
        story: newStoryText.trim(),
        image_url: newStoryImage.trim()
      });
      if (error) throw error;
      toast({ title: "Story added successfully" });
      setNewStoryTitle("");
      setNewStoryText("");
      setNewStoryImage("");
      fetchStories();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingStory(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      const { error } = await supabase.from("art_stories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Story deleted" });
      fetchStories();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("start_date", { ascending: true });
    if (!error && data) setEventsList(data);
    setEventsLoading(false);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !newEventDesc.trim() || !newEventLocation.trim() || !newEventStartDate || !newEventEndDate) {
      toast({ title: "Error", description: "Title, Description, Location, and Dates are required", variant: "destructive" });
      return;
    }
    setSavingEvent(true);
    try {
      const { error } = await supabase.from("events").insert({
        title: newEventTitle.trim(),
        description: newEventDesc.trim(),
        location: newEventLocation.trim(),
        start_date: newEventStartDate,
        end_date: newEventEndDate,
        stall_no: newEventStallNo.trim() || null,
        image_url: newEventImage.trim() || null
      });
      if (error) throw error;
      toast({ title: "Event added successfully" });
      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventLocation("");
      setNewEventStartDate("");
      setNewEventEndDate("");
      setNewEventStallNo("");
      setNewEventImage("");
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Event deleted" });
      fetchEvents();
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUploadWsImg = async (file: File, isEdit: boolean = false) => {
    const setter = isEdit ? setUploadingEditWsImg : setUploadingWsImg;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `workshops/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      if (isEdit) {
        setEditingWs((prev: any) => (prev ? { ...prev, image_url: publicUrl } : null));
      } else {
        setNewWsImage(publicUrl);
      }
      toast({ title: "Workshop image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  // Workshops Management Hooks & State
  const { data: adminWorkshops } = useWorkshops();
  const { data: adminRegistrations } = useWorkshopRegistrations();
  const { data: adminGroupEnquiries } = useGroupEnquiries();
  const { data: adminTestimonials } = useWorkshopTestimonials();
  const { data: adminSettings } = useWorkshopSettings();

  const [wsSubTab, setWsSubTab] = useState<"workshops" | "registrations" | "enquiries" | "testimonials" | "settings">("workshops");
  const [editingWorkshopImages, setEditingWorkshopImages] = useState<string[]>([]);
  const [editingWorkshopFeatured, setEditingWorkshopFeatured] = useState<string>("");

  // Testimonial add state
  const [newTestName, setNewTestName] = useState("");
  const [newTestRole, setNewTestRole] = useState("");
  const [newTestReview, setNewTestReview] = useState("");
  const [newTestRating, setNewTestRating] = useState(5);

  // Settings state
  const [settingHeroTitle, setSettingHeroTitle] = useState("");
  const [settingHeroSubtitle, setSettingHeroSubtitle] = useState("");
  const [settingInstructorName, setSettingInstructorName] = useState("");
  const [settingInstructorExp, setSettingInstructorExp] = useState("");
  const [settingInstructorBio, setSettingInstructorBio] = useState("");

  const handleOpenEditWorkshop = (ws: WorkshopItem) => {
    const wsImgs = ws.images && ws.images.length > 0 ? ws.images : [ws.image_url];
    setEditingWs({
      ...ws,
      images: wsImgs,
      what_you_will_learn: ws.what_you_will_learn || [],
      what_is_included: ws.what_is_included || [],
    });
    setEditingWorkshopImages(wsImgs);
    setEditingWorkshopFeatured(ws.image_url || wsImgs[0] || "");
    setEditWsOpen(true);
  };

  const handleOpenNewWorkshop = () => {
    const emptyWs: Partial<WorkshopItem> = {
      title: "",
      slug: "",
      short_description: "",
      full_description: "",
      date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      time: "10:30 AM – 2:00 PM",
      duration: "3.5 Hours",
      location: "Jeekavandlapalli, Karnataka",
      price: 1999,
      total_seats: 25,
      status: "upcoming",
      image_url: "/images/products/big-ganesha.jpg",
      images: ["/images/products/big-ganesha.jpg"],
      video_url: "",
      instructor_name: "Sindhe Vijay",
      instructor_role: "8th-Generation Master Artisan",
      instructor_experience: "25+ Years Heritage",
      instructor_bio: "State Awardee Master Craftsman preserving Thogalu Gombe.",
      age_group: "12 Years & Above",
    };
    setEditingWs(emptyWs);
    setEditingWorkshopImages(["/images/products/big-ganesha.jpg"]);
    setEditingWorkshopFeatured("/images/products/big-ganesha.jpg");
    setEditWsOpen(true);
  };

  const handleSaveWorkshopData = async () => {
    if (!editingWs || !editingWs.title?.trim() || !editingWs.date || !editingWs.location?.trim()) {
      toast({
        title: "Missing fields",
        description: "Workshop Title, Date, and Location are required.",
        variant: "destructive",
      });
      return;
    }
    setSavingEditWs(true);
    try {
      const mainImg = editingWorkshopFeatured || editingWorkshopImages[0] || "/images/products/big-ganesha.jpg";
      workshopStorage.saveWorkshop({
        ...editingWs,
        title: editingWs.title.trim(),
        image_url: mainImg,
        images: editingWorkshopImages.length > 0 ? editingWorkshopImages : [mainImg],
      });

      queryClient.invalidateQueries({ queryKey: ["workshops_v2"] });
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      queryClient.invalidateQueries({ queryKey: ["workshop"] });

      toast({ title: "Workshop saved successfully" });
      setEditWsOpen(false);
      setEditingWs(null);
    } catch (err: any) {
      toast({ title: "Error saving workshop", description: err.message, variant: "destructive" });
    } finally {
      setSavingEditWs(false);
    }
  };

  const handleDeleteWorkshopData = (id: string) => {
    workshopStorage.deleteWorkshop(id);
    queryClient.invalidateQueries({ queryKey: ["workshops_v2"] });
    queryClient.invalidateQueries({ queryKey: ["workshops"] });
    toast({ title: "Workshop deleted" });
  };

  const handleToggleWorkshopStatus = (ws: WorkshopItem, newStatus: WorkshopItem["status"]) => {
    workshopStorage.saveWorkshop({
      ...ws,
      status: newStatus,
    });
    queryClient.invalidateQueries({ queryKey: ["workshops_v2"] });
    toast({ title: `Workshop status updated to ${newStatus}` });
  };

  const handleUpdateRegStatus = (regId: string, newStatus: any) => {
    workshopStorage.updateRegistrationStatus(regId, newStatus);
    queryClient.invalidateQueries({ queryKey: ["workshop_registrations"] });
    queryClient.invalidateQueries({ queryKey: ["workshops_v2"] });
    toast({ title: "Registration status updated" });
  };

  const handleDeleteReg = (regId: string) => {
    workshopStorage.deleteRegistration(regId);
    queryClient.invalidateQueries({ queryKey: ["workshop_registrations"] });
    queryClient.invalidateQueries({ queryKey: ["workshops_v2"] });
    toast({ title: "Registration deleted" });
  };

  const handleUpdateGroupEnquiryStatus = (enquiryId: string, newStatus: any) => {
    workshopStorage.updateGroupEnquiryStatus(enquiryId, newStatus);
    queryClient.invalidateQueries({ queryKey: ["group_enquiries"] });
    toast({ title: "Group enquiry status updated" });
  };

  const handleDeleteGroupEnquiry = (enquiryId: string) => {
    workshopStorage.deleteGroupEnquiry(enquiryId);
    queryClient.invalidateQueries({ queryKey: ["group_enquiries"] });
    toast({ title: "Group enquiry deleted" });
  };

  const handleAddTestimonialData = () => {
    if (!newTestName.trim() || !newTestReview.trim()) {
      toast({ title: "Missing fields", description: "Name and Review are required.", variant: "destructive" });
      return;
    }
    workshopStorage.saveTestimonial({
      name: newTestName.trim(),
      role: newTestRole.trim() || "Participant",
      review: newTestReview.trim(),
      rating: newTestRating,
      is_active: true,
    });
    queryClient.invalidateQueries({ queryKey: ["workshop_testimonials"] });
    setNewTestName("");
    setNewTestRole("");
    setNewTestReview("");
    toast({ title: "Testimonial added" });
  };

  const handleDeleteTestimonialData = (id: string) => {
    workshopStorage.deleteTestimonial(id);
    queryClient.invalidateQueries({ queryKey: ["workshop_testimonials"] });
    toast({ title: "Testimonial deleted" });
  };

  const handleSaveWorkshopSettings = () => {
    workshopStorage.saveSettings({
      hero_title: settingHeroTitle || adminSettings?.hero_title,
      hero_subtitle: settingHeroSubtitle || adminSettings?.hero_subtitle,
      instructor_name: settingInstructorName || adminSettings?.instructor_name,
      instructor_experience: settingInstructorExp || adminSettings?.instructor_experience,
      instructor_bio: settingInstructorBio || adminSettings?.instructor_bio,
    });
    queryClient.invalidateQueries({ queryKey: ["workshop_settings"] });
    toast({ title: "Workshop settings saved" });
  };

  const fetchAchievements = async () => {
    setAchievementsLoading(true);
    const { data, error } = await supabase.from("achievements").select("*").order("created_at", { ascending: false });
    if (!error && data) setAchievementsList(data);
    setAchievementsLoading(false);
  };

  const handleAddAchievement = async () => {
    if (!newAchTitle.trim() || !newAchDesc.trim() || !newAchImage.trim()) {
      toast({ title: "Error", description: "Title, Description, and Image are required", variant: "destructive" });
      return;
    }
    setSavingAch(true);
    try {
      const { error } = await supabase.from("achievements").insert({
        title: newAchTitle.trim(),
        description: newAchDesc.trim(),
        image_url: newAchImage.trim()
      });
      if (error) throw error;
      toast({ title: "Achievement added successfully" });
      setNewAchTitle("");
      setNewAchDesc("");
      setNewAchImage("");
      fetchAchievements();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingAch(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase.from("achievements").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Achievement deleted" });
      fetchAchievements();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setOrdersLoading(false);
  };

  const fetchHeroSlides = async () => {
    setHeroSlidesLoading(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setHeroSlides(data);
    setHeroSlidesLoading(false);
  };

  const handleUploadSlide = async (file: File) => {
    setUploadingSlide(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero-slides/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("hero_slides")
        .insert({ image_url: publicUrl });

      if (insertError) throw insertError;

      toast({ title: "Background uploaded", description: "Image successfully added to backgrounds slideshow." });
      fetchHeroSlides();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingSlide(false);
    }
  };

  const handleAddCustomSlideUrl = async () => {
    if (!customSlideUrl.trim()) return;
    try {
      const { error } = await supabase
        .from("hero_slides")
        .insert({ image_url: customSlideUrl.trim() });
      if (error) throw error;
      toast({ title: "Background added", description: "Image URL successfully added to backgrounds slideshow." });
      setCustomSlideUrl("");
      fetchHeroSlides();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteSlide = async (id: string) => {
    try {
      const { error } = await supabase
        .from("hero_slides")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Background deleted" });
      fetchHeroSlides();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "backgrounds") fetchHeroSlides();
      if (activeTab === "videos") fetchVideos();
      if (activeTab === "stories") fetchStories();
      if (activeTab === "events_admin") fetchEvents();
      if (activeTab === "achievements_admin") fetchAchievements();
    }
  }, [isAdmin, activeTab]);

  const getWhatsAppMessage = (order: any, newStatus: string) => {
    const statusMessages: Record<string, string> = {
      pending: "Your order is pending confirmation.",
      confirmed: "Your order has been confirmed and is being prepared! 🎉",
      shipped: "Your order has been shipped and is on its way! 🚚",
      delivered: "Your order has been delivered! Thank you for shopping with us! 📦",
      cancelled: "Your order has been cancelled. Please contact us if you have questions.",
    };
    const items = order.order_items?.map((i: any) => `• ${i.product_name} × ${i.quantity}`).join("\n") || "";
    return encodeURIComponent(
      `Hi ${order.shipping_name},\n\n` +
      `*Order Update - #${order.order_id}*\n` +
      `Status: *${newStatus.toUpperCase()}*\n\n` +
      `${statusMessages[newStatus] || "Your order status has been updated."}\n\n` +
      `${items ? `Items:\n${items}\n\n` : ""}` +
      `Total: ₹${order.total?.toLocaleString("en-IN")}\n\n` +
      `– Sindhe Vijay Leather Puppets`
    );
  };

  const sendEmailNotification = async (order: any, newStatus: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-order-notification", {
        body: {
          userId: order.user_id,
          customerName: order.shipping_name,
          orderId: order.order_id,
          newStatus,
          orderTotal: order.total,
          items: order.order_items,
        },
      });
      if (error) {
        // Log error but don't block - email is optional until domain is verified
        console.warn("Email notification skipped (Resend domain not verified):", error.message);
        return;
      }
      toast({ title: "📧 Email notification sent" });
    } catch (err: any) {
      // Silently log - don't show error toast for email failures
      console.warn("Email notification skipped:", err.message);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as Database["public"]["Enums"]["order_status"] })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setUpdatingOrderId(null);
      return;
    }

    toast({ title: "Order status updated" });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingOrderId(null);

    // Open WhatsApp with pre-filled message
    const phone = order.shipping_phone?.replace(/\D/g, "");
    if (phone) {
      const waPhone = phone.startsWith("91") ? phone : `91${phone}`;
      const waUrl = `https://wa.me/${waPhone}?text=${getWhatsAppMessage(order, newStatus)}`;
      window.open(waUrl, "_blank");
    }

    // Send email notification via edge function
    sendEmailNotification(order, newStatus);
  };

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter((o) => o.status === orderFilter);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="font-serif text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const handleUploadSingleDayNight = async (file: File, type: "day" | "night") => {
    const setter = type === "day" ? setUploadingDayImg : setUploadingNightImg;
    setter(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const cleanName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
      const path = `products/${Date.now()}_${type}_${cleanName}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      if (publicUrl) {
        if (type === "day") {
          setDayImage(publicUrl);
          setFeaturedImage(publicUrl);
        } else {
          setNightImage(publicUrl);
        }
        setProductImages((prev) => (prev.includes(publicUrl) ? prev : [publicUrl, ...prev]));
        toast({ title: `${type === "day" ? "Day View" : "Night View"} image uploaded` });
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = editingProduct.name.trim();
    const cleanSlug = slugify(editingProduct.slug.trim() || trimmedName);

    if (!trimmedName || !cleanSlug) {
      toast({ title: "Missing fields", description: "Product Name and Slug are required.", variant: "destructive" });
      return;
    }

    if (productImages.length === 0 && !dayImage) {
      toast({ title: "Image required", description: "Please upload or provide at least one product image.", variant: "destructive" });
      return;
    }

    // Check slug uniqueness
    const collision = products?.some(
      (p) => p.id !== editingProduct.id && (p.slug?.toLowerCase() === cleanSlug.toLowerCase() || slugify(p.name) === cleanSlug)
    );
    if (collision) {
      toast({
        title: "Slug already in use",
        description: "This slug is already used by another product. Please adjust the slug.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const mainDayImage = dayImage || featuredImage || productImages[0];
      const mainNightImage = nightImage || (productImages.length > 1 && productImages[1] !== mainDayImage ? productImages[1] : null);

      // Reorder gallery to have Day image first, Night image second (if present), then remaining
      const otherImages = productImages.filter((img) => img !== mainDayImage && img !== mainNightImage);
      const reorderedGallery = [
        mainDayImage,
        ...(mainNightImage ? [mainNightImage] : []),
        ...otherImages,
      ].filter(Boolean);

      const payload = {
        slug: cleanSlug,
        name: trimmedName,
        description: editingProduct.description.trim(),
        long_description: editingProduct.long_description.trim(),
        price: editingProduct.price,
        discount_price: editingProduct.discount_price ? editingProduct.discount_price : null,
        category: editingProduct.category,
        inventory_tag: editingProduct.inventory_tag,
        image_day: mainDayImage,
        image_night: mainNightImage || (reorderedGallery.length > 1 ? JSON.stringify(reorderedGallery) : null),
        dimensions: editingProduct.dimensions?.trim() || null,
        material: editingProduct.material.trim(),
        featured: editingProduct.featured,
      };

      if (editingProduct.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast({ title: "Product created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setEditingProduct(emptyProduct);
      setProductImages([]);
      setFeaturedImage("");
      setDayImage("");
      setNightImage("");
    } catch (err: any) {
      toast({ title: "Error saving product", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  const openEdit = (p: DbProduct) => {
    // Parse multi-image gallery
    let gallery: string[] = [];
    let detectedNightImg = "";

    if (p.image_night) {
      try {
        const parsed = JSON.parse(p.image_night);
        if (Array.isArray(parsed)) {
          gallery = parsed.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
          detectedNightImg = gallery.find((url) => url !== p.image_day) || "";
        } else if (typeof parsed === "string") {
          gallery = [parsed];
          detectedNightImg = parsed;
        }
      } catch {
        if (p.image_night !== p.image_day) {
          gallery = [p.image_night];
          detectedNightImg = p.image_night;
        }
      }
    }

    const allImages = Array.from(new Set([p.image_day, ...gallery].filter(Boolean)));

    setEditingProduct({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || "",
      long_description: p.long_description || "",
      price: p.price,
      discount_price: p.discount_price || 0,
      category: p.category as typeof emptyProduct.category,
      inventory_tag: p.inventory_tag as typeof emptyProduct.inventory_tag,
      image_day: p.image_day || "",
      image_night: p.image_night || "",
      dimensions: p.dimensions || "",
      material: p.material || "",
      featured: p.featured,
    });

    setProductImages(allImages);
    setFeaturedImage(p.image_day || allImages[0] || "");
    setDayImage(p.image_day || allImages[0] || "");
    setNightImage(detectedNightImg || (allImages.length > 1 ? allImages[1] : ""));
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingProduct(emptyProduct);
    setProductImages([]);
    setFeaturedImage("");
    setDayImage("");
    setNightImage("");
    setDialogOpen(true);
  };

  const filtered = filterCategory === "all"
    ? products
    : products?.filter((p) => p.category === filterCategory);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Admin Panel</h1>
        <p className="mt-1 text-muted-foreground">Manage products, orders, and more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-lg">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="gap-2">
            <Image className="h-4 w-4" /> Backgrounds
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Plus className="h-4 w-4" /> Categories
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" /> Videos
          </TabsTrigger>
          <TabsTrigger value="stories" className="gap-2">
            <BookOpen className="h-4 w-4" /> Stories
          </TabsTrigger>
          <TabsTrigger value="workshops_admin" className="gap-2">
            <GraduationCap className="h-4 w-4" /> Workshops
          </TabsTrigger>
          <TabsTrigger value="events_admin" className="gap-2">
            <Calendar className="h-4 w-4" /> Events
          </TabsTrigger>
          <TabsTrigger value="achievements_admin" className="gap-2">
            <Award className="h-4 w-4" /> Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="mb-6 flex items-center justify-between">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif">
                    {editingProduct.id ? "Edit Product" : "New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={editingProduct.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          setEditingProduct((p) => ({
                            ...p,
                            name: newName,
                            // Auto-generate unique slug if creating new product or if slug matches old generated slug
                            slug: !editingProduct.id
                              ? generateUniqueSlug(newName, (products || []).map((x) => x.slug))
                              : p.slug,
                          }));
                        }}
                        placeholder="e.g. Floral Folk Lamp 8 Inches"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL identifier) *</Label>
                      <Input
                        id="slug"
                        value={editingProduct.slug}
                        onChange={(e) =>
                          setEditingProduct((p) => ({
                            ...p,
                            slug: slugify(e.target.value),
                          }))
                        }
                        placeholder="floral-folk-lamp-8inches"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea id="description" rows={2} value={editingProduct.description} onChange={(e) => setEditingProduct((p) => ({ ...p, description: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDesc">Long Description</Label>
                    <Textarea id="longDesc" rows={4} value={editingProduct.long_description} onChange={(e) => setEditingProduct((p) => ({ ...p, long_description: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input id="price" type="number" value={editingProduct.price || ""} onChange={(e) => setEditingProduct((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount_price">Discount Price (₹)</Label>
                      <Input id="discount_price" type="number" value={editingProduct.discount_price || ""} onChange={(e) => setEditingProduct((p) => ({ ...p, discount_price: parseInt(e.target.value) || 0 }))} placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={editingProduct.category} onValueChange={(v: any) => setEditingProduct((p) => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(dbCategories || []).map((cat) => (
                            <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Inventory</Label>
                      <Select value={editingProduct.inventory_tag} onValueChange={(v: any) => setEditingProduct((p) => ({ ...p, inventory_tag: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-stock">In Stock</SelectItem>
                          <SelectItem value="made-to-order">Made to Order</SelectItem>
                          <SelectItem value="limited-edition">Limited Edition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input id="dimensions" value={editingProduct.dimensions} onChange={(e) => setEditingProduct((p) => ({ ...p, dimensions: e.target.value }))} placeholder='e.g. 35" × 25"' />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input id="material" value={editingProduct.material} onChange={(e) => setEditingProduct((p) => ({ ...p, material: e.target.value }))} />
                    </div>
                  </div>

                  {/* Day & Night Views Spotlight */}
                  <div className="pt-3 border-t space-y-3">
                    <div>
                      <Label className="text-base font-serif font-bold text-foreground">
                        Day & Night Product Views
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Traditional leather puppets & lamps have unlit (Day) and backlit/illuminated (Night) states.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Day View Box */}
                      <div className="p-3 rounded-lg border bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Sun className="h-3.5 w-3.5 fill-current" /> ☀️ Day View (Natural)
                          </span>
                          {dayImage && <Badge variant="outline" className="text-[10px] text-green-600">Active</Badge>}
                        </div>

                        <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted/40 border relative flex items-center justify-center">
                          {dayImage ? (
                            <img src={dayImage} alt="Day View" className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="text-center p-3 text-xs text-muted-foreground">
                              <Sun className="h-6 w-6 mx-auto mb-1 text-amber-500 opacity-60" />
                              <span>No Day Image set</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="*/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleUploadSingleDayNight(e.target.files[0], "day")}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-7 gap-1"
                              disabled={uploadingDayImg}
                              asChild
                            >
                              <span>
                                {uploadingDayImg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                Upload Day Image
                              </span>
                            </Button>
                          </label>
                          {dayImage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2"
                              onClick={() => setDayImage("")}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Night View Box */}
                      <div className="p-3 rounded-lg border bg-black/90 text-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                            <Moon className="h-3.5 w-3.5 fill-current text-indigo-400" /> 🌙 Night View (Illuminated)
                          </span>
                          {nightImage && <Badge className="bg-indigo-600 text-white text-[10px]">Active</Badge>}
                        </div>

                        <div className="aspect-[4/3] rounded-md overflow-hidden bg-black border border-white/10 relative flex items-center justify-center">
                          {nightImage ? (
                            <img
                              src={nightImage}
                              alt="Night View"
                              className="w-full h-full object-contain p-1 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                            />
                          ) : (
                            <div className="text-center p-3 text-xs text-white/50">
                              <Moon className="h-6 w-6 mx-auto mb-1 text-indigo-400 opacity-60" />
                              <span>No Night/Illuminated Image set</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="*/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleUploadSingleDayNight(e.target.files[0], "night")}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-7 gap-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
                              disabled={uploadingNightImg}
                              asChild
                            >
                              <span>
                                {uploadingNightImg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                Upload Night Image
                              </span>
                            </Button>
                          </label>
                          {nightImage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-400 hover:bg-red-500/20 px-2"
                              onClick={() => setNightImage("")}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Image & File Gallery Upload Manager */}
                  <div className="pt-3 border-t">
                    <ImageUploadManager
                      title="All Product Media & File Gallery"
                      images={productImages}
                      onChange={setProductImages}
                      featuredImage={featuredImage}
                      onFeaturedChange={setFeaturedImage}
                      dayImage={dayImage}
                      onDayImageChange={setDayImage}
                      nightImage={nightImage}
                      onNightImageChange={setNightImage}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={editingProduct.featured}
                      onCheckedChange={(v) => setEditingProduct((p) => ({ ...p, featured: v }))}
                    />
                    <Label>Featured Product on Home Page</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct.id ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{products?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{products?.filter((p) => p.featured).length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{new Set(products?.map((p) => p.category)).size || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-4 flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Filter:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(dbCategories || []).map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img src={product.image_day} alt="" className="h-12 w-12 rounded object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={product.inventory_tag === "in-stock" ? "outline" : product.inventory_tag === "limited-edition" ? "default" : "secondary"}>
                          {product.inventory_tag}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.featured ? "⭐" : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No products found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {/* Order Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{orders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{orders.filter((o) => o.status === "pending").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{orders.filter((o) => o.status === "confirmed").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{orders.filter((o) => o.status === "delivered").length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Filter */}
          <div className="mb-4 flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Filter:</Label>
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
              Refresh
            </Button>
          </div>

          {/* Orders Table */}
          {ordersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{order.shipping_name}</p>
                          <p className="text-muted-foreground">{order.shipping_phone}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping_city}, {order.shipping_state}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              <img src={item.product_image} alt="" className="h-8 w-8 rounded object-cover" />
                              <span>{item.product_name} × {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === "delivered" ? "default" :
                          order.status === "cancelled" ? "destructive" :
                          order.status === "shipped" ? "secondary" :
                          "outline"
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateOrderStatus(order.id, v)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-32">
                            {updatingOrderId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No orders found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="backgrounds">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif">Manage Hero Slideshow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Add New Background Image</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload an image file or paste a direct image URL. Uploaded images will be saved in your Supabase storage.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  {/* File Upload */}
                  <div className="flex-1 space-y-2">
                    <Label>Upload Image File</Label>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="*/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleUploadSlide(e.target.files[0])}
                          disabled={uploadingSlide}
                        />
                        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {uploadingSlide ? "Uploading..." : "Choose image to upload..."}
                          </span>
                        </div>
                      </label>
                      {uploadingSlide && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                    </div>
                  </div>

                  <div className="text-center font-medium text-muted-foreground py-2 sm:py-0">OR</div>

                  {/* Custom URL */}
                  <div className="flex-[1.5] space-y-2">
                    <Label htmlFor="customSlideUrl">Paste Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customSlideUrl"
                        placeholder="https://example.com/image.jpg"
                        value={customSlideUrl}
                        onChange={(e) => setCustomSlideUrl(e.target.value)}
                      />
                      <Button onClick={handleAddCustomSlideUrl} disabled={!customSlideUrl.trim()}>
                        Add URL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Slides Grid */}
          <div>
            <h3 className="font-serif text-xl font-semibold mb-4 text-foreground">Current Background Slides</h3>
            {heroSlidesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {heroSlides.map((slide, index) => (
                  <Card key={slide.id} className="relative overflow-hidden group">
                    <div className="aspect-[16/10] bg-muted relative">
                      <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Background Image</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this image from the slideshow?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSlide(slide.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="p-3 bg-card border-t flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Slide #{index + 1}</span>
                      <a href={slide.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        View Full Image
                      </a>
                    </div>
                  </Card>
                ))}

                {heroSlides.length === 0 && (
                  <div className="col-span-full py-12 text-center border rounded-lg bg-card text-muted-foreground">
                    <Image className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="font-medium">No custom background images found.</p>
                    <p className="text-sm">The homepage is currently falling back to default leather art pictures.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Create Category Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Add Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name</Label>
                  <Input
                    id="catName"
                    placeholder="e.g. Story Paintings"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      // Auto-generate slug
                      setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catSlug">Category Slug</Label>
                  <Input
                    id="catSlug"
                    placeholder="e.g. story-paintings"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category Image</Label>
                  {newCategoryImage && (
                    <img src={newCategoryImage} alt="Preview" className="h-24 w-full rounded-md border object-cover bg-muted" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={newCategoryImage}
                      onChange={(e) => setNewCategoryImage(e.target.value)}
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="*/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUploadCategoryImg(e.target.files[0])}
                      />
                      <Button type="button" variant="outline" size="icon" disabled={uploadingCategoryImg} asChild>
                        <span>{uploadingCategoryImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                      </Button>
                    </label>
                  </div>
                </div>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={handleAddCategory} disabled={addingCategory}>
                  {addingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Category
                </Button>
              </CardContent>
            </Card>

            {/* List Categories Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Current Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Thumbnail</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(dbCategories || []).map((cat, index) => (
                        <TableRow key={cat.id || cat.slug}>
                          <TableCell className="font-medium">{cat.display_order || (index + 1)}</TableCell>
                          <TableCell>
                            {cat.image_url ? (
                              <img src={cat.image_url} alt={cat.name} className="h-10 w-10 rounded-md object-cover border" />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell className="font-mono text-xs">{cat.slug}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-500 hover:text-amber-700 hover:bg-amber-500/10"
                              onClick={() => handleOpenEditCategory(cat)}
                              title="Edit Category"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                              onClick={() => handleOpenDeleteCategory(cat)}
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!dbCategories || dbCategories.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No categories found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Category Dialog */}
          <Dialog open={editCatOpen} onOpenChange={setEditCatOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Edit Category</DialogTitle>
              </DialogHeader>
              {editingCat && (
                <div className="space-y-4 py-3">
                  <div className="space-y-2">
                    <Label htmlFor="editCatName">Category Name *</Label>
                    <Input
                      id="editCatName"
                      value={editingCat.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingCat((prev: any) =>
                          prev
                            ? {
                                ...prev,
                                name: val,
                                // If slug was previously auto-slugified from name, keep it in sync
                                slug:
                                  prev.slug === slugify(prev.name)
                                    ? slugify(val)
                                    : prev.slug,
                              }
                            : null
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCatSlug">Category Slug (URL-safe) *</Label>
                    <Input
                      id="editCatSlug"
                      value={editingCat.slug}
                      onChange={(e) =>
                        setEditingCat((prev: any) =>
                          prev ? { ...prev, slug: slugify(e.target.value) } : null
                        )
                      }
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Note: Updating the slug will automatically update all existing products in this category.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCatOrder">Display Order</Label>
                    <Input
                      id="editCatOrder"
                      type="number"
                      value={editingCat.display_order}
                      onChange={(e) =>
                        setEditingCat((prev: any) =>
                          prev ? { ...prev, display_order: parseInt(e.target.value) || 1 } : null
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category Thumbnail Image</Label>
                    {editingCat.image_url && (
                      <img
                        src={editingCat.image_url}
                        alt="Preview"
                        className="h-24 w-full rounded-md border object-cover bg-muted"
                      />
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Image URL"
                        value={editingCat.image_url}
                        onChange={(e) =>
                          setEditingCat((prev: any) =>
                            prev ? { ...prev, image_url: e.target.value } : null
                          )
                        }
                        className="flex-1 text-sm"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="*/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingEditCatImg(true);
                            try {
                              const ext = file.name.split(".").pop();
                              const path = `cat_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                              const { error } = await supabase.storage.from("product-images").upload(path, file);
                              if (error) throw error;
                              const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
                              setEditingCat((prev: any) => prev ? { ...prev, image_url: publicUrl } : null);
                              toast({ title: "Category image uploaded" });
                            } catch (err: any) {
                              toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                            } finally {
                              setUploadingEditCatImg(false);
                            }
                          }}
                        />
                        <Button type="button" variant="outline" size="icon" disabled={uploadingEditCatImg} asChild>
                          <span>{uploadingEditCatImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditCatOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  onClick={handleSaveEditedCategory}
                  disabled={savingCat}
                >
                  {savingCat && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Safe Delete Category AlertDialog */}
          <AlertDialog open={deleteCatDialogOpen} onOpenChange={setDeleteCatDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif">
                  Delete Category: {catToDelete?.name}?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 text-sm text-muted-foreground pt-2">
                    <p>
                      Are you sure you want to permanently delete the <strong>{catToDelete?.name}</strong> category?
                    </p>
                    {(() => {
                      const linked = products?.filter((p) => p.category === catToDelete?.slug) || [];
                      if (linked.length > 0) {
                        return (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-900 dark:text-amber-200">
                            <p className="font-semibold flex items-center gap-1">
                              ⚠️ Warning: {linked.length} product{linked.length > 1 ? "s are" : " is"} currently in this category:
                            </p>
                            <p className="text-xs mt-1">
                              {linked.slice(0, 4).map((p) => p.name).join(", ")}
                              {linked.length > 4 ? ` and ${linked.length - 4} more` : ""}
                            </p>
                            <p className="text-xs mt-1 text-muted-foreground">
                              These products will remain in your database, but they may not show under this category in filters unless re-categorized.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ✓ No products are currently assigned to this category. Safe to delete.
                        </p>
                      );
                    })()}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deletingCat}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={handleConfirmDeleteCategory}
                  disabled={deletingCat}
                >
                  {deletingCat ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Add Showcase Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoTitle">Video Title</Label>
                  <Input
                    id="videoTitle"
                    placeholder="e.g. Traditional Shadow Puppetry Process"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (YouTube Embed / MP4)</Label>
                  <Input
                    id="videoUrl"
                    placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Please use embeddable URLs for YouTube videos (e.g. contain `/embed/`).</p>
                </div>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={handleAddVideo} disabled={savingVideo}>
                  {savingVideo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Video
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Current Showcase Videos</CardTitle>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {videos.map((vid) => (
                      <Card key={vid.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          <iframe
                            src={vid.video_url}
                            title={vid.title || "Showcase Video"}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="p-4 flex items-center justify-between gap-2">
                          <span className="font-serif text-sm font-semibold truncate flex-1">{vid.title || "Untitled Video"}</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteVideo(vid.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {videos.length === 0 && (
                      <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                        No showcase videos added yet.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stories">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Add Art Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storyTitle">Story Title</Label>
                  <Input
                    id="storyTitle"
                    placeholder="e.g. Lord Ganesha's Creation"
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storyText">The Story & Significance</Label>
                  <Textarea
                    id="storyText"
                    rows={4}
                    placeholder="Describe the folklore, story depiction, or cultural significance of this art motif..."
                    value={newStoryText}
                    onChange={(e) => setNewStoryText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Story Image</Label>
                  {newStoryImage && (
                    <img src={newStoryImage} alt="Preview" className="h-32 w-full rounded-md border object-cover bg-muted" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={newStoryImage}
                      onChange={(e) => setNewStoryImage(e.target.value)}
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="*/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUploadStoryImg(e.target.files[0])}
                      />
                      <Button type="button" variant="outline" size="icon" disabled={uploadingStoryImg} asChild>
                        <span>{uploadingStoryImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                      </Button>
                    </label>
                  </div>
                </div>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={handleAddStory} disabled={savingStory}>
                  {savingStory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Story
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Current Art Stories</CardTitle>
              </CardHeader>
              <CardContent>
                {storiesLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {stories.map((st) => (
                      <Card key={st.id} className="overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="h-40 bg-muted overflow-hidden">
                            <img src={st.image_url} alt={st.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-serif text-base font-bold mb-2">{st.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-3">{st.story}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteStory(st.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {stories.length === 0 && (
                      <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                        No folklore or art stories added yet.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events_admin">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Add Stall Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evtTitle">Event / Exhibition Title</Label>
                  <Input
                    id="evtTitle"
                    placeholder="e.g. Dastkar Bazaar 2026"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evtDesc">Short Details</Label>
                  <Textarea
                    id="evtDesc"
                    rows={2}
                    placeholder="Describe showcase or timings..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evtLocation">Location / City</Label>
                  <Input
                    id="evtLocation"
                    placeholder="e.g. Gitanjali Exhibition Hall, Bangalore"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="evtStart">Start Date</Label>
                    <Input id="evtStart" type="date" value={newEventStartDate} onChange={(e) => setNewEventStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="evtEnd">End Date</Label>
                    <Input id="evtEnd" type="date" value={newEventEndDate} onChange={(e) => setNewEventEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evtStall">Stall Number (optional)</Label>
                  <Input id="evtStall" placeholder="e.g. Stall #42" value={newEventStallNo} onChange={(e) => setNewEventStallNo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Event Flyer / Banner (optional)</Label>
                  {newEventImage && (
                    <img src={newEventImage} alt="Preview" className="h-24 w-full rounded-md border object-cover bg-muted" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={newEventImage}
                      onChange={(e) => setNewEventImage(e.target.value)}
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="*/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUploadEventImg(e.target.files[0])}
                      />
                      <Button type="button" variant="outline" size="icon" disabled={uploadingEventImg} asChild>
                        <span>{uploadingEventImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                      </Button>
                    </label>
                  </div>
                </div>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={handleAddEvent} disabled={savingEvent}>
                  {savingEvent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Event
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Current Events</CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {eventsList.map((ev) => (
                      <Card key={ev.id} className="overflow-hidden flex flex-col justify-between">
                        <div>
                          {ev.image_url && (
                            <div className="h-32 bg-muted overflow-hidden">
                              <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="font-serif text-base font-bold mb-1">{ev.title}</h4>
                            <p className="text-xs text-amber-600 font-semibold mb-2">{ev.start_date} to {ev.end_date}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">📍 {ev.location} {ev.stall_no && `(Stall: ${ev.stall_no})`}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEvent(ev.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {eventsList.length === 0 && (
                      <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                        No events or exhibitions listed.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements_admin">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Add Achievement / Award</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="achTitle">Award Title</Label>
                  <Input
                    id="achTitle"
                    placeholder="e.g. State Handicraft Award 2025"
                    value={newAchTitle}
                    onChange={(e) => setNewAchTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achDesc">Description & Honor</Label>
                  <Textarea
                    id="achDesc"
                    rows={4}
                    placeholder="Describe who presented the award, when, and significance..."
                    value={newAchDesc}
                    onChange={(e) => setNewAchDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Award Photo / Certificate</Label>
                  {newAchImage && (
                    <img src={newAchImage} alt="Preview" className="h-32 w-full rounded-md border object-cover bg-muted" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={newAchImage}
                      onChange={(e) => setNewAchImage(e.target.value)}
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="*/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUploadAchImg(e.target.files[0])}
                      />
                      <Button type="button" variant="outline" size="icon" disabled={uploadingAchImg} asChild>
                        <span>{uploadingAchImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                      </Button>
                    </label>
                  </div>
                </div>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={handleAddAchievement} disabled={savingAch}>
                  {savingAch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Achievement
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Current Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {achievementsList.map((ach) => (
                      <Card key={ach.id} className="overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="h-40 bg-muted overflow-hidden">
                            <img src={ach.image_url} alt={ach.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-serif text-base font-bold mb-2">{ach.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-3">{ach.description}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAchievement(ach.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {achievementsList.length === 0 && (
                      <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                        No achievements listed yet.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* Workshops Management Control Center */}
        {/* ========================================================================= */}
        <TabsContent value="workshops_admin">
          <div className="space-y-6">
            {/* Sub-Tabs Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="flex flex-wrap gap-1.5 bg-muted/60 p-1 rounded-lg">
                <Button
                  variant={wsSubTab === "workshops" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWsSubTab("workshops")}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Workshops ({adminWorkshops?.length || 0})
                </Button>
                <Button
                  variant={wsSubTab === "registrations" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWsSubTab("registrations")}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Users className="h-3.5 w-3.5" />
                  Bookings / Registrations ({adminRegistrations?.length || 0})
                </Button>
                <Button
                  variant={wsSubTab === "enquiries" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWsSubTab("enquiries")}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Package className="h-3.5 w-3.5" />
                  Group Enquiries ({adminGroupEnquiries?.length || 0})
                </Button>
                <Button
                  variant={wsSubTab === "testimonials" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWsSubTab("testimonials")}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Star className="h-3.5 w-3.5" />
                  Testimonials ({adminTestimonials?.length || 0})
                </Button>
                <Button
                  variant={wsSubTab === "settings" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWsSubTab("settings")}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Award className="h-3.5 w-3.5" />
                  Page Settings
                </Button>
              </div>

              {wsSubTab === "workshops" && (
                <Button onClick={handleOpenNewWorkshop} className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  <Plus className="h-4 w-4" /> Add Workshop
                </Button>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 1: WORKSHOPS CATALOG & CRUD */}
            {/* ------------------------------------------------------------- */}
            {wsSubTab === "workshops" && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">All Workshops & Masterclasses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Title & URL Slug</TableHead>
                          <TableHead>Dates & Timings</TableHead>
                          <TableHead>Venue / Place</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Seats (Booked / Total)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(adminWorkshops || []).map((ws) => {
                          const available = ws.available_seats !== undefined ? ws.available_seats : (ws.total_seats || 20);
                          const booked = ws.booked_seats || 0;

                          return (
                            <TableRow key={ws.id}>
                              <TableCell>
                                <img
                                  src={ws.image_url}
                                  alt={ws.title}
                                  className="h-12 w-16 object-cover rounded-md border bg-muted"
                                />
                              </TableCell>
                              <TableCell className="max-w-[220px]">
                                <p className="font-semibold text-sm line-clamp-1">{ws.title}</p>
                                <p className="text-[11px] font-mono text-muted-foreground line-clamp-1">/workshop/{ws.slug}</p>
                              </TableCell>
                              <TableCell className="text-xs">
                                <p className="font-medium">{ws.date}</p>
                                <p className="text-muted-foreground">{ws.time}</p>
                              </TableCell>
                              <TableCell className="text-xs max-w-[150px] truncate" title={ws.location}>
                                {ws.location}
                              </TableCell>
                              <TableCell className="font-serif font-bold text-amber-600 dark:text-amber-400">
                                ₹{ws.price}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-xs">
                                  <Badge
                                    variant="outline"
                                    className={available <= 0 ? "text-red-500 border-red-500/30" : "text-green-600 border-green-500/30"}
                                  >
                                    {booked} booked / {available} left
                                  </Badge>
                                  <p className="text-[10px] text-muted-foreground">Total: {ws.total_seats}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={ws.status}
                                  onValueChange={(val: any) => handleToggleWorkshopStatus(ws, val)}
                                >
                                  <SelectTrigger className="h-8 text-xs w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="ongoing">Ongoing (Live)</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="full">Full</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-500 hover:text-amber-700 hover:bg-amber-500/10"
                                  onClick={() => handleOpenEditWorkshop(ws)}
                                  title="Edit Workshop"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteWorkshopData(ws.id)}
                                  title="Delete Workshop"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {(!adminWorkshops || adminWorkshops.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                              No workshops published yet. Click "Add Workshop" to create one.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 2: WORKSHOP REGISTRATIONS (BOOKINGS) */}
            {/* ------------------------------------------------------------- */}
            {wsSubTab === "registrations" && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Participant Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Participant</TableHead>
                          <TableHead>Contact (WhatsApp / Email)</TableHead>
                          <TableHead>Workshop Title</TableHead>
                          <TableHead>Seats</TableHead>
                          <TableHead>Date Booked</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(adminRegistrations || []).map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell className="font-mono text-xs font-bold text-amber-600">
                              {reg.id}
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold text-sm">{reg.full_name}</p>
                              {reg.message && (
                                <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                                  "{reg.message}"
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-xs space-y-0.5">
                              <p className="font-medium text-foreground">{reg.phone}</p>
                              <p className="text-muted-foreground">{reg.email}</p>
                            </TableCell>
                            <TableCell className="text-xs max-w-[180px] font-medium truncate" title={reg.workshop_title}>
                              {reg.workshop_title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-bold">
                                {reg.seats_booked} seat(s)
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(reg.created_at).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={reg.status}
                                onValueChange={(val: any) => handleUpdateRegStatus(reg.id, val)}
                              >
                                <SelectTrigger className={`h-8 text-xs w-28 font-semibold ${
                                  reg.status === "Confirmed"
                                    ? "text-green-600 border-green-500/40"
                                    : reg.status === "Cancelled"
                                    ? "text-red-500 border-red-500/40"
                                    : "text-amber-600"
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:bg-green-500/10"
                                asChild
                                title="Chat on WhatsApp"
                              >
                                <a
                                  href={`https://wa.me/${reg.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                    `Hello ${reg.full_name}, confirming your booking (${reg.id}) for "${reg.workshop_title}" with Sindhe Vijay Leather Puppets!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MessageCircle className="h-4 w-4 fill-current" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteReg(reg.id)}
                                title="Delete Registration"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!adminRegistrations || adminRegistrations.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                              No participant registrations yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 3: GROUP WORKSHOP ENQUIRIES */}
            {/* ------------------------------------------------------------- */}
            {wsSubTab === "enquiries" && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl">School, College & Corporate Enquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ref ID</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Phone & Email</TableHead>
                          <TableHead>Attendees</TableHead>
                          <TableHead>Proposed Date & Venue</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(adminGroupEnquiries || []).map((enq) => (
                          <TableRow key={enq.id}>
                            <TableCell className="font-mono text-xs font-bold text-amber-600">
                              {enq.id}
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {enq.org_name}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {enq.contact_person}
                            </TableCell>
                            <TableCell className="text-xs space-y-0.5">
                              <p className="font-medium text-foreground">{enq.phone}</p>
                              <p className="text-muted-foreground">{enq.email}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{enq.participants_count} people</Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <p className="font-medium">{enq.preferred_date}</p>
                              <p className="text-muted-foreground">{enq.location}</p>
                            </TableCell>
                            <TableCell className="text-xs max-w-[200px] text-muted-foreground line-clamp-2" title={enq.message}>
                              {enq.message || "—"}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={enq.status}
                                onValueChange={(val: any) => handleUpdateGroupEnquiryStatus(enq.id, val)}
                              >
                                <SelectTrigger className="h-8 text-xs w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Contacted">Contacted</SelectItem>
                                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:bg-green-500/10"
                                asChild
                                title="Chat on WhatsApp"
                              >
                                <a
                                  href={`https://wa.me/${enq.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                    `Hello ${enq.contact_person}, regarding your group workshop request for ${enq.org_name} from Sindhe Vijay Leather Puppets!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MessageCircle className="h-4 w-4 fill-current" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteGroupEnquiry(enq.id)}
                                title="Delete Enquiry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!adminGroupEnquiries || adminGroupEnquiries.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                              No group or institutional workshop enquiries received yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 4: WORKSHOP TESTIMONIALS */}
            {/* ------------------------------------------------------------- */}
            {wsSubTab === "testimonials" && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Add Participant Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="testName">Participant Name *</Label>
                      <Input
                        id="testName"
                        placeholder="e.g. Priya Sharma"
                        value={newTestName}
                        onChange={(e) => setNewTestName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="testRole">Role / Institution</Label>
                      <Input
                        id="testRole"
                        placeholder="e.g. Design Student, Bengaluru"
                        value={newTestRole}
                        onChange={(e) => setNewTestRole(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="testRating">Star Rating (1-5)</Label>
                      <Input
                        id="testRating"
                        type="number"
                        min="1"
                        max="5"
                        value={newTestRating}
                        onChange={(e) => setNewTestRating(Number(e.target.value) || 5)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="testReview">Review Text *</Label>
                      <Textarea
                        id="testReview"
                        rows={3}
                        placeholder="Write testimonial..."
                        value={newTestReview}
                        onChange={(e) => setNewTestReview(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      onClick={handleAddTestimonialData}
                    >
                      Add Testimonial
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Current Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(adminTestimonials || []).map((test) => (
                        <Card key={test.id} className="p-4 flex flex-col justify-between border space-y-3">
                          <div>
                            <div className="flex items-center gap-1 text-amber-500 mb-2">
                              {Array.from({ length: test.rating || 5 }).map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground italic">"{test.review}"</p>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2 text-xs">
                            <div>
                              <p className="font-bold text-foreground">{test.name}</p>
                              <p className="text-muted-foreground">{test.role}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => handleDeleteTestimonialData(test.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 5: WORKSHOP PAGE SETTINGS */}
            {/* ------------------------------------------------------------- */}
            {wsSubTab === "settings" && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Workshops Page Content & Instructor Bio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="setHeroTitle">Hero Title</Label>
                    <Input
                      id="setHeroTitle"
                      defaultValue={adminSettings?.hero_title}
                      onChange={(e) => setSettingHeroTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="setHeroSub">Hero Subtitle</Label>
                    <Textarea
                      id="setHeroSub"
                      rows={2}
                      defaultValue={adminSettings?.hero_subtitle}
                      onChange={(e) => setSettingHeroSubtitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="setInstName">Instructor Name</Label>
                      <Input
                        id="setInstName"
                        defaultValue={adminSettings?.instructor_name}
                        onChange={(e) => setSettingInstructorName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="setInstExp">Experience & Credential</Label>
                      <Input
                        id="setInstExp"
                        defaultValue={adminSettings?.instructor_experience}
                        onChange={(e) => setSettingInstructorExp(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="setInstBio">Instructor Biography</Label>
                    <Textarea
                      id="setInstBio"
                      rows={4}
                      defaultValue={adminSettings?.instructor_bio}
                      onChange={(e) => setSettingInstructorBio(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                    onClick={handleSaveWorkshopSettings}
                  >
                    Save Page Settings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ============================================================= */}
          {/* Add / Edit Workshop Dialog Modal */}
          {/* ============================================================= */}
          <Dialog open={editWsOpen} onOpenChange={setEditWsOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-bold">
                  {editingWs?.id ? "Edit Workshop / Masterclass" : "New Workshop / Masterclass"}
                </DialogTitle>
              </DialogHeader>
              {editingWs && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsTitle">Workshop Title *</Label>
                      <Input
                        id="edWsTitle"
                        value={editingWs.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingWs((p: any) => ({
                            ...p,
                            title: val,
                            slug: p.slug || slugify(val),
                          }));
                        }}
                        placeholder="e.g. Masterclass in Traditional Leather Shadow Puppetry"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsSlug">URL Slug (Identifier) *</Label>
                      <Input
                        id="edWsSlug"
                        value={editingWs.slug || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, slug: slugify(e.target.value) }))}
                        placeholder="traditional-leather-shadow-puppetry"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edWsShortDesc">Short Summary (shown on cards)</Label>
                    <Textarea
                      id="edWsShortDesc"
                      rows={2}
                      value={editingWs.short_description || ""}
                      onChange={(e) => setEditingWs((p: any) => ({ ...p, short_description: e.target.value }))}
                      placeholder="Brief overview of the masterclass..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edWsFullDesc">Full Workshop Description & Story</Label>
                    <Textarea
                      id="edWsFullDesc"
                      rows={4}
                      value={editingWs.full_description || ""}
                      onChange={(e) => setEditingWs((p: any) => ({ ...p, full_description: e.target.value }))}
                      placeholder="Detailed breakdown of the workshop experience..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsDate">Start Date *</Label>
                      <Input
                        id="edWsDate"
                        type="date"
                        value={editingWs.date || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsEndDate">End Date (optional)</Label>
                      <Input
                        id="edWsEndDate"
                        type="date"
                        value={editingWs.end_date || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, end_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsStatus">Status</Label>
                      <Select
                        value={editingWs.status || "upcoming"}
                        onValueChange={(val: any) => setEditingWs((p: any) => ({ ...p, status: val }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="ongoing">Ongoing (Live)</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="full">Full (Sold Out)</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsTime">Time (e.g. 10:30 AM – 2:30 PM)</Label>
                      <Input
                        id="edWsTime"
                        value={editingWs.time || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsDuration">Duration</Label>
                      <Input
                        id="edWsDuration"
                        placeholder="e.g. 4 Hours"
                        value={editingWs.duration || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, duration: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsPrice">Fee (₹ per person) *</Label>
                      <Input
                        id="edWsPrice"
                        type="number"
                        value={editingWs.price || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, price: Number(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsSeats">Total Seats Available *</Label>
                      <Input
                        id="edWsSeats"
                        type="number"
                        value={editingWs.total_seats || 25}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, total_seats: Number(e.target.value) || 10 }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edWsLoc">Place / Venue / City *</Label>
                      <Input
                        id="edWsLoc"
                        value={editingWs.location || ""}
                        onChange={(e) => setEditingWs((p: any) => ({ ...p, location: e.target.value }))}
                        placeholder="e.g. Chitrakala Parishath, Bangalore"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edWsVideo">Video URL (YouTube Embed / MP4)</Label>
                    <Input
                      id="edWsVideo"
                      placeholder="https://www.youtube.com/embed/..."
                      value={editingWs.video_url || ""}
                      onChange={(e) => setEditingWs((p: any) => ({ ...p, video_url: e.target.value }))}
                    />
                  </div>

                  {/* Multi-Image Upload & Featured Image Selector */}
                  <div className="pt-2 border-t">
                    <Label className="text-base font-semibold mb-2 block">
                      Workshop Gallery Images (Featured Image first)
                    </Label>
                    <ImageUploadManager
                      images={editingWorkshopImages}
                      onChange={setEditingWorkshopImages}
                      featuredImage={editingWorkshopFeatured}
                      onFeaturedChange={setEditingWorkshopFeatured}
                    />
                  </div>
                </div>
              )}
              <DialogFooter className="pt-3">
                <Button variant="outline" onClick={() => setEditWsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  onClick={handleSaveWorkshopData}
                  disabled={savingEditWs}
                >
                  {savingEditWs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Workshop
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
