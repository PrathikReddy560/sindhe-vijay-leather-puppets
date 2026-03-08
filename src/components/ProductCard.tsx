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
  const tag = inventoryLabels[product.inventoryTag];

  return (
    <Link
      to={`/product/${product.slug}`}
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
        <p className="mt-2 text-base font-bold text-primary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
