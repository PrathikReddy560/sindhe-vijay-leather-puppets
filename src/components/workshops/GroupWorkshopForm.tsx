import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, CheckCircle2, Loader2, Users, School, Building2 } from "lucide-react";
import { workshopStorage } from "@/lib/workshopStorage";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const GroupWorkshopForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState(30);
  const [preferredDate, setPreferredDate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !contactName.trim() || !phone.trim() || !email.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in Organization Name, Contact Person, Phone, and Email.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const enquiry = workshopStorage.addGroupEnquiry({
        org_name: orgName.trim(),
        contact_person: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        participants_count: Number(participants) || 30,
        preferred_date: preferredDate || "Flexible",
        location: location.trim() || "To be discussed",
        message: message.trim(),
        status: "Pending",
      });

      queryClient.invalidateQueries({ queryKey: ["group_enquiries"] });
      setSubmittedId(enquiry.id);
      toast({
        title: "Enquiry Submitted!",
        description: `Reference #${enquiry.id}. Master artisan Sindhe Vijay's team will contact you.`,
      });
    } catch (err: any) {
      toast({
        title: "Error submitting enquiry",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppEnquiryUrl = () => {
    const msg = encodeURIComponent(
      `Hello Sindhe Vijay Leather Puppets, we would like to invite you for a Group / Institutional Workshop.\n\nOrganization: ${orgName}\nContact Person: ${contactName}\nPhone: ${phone}\nEstimated Attendees: ${participants}\nProposed Date: ${preferredDate || "Flexible"}\nLocation: ${location}\nMessage: ${message}`
    );
    return `https://wa.me/919480326868?text=${msg}`;
  };

  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background shadow-xl overflow-hidden">
      <CardContent className="p-6 md:p-10">
        {submittedId ? (
          <div className="text-center py-8 space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Institutional Request Received!
            </h3>
            <p className="text-sm text-muted-foreground">
              Thank you, <strong>{contactName}</strong> from <strong>{orgName}</strong>. Our heritage coordinator will reach out to you within 24 hours.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold gap-2 shadow-md"
                asChild
              >
                <a href={getWhatsAppEnquiryUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 fill-current" /> Chat with Us on WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmittedId(null);
                  setOrgName("");
                  setContactName("");
                  setPhone("");
                  setEmail("");
                  setMessage("");
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                <School className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Schools · Colleges · Universities · Corporates
                </span>
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-foreground">
                Request a Custom Group Workshop
              </h3>
              <p className="text-sm text-muted-foreground">
                We organize full-day and multi-day experiential craft residencies with all tools, raw parchment, and illuminated shadow stages delivered to your campus.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organization / Institution Name *</Label>
                <Input
                  id="orgName"
                  required
                  placeholder="e.g. National Institute of Design / DPS School"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contact Person Name *</Label>
                <Input
                  id="contactName"
                  required
                  placeholder="e.g. Dr. Priya Rao"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orgPhone">Phone Number (WhatsApp) *</Label>
                <Input
                  id="orgPhone"
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orgEmail">Email Address *</Label>
                <Input
                  id="orgEmail"
                  required
                  type="email"
                  placeholder="contact@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orgParticipants">Expected Participants</Label>
                <Input
                  id="orgParticipants"
                  type="number"
                  placeholder="e.g. 40"
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value) || 10)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orgDate">Preferred Date(s)</Label>
                <Input
                  id="orgDate"
                  placeholder="e.g. Mid October 2026 or Flexible"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="orgLoc">Campus / City Location</Label>
                <Input
                  id="orgLoc"
                  placeholder="e.g. Electronic City Campus, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="orgMsg">Workshop Requirements / Specific Motifs</Label>
                <Textarea
                  id="orgMsg"
                  rows={3}
                  placeholder="Tell us about the target age group, specific themes (e.g. Ramayana stories, animal puppets), or workshop duration needed..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="text-center pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full sm:w-auto px-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg hover:shadow-amber-500/25"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Institutional Request
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
