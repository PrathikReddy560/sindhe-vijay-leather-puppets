import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Shield, Award, ShoppingBag, ArrowLeft, Loader2, ZoomIn, ZoomOut, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProduct, useProducts, toDisplayProduct } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

const inventoryLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "in-stock": { label: "In Stock", variant: "outline" },
  "made-to-order": { label: "Made to Order — 3-4 weeks", variant: "secondary" },
  "limited-edition": { label: "Limited Edition", variant: "default" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dbProduct, isLoading } = useProduct(id || "");
  const { data: allProducts } = useProducts();
  const [isNight, setIsNight] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dbProduct) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="font-serif text-2xl font-bold">Product Not Found</h1>
        <Button asChild variant="outline">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const product = toDisplayProduct(dbProduct);
  const tag = inventoryLabels[product.inventoryTag];
  const related = allProducts
    ?.filter((p) => p.category === dbProduct.category && p.slug !== dbProduct.slug)
    .slice(0, 4)
    .map(toDisplayProduct) || [];

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div
              className={`relative aspect-square overflow-hidden rounded-lg transition-colors duration-500 ${
                isNight ? "bg-foreground" : "bg-muted"
              }`}
            >
              <img
                src={isNight ? product.images.night : product.images.day}
                alt={`${product.name} — ${isNight ? "illuminated" : "daylight"} view`}
                className={`h-full w-full object-contain transition-all duration-500 ${
                  isNight ? "opacity-90 mix-blend-screen" : ""
                }`}
                loading="lazy"
              />
              <Dialog onOpenChange={(open) => !open && setZoomScale(1)}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-4 h-9 w-9 bg-black/60 text-white backdrop-blur hover:bg-black/80 hover:text-white border border-white/20 shadow-sm"
                  >
                    <Expand className="h-4 w-4" />
                    <span className="sr-only">Zoom image</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] h-[95vh] p-0 flex flex-col bg-black/95 border-none">
                  <DialogTitle className="sr-only">Zoom Image</DialogTitle>
                  <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
                    <img
                      src={isNight ? product.images.night : product.images.day}
                      alt={`${product.name} zoomed`}
                      style={{ transform: `scale(${zoomScale})` }}
                      className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-move"
                    />
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/20 backdrop-blur-md p-2 rounded-full border border-white/10">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full bg-black/50 text-white border-white/20 hover:bg-black hover:text-white"
                      onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))}
                      disabled={zoomScale <= 1}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-sm font-medium w-12 text-center">{Math.round(zoomScale * 100)}%</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full bg-black/50 text-white border-white/20 hover:bg-black hover:text-white"
                      onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 4))}
                      disabled={zoomScale >= 4}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 gap-2 bg-background/90 backdrop-blur"
              onClick={() => setIsNight(!isNight)}
            >
              {isNight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isNight ? "Day View" : "Night View"}
            </Button>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant={tag.variant}>{tag.label}</Badge>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.discountPrice)}</span>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold border-none px-2 py-0.5">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · Free shipping across India</p>

            <Separator className="my-6" />
            <p className="leading-relaxed text-muted-foreground">{product.longDescription}</p>
            <Separator className="my-6" />

            <div className="grid gap-3 text-sm">
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-medium text-foreground">{product.dimensions}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material</span>
                <span className="font-medium text-foreground">{product.material}</span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Certified Handmade</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4 text-primary" />
                <span>8th Generation Heritage</span>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-8 w-full gap-2"
              onClick={() => {
                if (!user) {
                  navigate("/login");
                } else {
                  addItem(product);
                }
              }}
            >
              <ShoppingBag className="h-4 w-4" /> {user ? "Add to Shopping Bag" : "Log in to Purchase"}
            </Button>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-2xl font-bold text-foreground">You May Also Like</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
