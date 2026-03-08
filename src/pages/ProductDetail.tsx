import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Shield, Award, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductById, getProductsByCategory, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

const inventoryLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "in-stock": { label: "In Stock", variant: "outline" },
  "made-to-order": { label: "Made to Order — 3-4 weeks", variant: "secondary" },
  "limited-edition": { label: "Limited Edition", variant: "default" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const [isNight, setIsNight] = useState(false);
  const { addItem } = useCart();

  if (!product) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="font-serif text-2xl font-bold">Product Not Found</h1>
        <Button asChild variant="outline">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const tag = inventoryLabels[product.inventoryTag];
  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

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
              className={`aspect-square overflow-hidden rounded-lg transition-colors duration-500 ${
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
            </div>
            {/* Day/Night Toggle */}
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
            <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · Free shipping across India</p>

            <Separator className="my-6" />

            <p className="leading-relaxed text-muted-foreground">{product.longDescription}</p>

            <Separator className="my-6" />

            {/* Details */}
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

            {/* Authenticity Badges */}
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
              onClick={() => addItem(product)}
            >
              <ShoppingBag className="h-4 w-4" /> Add to Shopping Bag
            </Button>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-2xl font-bold text-foreground">You May Also Like</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
