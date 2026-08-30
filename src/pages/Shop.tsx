import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, SlidersHorizontal, X, Search, Check, Tag, ArrowUpDown, Ruler } from "lucide-react";
import { useProducts, toDisplayProduct, DisplayProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { categories, ProductCategory } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Required exact size filters: 5", 8", 12", 16", 25" + Custom
const EXACT_SIZE_PRESETS = [
  { value: "all", label: "All Sizes" },
  { value: '5"', label: '5"' },
  { value: '8"', label: '8"' },
  { value: '12"', label: '12"' },
  { value: '16"', label: '16"' },
  { value: '25"', label: '25"' },
];

const sortOptions = [
  { value: "default", label: "Featured & Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

const inventoryFilters = [
  { value: "all", label: "All Items" },
  { value: "in-stock", label: "In Stock" },
  { value: "made-to-order", label: "Made to Order" },
  { value: "limited-edition", label: "Limited Edition" },
];

// Strict size matcher: ONLY matches products with matching size in dimensions
const matchesExactSize = (product: DisplayProduct, sizeFilter: string): boolean => {
  if (!sizeFilter || sizeFilter === "all") return true;

  const rawQuery = sizeFilter.trim().toLowerCase();
  if (!rawQuery) return true;

  // Clean the filter query: strip quotes and unit words
  const cleanQuery = rawQuery
    .replace(/["”″′']/g, "")
    .replace(/\s*(inch|inches|in|in\.|cm|diameter|dia)\b/g, "")
    .trim();

  if (!cleanQuery) return true;

  // Check product dimension string (e.g. '8" × 5"', '12" diameter', '25" × 18"')
  const rawDim = (product.dimensions || "").toLowerCase();
  if (!rawDim) return false;

  // Extract all distinct numeric values from the product's dimension string
  const dimNumbers = rawDim.match(/\b\d+(\.\d+)?\b/g)?.map(Number) || [];

  // 1. If filter is a single number (e.g. "5", "8", "12", "16", "25")
  const queryNum = parseFloat(cleanQuery);
  if (!isNaN(queryNum) && !cleanQuery.includes("x") && !cleanQuery.includes("×") && !cleanQuery.includes("*")) {
    return dimNumbers.some((n) => Math.abs(n - queryNum) < 0.1);
  }

  // 2. If filter is multi-dimensional e.g. "30 x 14" or "30x14"
  const queryParts = cleanQuery.split(/[\s×*x,by]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
  if (queryParts.length >= 2) {
    return queryParts.every((qn) => dimNumbers.some((dn) => Math.abs(dn - qn) < 0.5));
  }

  // 3. Exact substring match in dimensions
  const normalizedDim = rawDim.replace(/["”″′']/g, "");
  return normalizedDim.includes(cleanQuery);
};

const Shop = () => {
  const { data: dbCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") as ProductCategory | null;
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(initialCategory || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sizeFilter, setSizeFilter] = useState("all");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const { data: dbProducts, isLoading } = useProducts();

  const allDisplayProducts = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map(toDisplayProduct);
  }, [dbProducts]);

  // Compute exact product counts for each prescribed size preset (5", 8", 12", 16", 25")
  const sizePresetsWithCounts = useMemo(() => {
    return EXACT_SIZE_PRESETS.map((preset) => {
      if (preset.value === "all") {
        return { ...preset, count: allDisplayProducts.length };
      }
      const matchingCount = allDisplayProducts.filter((p) => matchesExactSize(p, preset.value)).length;
      return { ...preset, count: matchingCount };
    });
  }, [allDisplayProducts]);

  const maxPrice = useMemo(() => {
    if (!allDisplayProducts.length) return 50000;
    return Math.max(...allDisplayProducts.map((p) => p.price), 50000);
  }, [allDisplayProducts]);

  // Strict Filtering logic
  const filtered = useMemo(() => {
    if (!allDisplayProducts.length) return [];
    let display = [...allDisplayProducts];

    // 1. Keyword search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      display = display.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.longDescription && p.longDescription.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.dimensions && p.dimensions.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (activeCategory !== "all") {
      display = display.filter((p) => p.category === activeCategory);
    }

    // 3. Price filter
    display = display.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // 4. Exact Size Filter (Strictly matches dimensions only)
    if (sizeFilter !== "all" && sizeFilter.trim() !== "") {
      display = display.filter((p) => matchesExactSize(p, sizeFilter));
    }

    // 5. Inventory status filter
    if (inventoryFilter !== "all") {
      display = display.filter((p) => p.inventoryTag === inventoryFilter);
    }

    // 6. Sort
    if (sortBy === "price-asc") display.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    else if (sortBy === "price-desc") display.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    else if (sortBy === "name-asc") display.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") display.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === "default") {
      display.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return display;
  }, [allDisplayProducts, activeCategory, searchQuery, priceRange, sizeFilter, inventoryFilter, sortBy]);

  const handleCategoryChange = (cat: ProductCategory | "all") => {
    setActiveCategory(cat);
    if (cat === "all") setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const handleSelectSizePreset = (val: string) => {
    setSizeFilter(val);
    setCustomSizeInput("");
  };

  const handleCustomSizeChange = (val: string) => {
    setCustomSizeInput(val);
    if (val.trim() === "") {
      setSizeFilter("all");
    } else {
      setSizeFilter(val);
    }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    sizeFilter !== "all" ||
    inventoryFilter !== "all" ||
    sortBy !== "default";

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, maxPrice]);
    setSizeFilter("all");
    setCustomSizeInput("");
    setInventoryFilter("all");
    setSortBy("default");
  };

  return (
    <div className="py-12">
      <div className="container">
        {/* Header Title & Intro */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Our Collection</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">Shop Handcrafted Heritage</h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Explore authentic Tholu Bommalata shadow puppets, perforated leather lamps, and grand traditional paintings.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="mt-8 mx-auto max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by craft name, size (e.g. 8&quot;, 12&quot;), deity, epic story, or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 text-sm bg-card border-border/80 rounded-full shadow-sm focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
            className="rounded-full px-4"
          >
            All Categories
          </Button>
          {(dbCategories ? dbCategories.map((c) => ({ value: c.slug, label: c.name })) : categories).map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
              className="rounded-full px-4"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Filter toggle + sort bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y py-3.5 bg-muted/20 px-3 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showFilters || hasActiveFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-background text-foreground font-bold">
                  Active
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> Reset Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {filtered.length} Product{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Applied:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Search: &ldquo;{searchQuery}&rdquo;
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {activeCategory !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Category: {activeCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("all")} />
              </Badge>
            )}
            {sizeFilter !== "all" && (
              <Badge variant="default" className="gap-1 text-xs font-semibold bg-amber-500 text-black hover:bg-amber-600">
                Size: {sizeFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setSizeFilter("all");
                    setCustomSizeInput("");
                  }}
                />
              </Badge>
            )}
            {inventoryFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Status: {inventoryFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setInventoryFilter("all")} />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                Price: {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange([0, maxPrice])} />
              </Badge>
            )}
          </div>
        )}

        {/* Expanded Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-xl border bg-card p-5 shadow-sm space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-3">
                {/* 1. Exact Size Filters: 5", 8", 12", 16", 25" + Custom Inches */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Ruler className="h-4 w-4 text-amber-500" /> Filter by Size (Inches)
                    </label>
                    {sizeFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSizeFilter("all");
                          setCustomSizeInput("");
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Reset Size
                      </button>
                    )}
                  </div>

                  {/* Prescribed Exact Size Buttons: 5", 8", 12", 16", 25" */}
                  <div className="flex flex-wrap items-center gap-2">
                    {sizePresetsWithCounts.map((s) => {
                      const isActive = sizeFilter === s.value && !customSizeInput;
                      return (
                        <Button
                          key={s.value}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectSizePreset(s.value)}
                          className={`h-9 text-xs font-medium gap-1.5 px-3.5 ${
                            isActive
                              ? "bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-sm"
                              : "hover:border-primary/50"
                          }`}
                        >
                          {isActive && <Check className="h-3 w-3" />}
                          <span>{s.label}</span>
                          {s.value !== "all" && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                isActive ? "bg-black/20 text-black" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {s.count}
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Custom Inches Input */}
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                      Or Custom Inches:
                    </span>
                    <Input
                      placeholder="e.g. 8, 12, 14, 30..."
                      value={customSizeInput}
                      onChange={(e) => handleCustomSizeChange(e.target.value)}
                      className="h-8 max-w-[200px] text-xs"
                    />
                    {customSizeInput && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground"
                        onClick={() => handleSelectSizePreset("all")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* 2. Price Range Slider */}
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Price Range</label>
                    <span className="text-xs font-mono text-muted-foreground">
                      Max: {formatPrice(maxPrice)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={250}
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs font-medium text-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* 3. Availability Filter */}
              <div className="pt-3 border-t flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-primary" /> Availability:
                </span>
                {inventoryFilters.map((inv) => (
                  <Button
                    key={inv.value}
                    type="button"
                    variant={inventoryFilter === inv.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-2.5 rounded-full"
                    onClick={() => setInventoryFilter(inv.value)}
                  >
                    {inv.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Catalog Grid */}
        {isLoading ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading handcrafted artworks...</p>
          </div>
        ) : (
          <motion.div
            layout
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State when no products match size/filters */}
        {!isLoading && filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <SlidersHorizontal className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              No products found matching size &ldquo;{sizeFilter}&rdquo;
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              There are currently no products in our catalog with dimensions matching this size. Please select another size preset or clear your filters.
            </p>
            <Button onClick={clearFilters} className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold" size="sm">
              View All Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
