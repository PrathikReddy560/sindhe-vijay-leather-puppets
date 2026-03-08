import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useProducts, toDisplayProduct } from "@/hooks/useProducts";
import { categories, ProductCategory } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") as ProductCategory | null;
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(initialCategory || "all");
  const { data: dbProducts, isLoading } = useProducts();

  const filtered = useMemo(() => {
    if (!dbProducts) return [];
    const display = dbProducts.map(toDisplayProduct);
    return activeCategory === "all" ? display : display.filter((p) => p.category === activeCategory);
  }, [activeCategory, dbProducts]);

  const handleCategoryChange = (cat: ProductCategory | "all") => {
    setActiveCategory(cat);
    if (cat === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="py-12">
      <div className="container">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Our Collection</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">Shop</h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Each piece is a unique work of art, handcrafted with centuries-old techniques by the Sindhe family.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <motion.div
            layout
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-20 text-center text-muted-foreground">No products in this category yet.</p>
        )}
      </div>
    </div>
  );
};

export default Shop;
