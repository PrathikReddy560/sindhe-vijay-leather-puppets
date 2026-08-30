import { useState } from "react";
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
  ExternalLink,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkshops, WorkshopItem } from "@/hooks/useWorkshops";
import { useShowcaseVideos } from "@/hooks/useShowcaseVideos";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatDate = (dateStr: string, endDateStr?: string) => {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const start = new Date(dateStr).toLocaleDateString("en-IN", options);
  if (!endDateStr || endDateStr === dateStr) return start;
  const end = new Date(endDateStr).toLocaleDateString("en-IN", options);
  return `${start} – ${end}`;
};

const getWhatsAppWorkshopUrl = (workshop: WorkshopItem) => {
  const message = encodeURIComponent(
    `Hello Sindhe Vijay Leather Puppets, I would like to inquire / register for the workshop: "${workshop.title}" scheduled at ${workshop.location} (${workshop.timings}).`
  );
  return `https://wa.me/919480326868?text=${message}`;
};

const Workshops = () => {
  const { data: workshops, isLoading } = useWorkshops();
  const { data: showcaseVideos } = useShowcaseVideos();
  const [filter, setFilter] = useState<"all" | "ongoing" | "upcoming">("all");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const ongoing = workshops?.filter((w) => w.status === "ongoing") || [];
  const upcoming = workshops?.filter((w) => w.status === "upcoming") || [];
  const displayed =
    filter === "ongoing"
      ? ongoing
      : filter === "upcoming"
      ? upcoming
      : workshops || [];

  return (
    <div className="py-12 md:py-20 min-h-screen bg-background">
      <div className="container space-y-16 md:space-y-24">
        {/* ========================================================================= */}
        {/* Header Hero Section */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-3 uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            Masterclasses & Cultural Workshops
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground md:text-6xl tracking-tight leading-tight">
            Learn the Sacred Art of Leather Puppetry
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            Immerse yourself in India's ancient 8th-generation <em>Thogalu Gombe</em> tradition. Join our master artisans in hands-on workshops where goat hide is sculpted, chiseled, colored with vibrant drawing inks, and brought to life behind illuminated shadow screens.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>All Raw Materials & Tools Provided</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Certificate of Participation</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Take Home Your Handmade Puppet</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Current / Ongoing Live Workshop Highlight Banner */}
        {/* ========================================================================= */}
        {ongoing.length > 0 && (
          <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background p-6 md:p-10 shadow-lg relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
            
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                Live / Ongoing Workshop Series
              </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground">
                  {ongoing[0].title}
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {ongoing[0].description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
                  <div className="flex items-center gap-2.5 bg-background/80 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dates</p>
                      <p className="font-medium">{formatDate(ongoing[0].date, ongoing[0].end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-background/80 p-3 rounded-lg border">
                    <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Timings</p>
                      <p className="font-medium">{ongoing[0].timings}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-background/80 p-3 rounded-lg border sm:col-span-2">
                    <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Venue / Place</p>
                      <p className="font-medium">{ongoing[0].location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-md hover:shadow-amber-500/20"
                    asChild
                  >
                    <a
                      href={getWhatsAppWorkshopUrl(ongoing[0])}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-5 w-5 fill-current" /> Register via WhatsApp
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    asChild
                  >
                    <a href="tel:+919480326868">
                      <Phone className="h-4 w-4" /> Call for Inquiries
                    </a>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                {ongoing[0].image_url ? (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border shadow-xl bg-muted group">
                    <img
                      src={ongoing[0].image_url}
                      alt={ongoing[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {ongoing[0].video_url && (
                      <button
                        onClick={() => setActiveVideoUrl(ongoing[0].video_url)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors"
                      >
                        <div className="h-16 w-16 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 fill-current ml-1" />
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-xl border bg-muted/40 flex items-center justify-center text-muted-foreground">
                    Workshop in session
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* All Workshops Grid & Filter */}
        {/* ========================================================================= */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">
                Workshops & Masterclass Schedule
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore upcoming and live puppet-making sessions across India
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
                Reach out to us to organize a custom workshop at your school, college, or community center.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayed.map((ws, index) => {
                const isWsOngoing = ws.status === "ongoing";

                return (
                  <motion.div
                    key={ws.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all border-border/80 group">
                      {/* Image Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {ws.image_url ? (
                          <img
                            src={ws.image_url}
                            alt={ws.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            Leather Puppetry Masterclass
                          </div>
                        )}

                        <Badge
                          className={`absolute top-3 left-3 font-semibold shadow-md ${
                            isWsOngoing
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-amber-500 text-black hover:bg-amber-600"
                          }`}
                        >
                          {isWsOngoing ? "● Live / Ongoing" : "Upcoming Session"}
                        </Badge>

                        {ws.video_url && (
                          <button
                            onClick={() => setActiveVideoUrl(ws.video_url)}
                            className="absolute bottom-3 right-3 h-8 px-2.5 rounded-full bg-black/70 text-white backdrop-blur text-xs flex items-center gap-1.5 hover:bg-black/90 transition-colors shadow-md"
                          >
                            <Play className="h-3.5 w-3.5 fill-current text-amber-400" /> Watch Video
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {ws.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {ws.description}
                          </p>
                        </div>

                        {/* Details List */}
                        <div className="space-y-2 pt-3 border-t text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="font-medium text-foreground">{formatDate(ws.date, ws.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span>{ws.timings}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="line-clamp-1">{ws.location}</span>
                          </div>
                        </div>

                        {/* Booking CTA Button */}
                        <div className="pt-2">
                          <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-sm"
                            asChild
                          >
                            <a
                              href={getWhatsAppWorkshopUrl(ws)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-4 w-4 fill-current" /> Register / Inquire
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Workshop Videos Demonstration Showcase */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border bg-muted/20 p-8 md:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-2 border-amber-500/40 text-amber-600 dark:text-amber-400">
              <Video className="mr-1.5 h-3.5 w-3.5" /> Behind The Craft
            </Badge>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Watch Our Live Workshop Demonstrations
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              See the meticulous technique of tracing on parchment, cutting jointed limbs, and staging an authentic Ramayana shadow puppet performance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Leather Parchment Preparation & Drawing",
                url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                desc: "How raw goat hide is cured into translucent parchment for shadow puppetry.",
              },
              {
                title: "Chisel Punching & Multi-Hole Perforations",
                url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                desc: "Mastering the traditional iron punches that create radiant pin-hole light patterns.",
              },
              {
                title: "Shadow Screen Manipulation & Puppet Play",
                url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                desc: "The rhythm of live storytelling and puppet movement behind the screen.",
              },
            ].map((vid, i) => (
              <Card key={i} className="overflow-hidden border bg-card hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-black relative">
                  <iframe
                    src={vid.url}
                    title={vid.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-serif font-bold text-base line-clamp-1">{vid.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{vid.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Custom Workshop / Institutional Booking Card */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border bg-gradient-to-r from-amber-500/15 via-card to-amber-500/10 p-8 md:p-12 shadow-sm text-center max-w-4xl mx-auto space-y-6">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Host a Workshop at Your School, College, or Cultural Festival
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              We travel across India and internationally to conduct 1-day, 3-day, and week-long intensive leather shadow puppetry residencies. We bring all authentic raw materials, tools, and illuminated screen sets.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-md"
              asChild
            >
              <a
                href="https://wa.me/919480326868?text=Hello%20Sindhe%20Vijay,%20I%20would%20like%20to%20invite%20you%20to%20conduct%20a%20Leather%20Puppetry%20Workshop%20at%20our%20institution."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 fill-current" /> Book Institutional Workshop
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              asChild
            >
              <a href="mailto:sindhevijayleatherpuppets@gmail.com">
                <ExternalLink className="h-4 w-4" /> Email Proposal
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Video Modal Dialog */}
      <Dialog open={!!activeVideoUrl} onOpenChange={(open) => !open && setActiveVideoUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none aspect-video">
          <DialogTitle className="sr-only">Workshop Video Preview</DialogTitle>
          {activeVideoUrl && (
            <iframe
              src={activeVideoUrl}
              title="Workshop Demonstration"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workshops;
