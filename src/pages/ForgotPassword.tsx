import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const ForgotPassword = () => {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Email sent!", description: "Check your inbox for the reset link." });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center py-12">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm">
          <Link to="/login" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>

          {sent ? (
            <div className="mt-8 rounded-lg border bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">Check your email for the password reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
