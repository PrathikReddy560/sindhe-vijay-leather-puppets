import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({ full_name: null, phone: null, address: null, city: null, state: null, pincode: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, phone, address, city, state, pincode")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  return (
    <div className="py-12">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">My Account</h1>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>

          <Separator className="my-8" />

          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground">Profile Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={profile.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={profile.state || ""} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={profile.pincode || ""} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>

          <Separator className="my-8" />

          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">Order History</h2>
            <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border bg-muted/30 py-12">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/shop")}>
                Start Shopping
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
