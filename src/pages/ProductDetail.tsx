import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Award, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProduct, useProducts, toDisplayProduct } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const inventoryLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "in-stock": { label: "In Stock", variant: "outline" },
  "made-to-order": { label: "Made to Order — 3-4 weeks", variant: "secondary" },
  "limited-edition": { label: "Limited Edition", variant: "default" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: dbProduct, isLoading } = useProduct(slug || "");
  const { data: allProducts } = useProducts();
  const [isNight, setIsNight] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Randomize related products in category on every product view
  const related = useMemo(() => {
    if (!allProducts || !dbProduct) return [];

    // Filter out the current product
    const otherProducts = allProducts.filter(
      (p) => p.slug !== dbProduct.slug && p.id !== dbProduct.id
    );

    // 1. Get products in the same category and shuffle randomly
    const sameCategory = otherProducts.filter((p) => p.category === dbProduct.category);
    const shuffledSameCategory = [...sameCategory].sort(() => Math.random() - 0.5);

    // 2. Get products in other categories and shuffle randomly (fallback/backfill)
    const otherCategories = otherProducts.filter((p) => p.category !== dbProduct.category);
    const shuffledOtherCategories = [...otherCategories].sort(() => Math.random() - 0.5);

    // Combine same category first, then backfill if needed to always show 4 products
    const combined = [...shuffledSameCategory, ...shuffledOtherCategories].slice(0, 4);

    return combined.map(toDisplayProduct);
  }, [allProducts, dbProduct?.id, dbProduct?.category, slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (!dbProduct) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center py-16">
        <h1 className="font-serif text-3xl font-bold text-foreground">Product Not Found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We couldn't find the product you're looking for. It may have been renamed or removed from our collection.
        </p>
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-semibold mt-2">
          <Link to="/shop">Explore Our Collection</Link>
        </Button>
      </div>
    );
  }

  const product = toDisplayProduct(dbProduct);
  const tag = inventoryLabels[product.inventoryTag] || { label: "In Stock", variant: "outline" };

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-amber-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Gallery with Fullscreen Zoom, Thumbnails, and Mobile Gestures */}
          <div>
            <ProductGallery
              images={product.images}
              productName={product.name}
              isNight={isNight}
              onToggleNight={(state) => setIsNight(state ?? !isNight)}
              hasNightImage={Boolean(product.imagesObj?.night && product.imagesObj?.night !== product.imagesObj?.day)}
              dayImage={product.imagesObj?.day}
              nightImage={product.imagesObj?.night}
            />
          </div>

          {/* Product Details & Purchase Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={tag.variant}>{tag.label}</Badge>
                {product.featured && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    ★ Featured Craft
                  </Badge>
                )}
              </div>

              <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
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
              <p className="mt-1.5 text-xs text-muted-foreground">Inclusive of all taxes · Free shipping across India</p>

              <Separator className="my-6" />
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line">{product.longDescription || product.description}</p>
              <Separator className="my-6" />

              <div className="grid gap-3 text-sm">
                {product.dimensions && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium text-foreground">{product.dimensions}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Material & Medium</span>
                    <span className="font-medium text-foreground">{product.material}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Art Form</span>
                  <span className="font-medium text-foreground">Thogalu Gombe (Leather Shadow Puppetry)</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                  <Shield className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>100% Certified Handmade</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                  <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>8th Generation Heritage</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Button
                size="lg"
                className="w-full gap-2 text-base font-semibold py-6 shadow-lg bg-amber-500 hover:bg-amber-600 text-black transition-all hover:shadow-amber-500/25"
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                  } else {
                    addItem(product as any);
                  }
                }}
              >
                <ShoppingBag className="h-5 w-5" /> {user ? "Add to Shopping Bag" : "Log in to Purchase"}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 border-t pt-12">
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
