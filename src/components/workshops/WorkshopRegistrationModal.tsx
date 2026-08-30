import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, MessageCircle, CheckCircle2, Loader2, Users } from "lucide-react";
import { WorkshopItem, workshopStorage } from "@/lib/workshopStorage";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  workshop: WorkshopItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkshopRegistrationModal = ({ workshop, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  if (!workshop) return null;

  const availableSeats = workshop.available_seats !== undefined ? workshop.available_seats : (workshop.total_seats || 20);
  const isFull = availableSeats <= 0;
  const totalPrice = (workshop.price || 0) * seats;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please enter your Full Name, Phone Number, and Email Address.",
        variant: "destructive",
      });
      return;
    }

    if (seats > availableSeats) {
      toast({
        title: "Seats unavailable",
        description: `Only ${availableSeats} seat(s) remaining for this workshop session.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const reg = workshopStorage.addRegistration({
        workshop_id: workshop.id,
        workshop_title: workshop.title,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        seats_booked: Number(seats) || 1,
        preferred_date: workshop.date,
        message: notes.trim(),
        payment_status: "Pending",
        status: "Pending",
      });

      queryClient.invalidateQueries({ queryKey: ["workshops_v2"] });
      queryClient.invalidateQueries({ queryKey: ["workshop"] });
      queryClient.invalidateQueries({ queryKey: ["workshop_registrations"] });

      setConfirmedBooking(reg);
      toast({
        title: "Registration Received!",
        description: `Your booking ID is ${reg.id}. Our artisan team will contact you shortly.`,
      });
    } catch (err: any) {
      toast({
        title: "Booking error",
        description: err.message || "Failed to submit booking.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setConfirmedBooking(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setSeats(1);
    setNotes("");
  };

  const getWhatsAppConfirmationUrl = () => {
    if (!confirmedBooking) return "";
    const msg = encodeURIComponent(
      `Hello Sindhe Vijay Leather Puppets, I have registered for the workshop: "${workshop.title}"!\n\nBooking ID: ${confirmedBooking.id}\nName: ${confirmedBooking.full_name}\nPhone: ${confirmedBooking.phone}\nParticipants: ${confirmedBooking.seats_booked}\nDate: ${workshop.date}\nVenue: ${workshop.location}\n\nPlease share the payment / reporting details.`
    );
    return `https://wa.me/919480326868?text=${msg}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        {confirmedBooking ? (
          <div className="py-6 text-center space-y-5">
            <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1.5">
              <Badge className="bg-green-600 text-white font-mono text-xs">
                Booking ID: {confirmedBooking.id}
              </Badge>
              <DialogTitle className="font-serif text-2xl font-bold text-foreground">
                Registration Confirmed!
              </DialogTitle>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Thank you, <strong>{confirmedBooking.full_name}</strong>! We have reserved{" "}
                <strong>{confirmedBooking.seats_booked} seat(s)</strong> for you for{" "}
                <em>{workshop.title}</em>.
              </p>
            </div>

            <div className="bg-muted/40 rounded-xl p-4 text-xs md:text-sm text-left space-y-2 border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">{workshop.date} · {workshop.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue:</span>
                <span className="font-medium">{workshop.location}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="text-amber-600 dark:text-amber-400">₹{totalPrice}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold gap-2 shadow-md"
                asChild
              >
                <a href={getWhatsAppConfirmationUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 fill-current" /> Confirm on WhatsApp
                </a>
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold">
                Book Workshop Session
              </DialogTitle>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {workshop.title}
              </p>
            </DialogHeader>

            {/* Session Quick Overview */}
            <div className="p-3 bg-muted/40 rounded-xl border text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  <span>{workshop.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>{workshop.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="line-clamp-1">{workshop.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                  <span className={`font-semibold ${availableSeats <= 3 ? "text-red-500" : "text-green-600"}`}>
                    {availableSeats} seats left
                  </span>
                </div>
              </div>
            </div>

            {isFull ? (
              <div className="p-6 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 space-y-2">
                <p className="font-bold text-lg">⚠️ Workshop is Currently Full</p>
                <p className="text-xs text-muted-foreground">
                  All seats have been booked for this session. Please explore our other upcoming sessions or request a custom workshop!
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="regName">Your Full Name *</Label>
                  <Input
                    id="regName"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="regPhone">Mobile Phone (WhatsApp) *</Label>
                    <Input
                      id="regPhone"
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="regEmail">Email Address *</Label>
                    <Input
                      id="regEmail"
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="space-y-1.5">
                    <Label htmlFor="regSeats">Participants (Seats)</Label>
                    <select
                      id="regSeats"
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Array.from({ length: Math.min(availableSeats, 10) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Person" : "People"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-right">
                    <p className="text-[11px] text-muted-foreground">Total Fee</p>
                    <p className="font-serif font-bold text-lg text-amber-600 dark:text-amber-400">
                      ₹{totalPrice}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regNotes">Special Notes / Questions (optional)</Label>
                  <Textarea
                    id="regNotes"
                    rows={2}
                    placeholder="Any specific art interests or accessibility needs..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {!isFull && (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Booking (₹{totalPrice})
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
