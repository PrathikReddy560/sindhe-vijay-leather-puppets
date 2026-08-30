import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  MessageCircle,
  Phone,
  Sparkles,
  Award,
  CheckCircle2,
  Loader2,
  Play,
  Star,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  School,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkshops, useWorkshopTestimonials, useWorkshopSettings, WorkshopItem } from "@/hooks/useWorkshops";
import { WorkshopRegistrationModal } from "@/components/workshops/WorkshopRegistrationModal";
import { GroupWorkshopForm } from "@/components/workshops/GroupWorkshopForm";

const formatDate = (dateStr: string, endDateStr?: string) => {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const start = new Date(dateStr).toLocaleDateString("en-IN", options);
  if (!endDateStr || endDateStr === dateStr) return start;
  const end = new Date(endDateStr).toLocaleDateString("en-IN", options);
  return `${start} – ${end}`;
};

const Workshops = () => {
  const { data: workshops, isLoading } = useWorkshops();
  const { data: testimonials } = useWorkshopTestimonials();
  const { data: settings } = useWorkshopSettings();

  const [filter, setFilter] = useState<"all" | "ongoing" | "upcoming">("all");
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const workshopsSectionRef = useRef<HTMLDivElement>(null);
  const groupSectionRef = useRef<HTMLDivElement>(null);

  const ongoing = workshops?.filter((w) => w.status === "ongoing") || [];
  const upcoming = workshops?.filter((w) => w.status === "upcoming" || w.status === "active") || [];
  const displayed =
    filter === "ongoing"
      ? ongoing
      : filter === "upcoming"
      ? upcoming
      : workshops || [];

  const handleOpenBooking = (ws: WorkshopItem) => {
    setSelectedWorkshop(ws);
    setModalOpen(true);
  };

  const activeTestimonials = (testimonials || []).filter((t) => t.is_active);

  return (
    <div className="py-10 md:py-16 bg-background space-y-20 md:space-y-28">
      {/* ========================================================================= */}
      {/* A. Hero Section */}
      {/* ========================================================================= */}
      <section className="container text-center max-w-4xl mx-auto space-y-6">
        <Badge className="mb-2 uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-1">
          Masterclasses & Hands-On Heritage Workshops
        </Badge>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
          {settings?.hero_title || "Hands-On Leather Puppet Workshops & Masterclasses"}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {settings?.hero_subtitle ||
            "Experience the sacred 8th-generation folk heritage of Thogalu Gombe. Learn parchment preparation, fine chisel punching, and screen manipulation directly from master artisan Sindhe Vijay."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={() => workshopsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            Explore Workshop Schedule <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => groupSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="gap-2"
          >
            <School className="h-4 w-4" /> Request Institutional Workshop
          </Button>
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 text-xs text-muted-foreground max-w-3xl mx-auto">
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/60">
            <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>Raw Hide Provided</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/60">
            <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>Official Certificate</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/60">
            <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>Take Home Artwork</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/60">
            <ShieldCheck className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>Master Artisan Led</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Live / Ongoing Workshop Spotlight */}
      {/* ========================================================================= */}
      {ongoing.length > 0 && (
        <section className="container">
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-background p-6 md:p-10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                Live Now / Active Workshop Session
              </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground">
                  {ongoing[0].title}
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {ongoing[0].short_description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span>{formatDate(ongoing[0].date, ongoing[0].end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{ongoing[0].time} ({ongoing[0].duration})</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="line-clamp-1">{ongoing[0].location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Button
                    size="lg"
                    disabled={ongoing[0].status === "full"}
                    onClick={() => handleOpenBooking(ongoing[0])}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md"
                  >
                    {ongoing[0].status === "full" ? "Workshop Full" : `Book Seat (₹${ongoing[0].price})`}
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to={`/workshop/${ongoing[0].slug}`}>
                      View Details <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-lg bg-muted relative group">
                  <img
                    src={ongoing[0].image_url}
                    alt={ongoing[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {ongoing[0].available_seats || 0} seats left
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* Upcoming & All Workshops Section */}
      {/* ========================================================================= */}
      <section ref={workshopsSectionRef} className="container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Workshops & Masterclasses Schedule
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a session to view the complete curriculum or reserve your seat
            </p>
          </div>

          <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All ({workshops?.length || 0})</TabsTrigger>
              <TabsTrigger value="ongoing">Live / Ongoing ({ongoing.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed bg-muted/20">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-lg font-medium text-foreground">No workshops in this category</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact us to organize a custom workshop at your campus or cultural festival.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayed.map((ws, index) => {
              const available = ws.available_seats !== undefined ? ws.available_seats : (ws.total_seats || 20);
              const isFull = available <= 0 || ws.status === "full";

              return (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all border-border/80 group">
                    {/* Thumbnail Image */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={ws.image_url}
                        alt={ws.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      <Badge
                        className={`absolute top-3 left-3 font-semibold shadow-md ${
                          isFull
                            ? "bg-red-600 text-white"
                            : ws.status === "ongoing"
                            ? "bg-green-600 text-white"
                            : "bg-amber-500 text-black"
                        }`}
                      >
                        {isFull ? "Workshop Full" : ws.status === "ongoing" ? "● Live Now" : "Upcoming"}
                      </Badge>

                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        {isFull ? "0 seats remaining" : `${available} seats left`}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-serif text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {ws.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {ws.short_description}
                        </p>
                      </div>

                      {/* Details List */}
                      <div className="space-y-2 pt-3 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-medium text-foreground">{formatDate(ws.date, ws.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span>{ws.time} ({ws.duration})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="line-clamp-1">{ws.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 font-semibold text-sm">
                          <span className="text-foreground">Workshop Fee:</span>
                          <span className="text-amber-600 dark:text-amber-400 font-serif text-base">₹{ws.price}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/workshop/${ws.slug}`}>View Details</Link>
                        </Button>
                        <Button
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleOpenBooking(ws)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                        >
                          {isFull ? "Full" : "Book Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* What You Will Learn Section */}
      {/* ========================================================================= */}
      <section className="container space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-2 border-amber-500/40 text-amber-600 dark:text-amber-400">
            <BookOpen className="mr-1.5 h-3.5 w-3.5" /> 8-Stage Heritage Curriculum
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            What You Will Learn in Our Masterclass
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every participant is guided step-by-step through the traditional 500-year-old process of creating an illuminated puppet.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(settings?.default_learn_points || [
            "1. Introduction to Shadow Puppetry & Oral Heritage",
            "2. History & Mythology of Thogalu Gombe",
            "3. Goat Leather Parchment Preparation",
            "4. Drawing Sacred & Epic Designs on Parchment",
            "5. Traditional Iron Chisel Punching Techniques",
            "6. Painting with Natural Drawing Inks",
            "7. Limb Articulation & Stick Joint Assembly",
            "8. Shadow Puppet Screen Manipulation & Performance"
          ]).map((point, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border bg-card/60 shadow-sm hover:shadow-md transition-shadow space-y-2"
            >
              <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-serif font-bold text-sm flex items-center justify-center">
                {index + 1}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {point.replace(/^\d+\.\s*/, "")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Meet the Master Artist / Instructor */}
      {/* ========================================================================= */}
      <section className="container">
        <div className="rounded-2xl border bg-gradient-to-r from-amber-500/10 via-card to-background p-6 md:p-12 shadow-sm">
          <div className="grid gap-8 md:grid-cols-12 items-center">
            <div className="md:col-span-4 text-center">
              <div className="relative h-44 w-44 mx-auto rounded-full overflow-hidden border-4 border-amber-500/80 shadow-xl bg-muted">
                <img
                  src={settings?.instructor_image || "/images/heritage/vijay-artisan.jpg"}
                  alt={settings?.instructor_name || "Sindhe Vijay"}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mt-4">
                {settings?.instructor_name || "Sindhe Vijay"}
              </h3>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {settings?.instructor_experience || "8th Generation Master Craftsman · 25+ Years Experience"}
              </p>
            </div>

            <div className="md:col-span-8 space-y-4">
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-none">
                Instructor & Troupe Leader
              </Badge>
              <h4 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Preserving India's Rare Illuminated Puppet Craft
              </h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {settings?.instructor_bio ||
                  "Sindhe Vijay was born into an ancient family of shadow puppeteers in Jeekavandlapalli, Karnataka. Dedicated to keeping this living heritage alive, he has conducted acclaimed workshops across India's premier design institutes, universities, cultural festivals, and national museums."}
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-500" /> State Award Winner</span>
                <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-amber-500" /> 100+ Masterclasses Conducted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* What Is Included Checklist */}
      {/* ========================================================================= */}
      <section className="container space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            What Is Included in Every Workshop
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            We provide all necessary tools, parchment, natural inks, and instruction.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto">
          {(settings?.default_inclusions || [
            "100% Authentic Cured Goat Hide Parchment",
            "Full Set of Traditional Tools & Chisels (workshop use)",
            "Natural Drawing Inks, Brushes & Fasteners",
            "Personal Guidance by Master Artisan Sindhe Vijay",
            "Official Certificate of Participation",
            "Take Home Your Complete Handmade Artwork"
          ]).map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border bg-muted/20">
              <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-foreground font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Testimonials */}
      {/* ========================================================================= */}
      {activeTestimonials.length > 0 && (
        <section className="container space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <Badge variant="outline" className="mb-2 border-amber-500/40 text-amber-600 dark:text-amber-400">
              Participant Reviews
            </Badge>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              What Workshop Participants Say
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {activeTestimonials.map((t) => (
              <Card key={t.id} className="p-6 border bg-card/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{t.review}"
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="font-serif font-bold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* Group & Institutional Workshop Form */}
      {/* ========================================================================= */}
      <section ref={groupSectionRef} className="container max-w-4xl mx-auto">
        <GroupWorkshopForm />
      </section>

      {/* Booking Modal */}
      <WorkshopRegistrationModal
        workshop={selectedWorkshop}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Workshops;
