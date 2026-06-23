import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Upload, Shield, Loader2, Package, MessageCircle, Mail, Image, Video, BookOpen, Calendar, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
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

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const getCategoryLabel = (slug: string) => {
    const found = dbCategories?.find((c: any) => c.slug === slug);
    return found ? found.name : slug;
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      toast({ title: "Error", description: "Name and Slug are required", variant: "destructive" });
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
          name: newCategoryName.trim(),
          slug: newCategorySlug.trim().toLowerCase(),
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Products in this category will not be deleted, but they may not show up correctly if their category doesn't exist.")) return;
    
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Category deleted" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast({ title: "Error deleting category", description: err.message, variant: "destructive" });
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

  // Category image state
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [uploadingCategoryImg, setUploadingCategoryImg] = useState(false);

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
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
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

  const uploadImage = async (file: File, type: "day" | "night") => {
    const setter = type === "day" ? setUploadingDay : setUploadingNight;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditingProduct((prev) => ({
        ...prev,
        [type === "day" ? "image_day" : "image_night"]: publicUrl,
      }));
      toast({ title: `${type === "day" ? "Day" : "Night"} image uploaded` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    if (!editingProduct.name || !editingProduct.slug || !editingProduct.image_day) {
      toast({ title: "Missing fields", description: "Name, slug, and day image are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: editingProduct.slug,
        name: editingProduct.name,
        description: editingProduct.description,
        long_description: editingProduct.long_description,
        price: editingProduct.price,
        discount_price: editingProduct.discount_price ? editingProduct.discount_price : null,
        category: editingProduct.category,
        inventory_tag: editingProduct.inventory_tag,
        image_day: editingProduct.image_day,
        image_night: editingProduct.image_night || null,
        dimensions: editingProduct.dimensions || null,
        material: editingProduct.material,
        featured: editingProduct.featured,
      };

      if (editingProduct.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Product updated" });
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast({ title: "Product created" });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setEditingProduct(emptyProduct);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
    setEditingProduct({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      long_description: p.long_description,
      price: p.price,
      discount_price: p.discount_price || 0,
      category: p.category as typeof emptyProduct.category,
      inventory_tag: p.inventory_tag as typeof emptyProduct.inventory_tag,
      image_day: p.image_day,
      image_night: p.image_night || "",
      dimensions: p.dimensions || "",
      material: p.material,
      featured: p.featured,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingProduct(emptyProduct);
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
                      <Input id="name" value={editingProduct.name} onChange={(e) => setEditingProduct((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input id="slug" value={editingProduct.slug} onChange={(e) => setEditingProduct((p) => ({ ...p, slug: e.target.value }))} placeholder="unique-product-id" />
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
                      <Input id="price" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
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

                  {/* Image uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Day Image *</Label>
                      {editingProduct.image_day && (
                        <img src={editingProduct.image_day} alt="Day" className="h-32 w-full rounded-md border object-contain bg-muted" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Image URL"
                          value={editingProduct.image_day}
                          onChange={(e) => setEditingProduct((p) => ({ ...p, image_day: e.target.value }))}
                          className="flex-1"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "day")}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploadingDay} asChild>
                            <span>{uploadingDay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Night Image</Label>
                      {editingProduct.image_night && (
                        <img src={editingProduct.image_night} alt="Night" className="h-32 w-full rounded-md border object-contain bg-foreground" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Image URL (optional)"
                          value={editingProduct.image_night}
                          onChange={(e) => setEditingProduct((p) => ({ ...p, image_night: e.target.value }))}
                          className="flex-1"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "night")}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploadingNight} asChild>
                            <span>{uploadingNight ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editingProduct.featured}
                      onCheckedChange={(v) => setEditingProduct((p) => ({ ...p, featured: v }))}
                    />
                    <Label>Featured Product</Label>
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
                          accept="image/*"
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
                        accept="image/*"
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
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-500/10" onClick={() => handleDeleteCategory(cat.id)}>
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
                        accept="image/*"
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
                        accept="image/*"
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
                        accept="image/*"
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
      </Tabs>
    </div>
  );
};

export default Admin;
