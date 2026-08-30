import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Play,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWorkshop, useWorkshops } from "@/hooks/useWorkshops";
import { ProductGallery } from "@/components/ProductGallery";
import { WorkshopRegistrationModal } from "@/components/workshops/WorkshopRegistrationModal";

const WorkshopDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: workshop, isLoading } = useWorkshop(slug || "");
  const { data: allWorkshops } = useWorkshops();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading workshop details...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center py-16">
        <h1 className="font-serif text-3xl font-bold text-foreground">Workshop Not Found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn't find the workshop you're looking for. It may have been completed or moved to a new schedule.
        </p>
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-semibold mt-2">
          <Link to="/workshops">Browse All Workshops</Link>
        </Button>
      </div>
    );
  }

  const availableSeats = workshop.available_seats !== undefined ? workshop.available_seats : (workshop.total_seats || 20);
  const isFull = availableSeats <= 0;
  const images = workshop.images && workshop.images.length > 0 ? workshop.images : [workshop.image_url];

  const related = (allWorkshops || [])
    .filter((w) => w.id !== workshop.id && w.slug !== workshop.slug)
    .slice(0, 3);

  return (
    <div className="py-8 md:py-16 bg-background">
      <div className="container space-y-12">
        {/* Back Link */}
        <Link
          to="/workshops"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Workshops
        </Link>

        {/* Top Grid: Gallery & Quick Booking Box */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Left 7 Cols: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <ProductGallery
              images={images}
              productName={workshop.title}
            />

            {/* Video Preview if Available */}
            {workshop.video_url && (
              <div className="rounded-xl overflow-hidden border bg-black aspect-video mt-6 shadow-md">
                <iframe
                  src={workshop.video_url}
                  title={workshop.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Right 5 Cols: Key Info & Booking Action */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={`font-semibold ${
                    isFull
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : workshop.status === "ongoing"
                      ? "bg-green-600 text-white"
                      : "bg-amber-500 text-black"
                  }`}
                >
                  {isFull
                    ? "Workshop Full"
                    : workshop.status === "ongoing"
                    ? "● Live / In Session"
                    : "Upcoming Session"}
                </Badge>
                {workshop.featured && (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
                    ★ Masterclass
                  </Badge>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {workshop.title}
              </h1>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-bold font-serif text-amber-600 dark:text-amber-400">
                  ₹{workshop.price}
                </span>
                <span className="text-xs text-muted-foreground">/ person (all materials included)</span>
              </div>
            </div>

            {/* Essential Logistics Card */}
            <div className="p-4 rounded-xl bg-muted/40 border space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {workshop.date} {workshop.end_date && workshop.end_date !== workshop.date ? `– ${workshop.end_date}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Time & Duration</p>
                  <p className="font-medium text-foreground">
                    {workshop.time} ({workshop.duration})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Venue / Location</p>
                  <p className="font-medium text-foreground">{workshop.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t pt-2.5">
                <Users className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-xs text-muted-foreground">Seat Availability</p>
                    <p className="font-semibold text-foreground">
                      {isFull ? (
                        <span className="text-red-500">0 Seats Available (Full)</span>
                      ) : (
                        <span className={availableSeats <= 4 ? "text-red-500" : "text-green-600 dark:text-green-400"}>
                          {availableSeats} of {workshop.total_seats} seats remaining
                        </span>
                      )}
                    </p>
                  </div>
                  {workshop.age_group && (
                    <Badge variant="secondary" className="text-[11px]">
                      {workshop.age_group}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <Button
                size="lg"
                disabled={isFull}
                onClick={() => setModalOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base py-6 shadow-lg hover:shadow-amber-500/25 transition-all"
              >
                {isFull ? "Workshop is Full" : `Register Now (₹${workshop.price})`}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 text-sm"
                asChild
              >
                <a
                  href={`https://wa.me/919480326868?text=Hello%20Sindhe%20Vijay,%20I%20have%20a%20question%20about%20the%20workshop:%20${encodeURIComponent(workshop.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366] fill-current" /> Inquire on WhatsApp
                </a>
              </Button>
            </div>

            {/* Authenticity Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-card text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span>All Materials Provided</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-card text-xs text-muted-foreground">
                <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span>Certificate Included</span>
              </div>
            </div>
          </motion.div>
        </div>

        <Separator />

        {/* Detailed Sections: Description, Curriculum, Inclusions, Instructor */}
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left 8 Cols: Curriculum & Inclusions */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                About This Workshop
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                {workshop.full_description || workshop.short_description}
              </p>
            </div>

            {/* What You Will Learn */}
            {workshop.what_you_will_learn && workshop.what_you_will_learn.length > 0 && (
              <div className="space-y-5">
                <h3 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  What You Will Learn
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {workshop.what_you_will_learn.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl border bg-card/60 shadow-sm"
                    >
                      <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-foreground font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What Is Included */}
            {workshop.what_is_included && workshop.what_is_included.length > 0 && (
              <div className="space-y-5">
                <h3 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  What Is Included
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {workshop.what_is_included.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Cols: Instructor Profile Card */}
          <div className="lg:col-span-4">
            <Card className="border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-card shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="relative h-28 w-28 mx-auto rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-muted">
                  <img
                    src={workshop.instructor_image || "/images/heritage/vijay-artisan.jpg"}
                    alt={workshop.instructor_name || "Sindhe Vijay"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {workshop.instructor_name || "Sindhe Vijay"}
                  </h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {workshop.instructor_role || "8th-Generation Master Artisan"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {workshop.instructor_experience || "25+ Years Heritage"}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed text-left border-t pt-3">
                  {workshop.instructor_bio ||
                    "Sindhe Vijay carries forward the ancient leather shadow puppetry legacy of Karnataka, conducting workshops across top design institutes, cultural museums, and international art forums."}
                </p>

                <Button
                  size="sm"
                  disabled={isFull}
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  {isFull ? "Session Full" : "Reserve Seat With Artist"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Workshops */}
        {related.length > 0 && (
          <div className="space-y-6 pt-12 border-t">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Other Upcoming Workshops
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rw) => (
                <Card key={rw.id} className="overflow-hidden border hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="aspect-[16/9] bg-muted overflow-hidden">
                    <img src={rw.image_url} alt={rw.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base line-clamp-1">{rw.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">📅 {rw.date} · ⏰ {rw.time}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link to={`/workshop/${rw.slug}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <WorkshopRegistrationModal
        workshop={workshop}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default WorkshopDetail;
