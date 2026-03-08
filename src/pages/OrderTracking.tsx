import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const statusConfig: Record<string, { label: string; color: string; icon: any; step: number }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200", icon: Clock, step: 0 },
  confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: CheckCircle2, step: 1 },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-700 border-purple-200", icon: Truck, step: 2 },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-700 border-green-200", icon: Package, step: 3 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-700 border-red-200", icon: XCircle, step: -1 },
};

const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .eq("order_id", orderId)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setOrder(data);
      setItems(data.order_items || []);
      setLoading(false);
    };

    fetchOrder();

    // Realtime subscription for status updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `order_id=eq.${orderId}` },
        (payload) => {
          setOrder((prev: any) => prev ? { ...prev, ...payload.new } : prev);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, orderId]);

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h1 className="font-serif text-2xl font-bold text-foreground">Order Not Found</h1>
        <p className="text-muted-foreground">We couldn't find this order in your account.</p>
        <Button variant="outline" onClick={() => navigate("/profile")}>Back to Profile</Button>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const currentStep = currentStatus.step;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="py-12">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="mb-4 gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Button>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Order #{order.order_id}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <Badge variant="outline" className={`text-sm px-3 py-1 ${currentStatus.color}`}>
                {currentStatus.label}
              </Badge>
            </div>
          </div>

          {/* Status Timeline */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              {isCancelled ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <XCircle className="h-12 w-12 text-destructive" />
                  <p className="text-lg font-semibold text-foreground">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">This order has been cancelled. Contact us for questions.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress bar */}
                  <div className="absolute left-0 top-5 hidden h-0.5 w-full bg-muted sm:block" />
                  <div
                    className="absolute left-0 top-5 hidden h-0.5 bg-primary transition-all duration-500 sm:block"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {steps.map((step, i) => {
                      const isCompleted = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center text-center">
                          <div
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                              isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-background text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                          >
                            {i === 0 && <Clock className="h-4 w-4" />}
                            {i === 1 && <CheckCircle2 className="h-4 w-4" />}
                            {i === 2 && <Truck className="h-4 w-4" />}
                            {i === 3 && <Package className="h-4 w-4" />}
                          </div>
                          <p className={`mt-2 text-xs font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-16 w-16 rounded-lg border object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping Address
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} – {order.shipping_pincode}</p>
                <p>{order.shipping_phone}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;
