import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/slugify";
import { Sun, Moon } from "lucide-react";

const inventoryLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "in-stock": { label: "In Stock", variant: "outline" },
  "made-to-order": { label: "Made to Order", variant: "secondary" },
  "limited-edition": { label: "Limited Edition", variant: "default" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const ProductCard = ({ product }: { product: any }) => {
  const tag = inventoryLabels[product.inventoryTag] || { label: "In Stock", variant: "outline" };
  const targetSlug = product.slug ? slugify(product.slug) : slugify(product.name || product.id);

  const dayImg = product.imagesObj?.day || product.featuredImage || product.image_day || (Array.isArray(product.images) ? product.images[0] : "") || "/images/products/big-ganesha.jpg";
  const nightImg = product.imagesObj?.night || product.image_night || (Array.isArray(product.images) && product.images.length > 1 ? product.images[1] : "");
  const hasDualView = Boolean(nightImg && nightImg !== dayImg);

  return (
    <Link
      to={`/product/${targetSlug}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {/* Primary / Day Image */}
        <img
          src={dayImg}
          alt={product.name}
          className={`h-full w-full object-cover transition-all duration-500 ${
            hasDualView ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
          }`}
          loading="lazy"
        />

        {/* Secondary / Night Illuminated Image on Hover (if available) */}
        {hasDualView && (
          <img
            src={nightImg}
            alt={`${product.name} illuminated view`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105 bg-black/90"
            loading="lazy"
          />
        )}

        <Badge className="absolute left-3 top-3 z-10" variant={tag.variant}>
          {tag.label}
        </Badge>

        {/* Dual View Badge */}
        {hasDualView && (
          <div className="absolute right-2.5 top-2.5 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
              <Sun className="h-2.5 w-2.5 text-amber-400 fill-current" />
              <Moon className="h-2.5 w-2.5 text-indigo-300 fill-current" />
              <span className="hidden sm:inline">Dual View</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4">
        <h3 className="font-serif text-sm font-semibold text-foreground line-clamp-1 md:text-base">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 md:gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-sm font-bold text-primary md:text-base">{formatPrice(product.discountPrice)}</span>
              <span className="text-[10px] text-muted-foreground line-through md:text-xs">{formatPrice(product.price)}</span>
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[9px] font-bold border-none px-1 py-0.5 md:text-[10px] md:px-1.5">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </Badge>
            </>
          ) : (
            <span className="text-sm font-bold text-primary md:text-base">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
