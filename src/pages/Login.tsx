import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/profile");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!" });
        navigate("/profile");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm"
        >
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp ? "Join us to track orders and save favorites" : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            {!isSignUp && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
