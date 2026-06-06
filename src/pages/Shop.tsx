import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { useProducts, toDisplayProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { categories, ProductCategory } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const sizeFilters = [
  { value: "all", label: "All Sizes" },
  { value: '5"', label: '5"' },
  { value: '8"', label: '8"' },
  { value: '12"', label: '12"' },
  { value: '16"', label: '16"' },
  { value: '25"', label: '25"' },
];

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
];

const Shop = () => {
  const { data: dbCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") as ProductCategory | null;
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(initialCategory || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const { data: dbProducts, isLoading } = useProducts();

  const maxPrice = useMemo(() => {
    if (!dbProducts) return 50000;
    return Math.max(...dbProducts.map((p) => p.price), 50000);
  }, [dbProducts]);

  const filtered = useMemo(() => {
    if (!dbProducts) return [];
    let display = dbProducts.map(toDisplayProduct);

    // Category filter
    if (activeCategory !== "all") {
      display = display.filter((p) => p.category === activeCategory);
    }

    // Price filter
    display = display.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Size filter (matches dimension string)
    if (sizeFilter !== "all") {
      display = display.filter((p) => p.dimensions?.startsWith(sizeFilter));
    }

    // Sort
    if (sortBy === "price-asc") display.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") display.sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") display.sort((a, b) => a.name.localeCompare(b.name));

    return display;
  }, [activeCategory, dbProducts, priceRange, sizeFilter, sortBy]);

  const handleCategoryChange = (cat: ProductCategory | "all") => {
    setActiveCategory(cat);
    if (cat === "all") setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < maxPrice || sizeFilter !== "all" || sortBy !== "default";

  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSizeFilter("all");
    setSortBy("default");
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

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            All
          </Button>
          {(dbCategories ? dbCategories.map(c => ({ value: c.slug, label: c.name })) : categories).map((cat) => (
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

        {/* Filter toggle + sort bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-[10px]">!</Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{filtered.length} products</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-lg border bg-card p-4"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Price range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Price Range</label>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={500}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>

              {/* Size filter (for lamps) */}
              {(activeCategory === "all" || activeCategory === "hanging-lamps" || activeCategory === "lamps") && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Lamp Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizeFilters.map((s) => (
                      <Button
                        key={s.value}
                        variant={sizeFilter === s.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSizeFilter(s.value)}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

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
          <p className="mt-20 text-center text-muted-foreground">No products match your filters.</p>
        )}
      </div>
    </div>
  );
};

export default Shop;
