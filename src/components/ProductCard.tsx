import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/products";

const inventoryLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "in-stock": { label: "In Stock", variant: "outline" },
  "made-to-order": { label: "Made to Order", variant: "secondary" },
  "limited-edition": { label: "Limited Edition", variant: "default" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const ProductCard = ({ product }: { product: Product }) => {
  const tag = inventoryLabels[product.inventoryTag] || { label: "In Stock", variant: "outline" };

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.images.day}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <Badge className="absolute left-3 top-3" variant={tag.variant}>
          {tag.label}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-sm font-semibold text-foreground line-clamp-1 md:text-base">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-base font-bold text-primary">{formatPrice(product.discountPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-bold border-none px-1.5 py-0.5">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </Badge>
            </>
          ) : (
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
