import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const whatsappUrl = `https://wa.me/919113599830?text=${encodeURIComponent("Hello! I'm interested in custom leather puppet work.")}`;

  return (
    <div className="py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Get in Touch</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">
            Contact & Custom Orders
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Have a question, or dreaming of a bespoke puppet commission? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-5">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5 lg:col-span-3"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your name" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="your@email.com" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} placeholder="Custom Order / General Inquiry" />
              {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject}</p>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => handleChange("message", e.target.value)} placeholder="Tell us about your requirements..." />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Send Message
            </Button>
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground">WhatsApp Us</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                For quick inquiries and bespoke commissions, reach us directly on WhatsApp.
              </p>
              <Button variant="outline" className="mt-4 gap-2" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Visit Our Workshop</h3>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Jeekavandlapalli Village, Thimmampalli Post,<br />Gulur Hobli, Bagepalli Taluk,<br />Chikkabalapur District, Karnataka 561207</span>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>+91 91135 99830</span>
              </div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>sindhevijayleatherpuppets@gmail.com</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
