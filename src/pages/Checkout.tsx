import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  address: z.string().trim().min(1, "Address is required").max(300),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type ShippingData = z.infer<typeof shippingSchema>;

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingData>({
    fullName: "", phone: "", address: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("upi");

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="font-serif text-2xl font-bold">Your bag is empty</h1>
        <Button asChild variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  const handleShippingChange = (field: string, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateShipping = () => {
    const result = shippingSchema.safeParse(shipping);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handlePlaceOrder = () => {
    const orderId = `SVL-${Date.now().toString(36).toUpperCase()}`;
    clearCart();
    navigate(`/thank-you?orderId=${orderId}`);
  };

  const shippingCost = totalPrice >= 5000 ? 0 : 200;
  const grandTotal = totalPrice + shippingCost;

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="font-serif text-3xl font-bold text-foreground">Checkout</h1>

        {/* Steps Indicator */}
        <div className="mt-6 flex items-center gap-2 text-sm">
          {["Order Summary", "Shipping", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </span>
              <span className={step === i + 1 ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
              {i < 2 && <Separator className="w-8" />}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {/* Step 1: Summary */}
            {step === 1 && (
              <div className="space-y-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4 rounded-lg border bg-card p-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                      <img src={product.images.day} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-sm font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                    </div>
                    <p className="font-semibold text-primary">{formatPrice(product.price * quantity)}</p>
                  </div>
                ))}
                <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                  Continue to Shipping
                </Button>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={shipping.fullName} onChange={(e) => handleShippingChange("fullName", e.target.value)} />
                    {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={shipping.phone} onChange={(e) => handleShippingChange("phone", e.target.value)} placeholder="9876543210" />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={shipping.address} onChange={(e) => handleShippingChange("address", e.target.value)} />
                  {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>City</Label>
                    <Input value={shipping.city} onChange={(e) => handleShippingChange("city", e.target.value)} />
                    {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={shipping.state} onChange={(e) => handleShippingChange("state", e.target.value)} />
                    {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input value={shipping.pincode} onChange={(e) => handleShippingChange("pincode", e.target.value)} placeholder="515672" />
                    {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1" size="lg" onClick={() => validateShipping() && setStep(3)}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6 text-center">
                  <h3 className="font-serif text-lg font-semibold text-foreground">Scan & Pay</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Scan the QR code below using any UPI app (PhonePe, Google Pay, Paytm, etc.)
                  </p>
                  <div className="mx-auto mt-4 w-64 overflow-hidden rounded-lg border">
                    <img src="/images/payment-qr.jpeg" alt="Payment QR Code - Scan to pay via UPI" className="w-full" />
                  </div>
                  <p className="mt-3 text-lg font-bold text-primary">Amount: {formatPrice(grandTotal)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pay to: VIJAY S H</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">After payment, confirm your order:</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi! I've made a payment of ${formatPrice(grandTotal)} for my order. Here's my screenshot.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" /> Confirm via WhatsApp
                      </a>
                    </Button>
                    <Button className="flex-1 gap-2" size="lg" onClick={handlePlaceOrder}>
                      <ShieldCheck className="h-4 w-4" /> I Have Paid
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-lg border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold">Order Summary</h3>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
                {shippingCost === 0 && <p className="text-xs text-primary">Free shipping on orders above ₹5,000!</p>}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span className="font-serif">Total</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> SSL Secured · 100% Safe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
