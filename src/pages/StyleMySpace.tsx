import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Wand2,
  Eye,
  Sun,
  Moon,
  Check,
  ArrowRight,
  RefreshCw,
  Palette,
  Lightbulb,
  Home,
  Sliders,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts, toDisplayProduct, DisplayProduct } from "@/hooks/useProducts";

// Curated sample rooms for instant demo
const SAMPLE_ROOMS = [
  {
    id: "sample-living",
    name: "Contemporary Living Room",
    wallColor: "Warm Beige",
    roomType: "Living Room",
    lighting: "Warm Ambient",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    tags: ["Neutral Walls", "High Ceilings", "Statement Wall"],
  },
  {
    id: "sample-pooja",
    name: "Traditional Pooja / Mandir Wall",
    wallColor: "Earthy Terracotta",
    roomType: "Pooja Sanctum",
    lighting: "Cozy Golden",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    tags: ["Sacred Space", "Wood Tones", "Spiritual Art"],
  },
  {
    id: "sample-dining",
    name: "Warm Dining & Foyer",
    wallColor: "Crisp Off-White",
    roomType: "Dining & Foyer",
    lighting: "Bright Daylight",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    tags: ["Minimalist", "Accent Lighting", "Centerpiece"],
  },
  {
    id: "sample-bedroom",
    name: "Serene Bedroom Accent",
    wallColor: "Charcoal Slate",
    roomType: "Bedroom",
    lighting: "Soft Ambient",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    tags: ["Dark Accent Wall", "Night Glow", "Calming"],
  },
];

const ROOM_STYLES = [
  { id: "all", label: "All Decor Types" },
  { id: "lamps", label: "Perforated Lamps & Lighting" },
  { id: "paintings", label: "Grand Wall Paintings" },
  { id: "puppets", label: "Sacred Shadow Puppets" },
  { id: "hangings", label: "Heritage Wall Hangings" },
];

const WALL_PALETTES = [
  { id: "beige", name: "Warm Beige / Sand", hex: "#E8D8C8", textDark: true },
  { id: "white", name: "Crisp White / Cream", hex: "#F5F5F0", textDark: true },
  { id: "terracotta", name: "Earthy Terracotta / Clay", hex: "#C86D51", textDark: false },
  { id: "charcoal", name: "Deep Charcoal / Slate", hex: "#2E3440", textDark: false },
  { id: "wood", name: "Warm Teak / Wood Panel", hex: "#8B5A2B", textDark: false },
  { id: "indigo", name: "Royal Indigo / Navy", hex: "#1E2A4A", textDark: false },
  { id: "sage", name: "Olive / Sage Green", hex: "#6E7F67", textDark: false },
];

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const StyleMySpace: React.FC = () => {
  const { data: dbProducts, isLoading } = useProducts();

  // Upload and Analysis States
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_ROOMS[0].image);
  const [roomName, setRoomName] = useState<string>(SAMPLE_ROOMS[0].name);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(true);

  // Analysis Attributes
  const [detectedPalette, setDetectedPalette] = useState<string>("Warm Beige / Sand");
  const [detectedLighting, setDetectedLighting] = useState<string>("Warm Ambient");
  const [detectedRoomType, setDetectedRoomType] = useState<string>("Living Room");
  const [preferredStyle, setPreferredStyle] = useState<string>("all");

  // AR Wall Preview State
  const [previewProduct, setPreviewProduct] = useState<DisplayProduct | null>(null);
  const [overlayPos, setOverlayPos] = useState({ x: 50, y: 38 }); // percentage coordinates
  const [overlayScale, setOverlayScale] = useState(100); // scale percentage
  const [isRoomNight, setIsRoomNight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allDisplayProducts = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map(toDisplayProduct);
  }, [dbProducts]);

  // Set default preview product once catalog loads
  useEffect(() => {
    if (allDisplayProducts.length > 0 && !previewProduct) {
      setPreviewProduct(allDisplayProducts[0]);
    }
  }, [allDisplayProducts, previewProduct]);

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setRoomName(file.name.replace(/\.[^/.]+$/, ""));
        runAnalysis();
      }
    };
    reader.readAsDataURL(file);
  };

  // Run Space Analysis Simulation
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalyzed(false);
    setTimeout(() => {
      // Heuristic analysis based on current preferences
      setIsAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  // Select a preset room
  const handleSelectSample = (sample: typeof SAMPLE_ROOMS[0]) => {
    setSelectedImage(sample.image);
    setRoomName(sample.name);
    setDetectedPalette(sample.wallColor);
    setDetectedLighting(sample.lighting);
    setDetectedRoomType(sample.roomType);
    runAnalysis();
  };

  // Product Recommendation Engine
  const recommendations = useMemo(() => {
    if (!allDisplayProducts.length) return [];

    return allDisplayProducts
      .map((p) => {
        let score = 85;
        let reason = "";

        const isLamp = p.category.toLowerCase().includes("lamp");
        const isPainting = p.category.toLowerCase().includes("painting");
        const isPuppet = p.category.toLowerCase().includes("puppet");
        const isHanging = p.category.toLowerCase().includes("hanging") || p.category.toLowerCase().includes("wall");

        // Match based on detected lighting & wall
        if (detectedLighting.includes("Warm") || isRoomNight) {
          if (isLamp) {
            score += 12;
            reason = "The intricate pinhole perforations cast warm golden shadow patterns, dramatically enhancing the ambient room mood.";
          } else if (p.imagesObj?.night) {
            score += 10;
            reason = "Translucent vegetable-dyed parchment creates a mesmerizing backlit illumination against evening wall lighting.";
          }
        }

        if (detectedPalette.includes("Beige") || detectedPalette.includes("White")) {
          if (isPainting || isPuppet) {
            score += 8;
            reason = reason || "The rich natural dyes and epic mythological narrative create a vibrant focal contrast against light neutral walls.";
          }
        } else if (detectedPalette.includes("Terracotta") || detectedPalette.includes("Wood")) {
          if (isPuppet || isPainting) {
            score += 10;
            reason = reason || "Harmonizes seamlessly with traditional Indian architecture and sacred prayer sanctums with rich spiritual aura.";
          }
        } else if (detectedPalette.includes("Charcoal") || detectedPalette.includes("Slate") || detectedPalette.includes("Indigo")) {
          if (isLamp || isPuppet) {
            score += 11;
            reason = reason || "Striking dramatic contrast on dark accent walls — the illuminated colors pop with museum-gallery brilliance.";
          }
        }

        if (!reason) {
          reason = "Master artisan craftsmanship hand-perforated on goat hide, bringing 500 years of living Karnataka heritage to your space.";
        }

        return {
          product: p,
          matchScore: Math.min(score, 99),
          reason,
          isLamp,
          isPainting,
          isPuppet,
          isHanging,
        };
      })
      .filter((item) => {
        if (preferredStyle === "all") return true;
        if (preferredStyle === "lamps") return item.isLamp;
        if (preferredStyle === "paintings") return item.isPainting;
        if (preferredStyle === "puppets") return item.isPuppet;
        if (preferredStyle === "hangings") return item.isHanging;
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [allDisplayProducts, detectedPalette, detectedLighting, isRoomNight, preferredStyle]);

  // Stage Drag & Position Handlers for AR Wall Visualizer
  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    setIsDragging(true);
    updateOverlayFromEvent(e.clientX, e.clientY);
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateOverlayFromEvent(e.clientX, e.clientY);
  };

  const handleStageMouseUp = () => {
    setIsDragging(false);
  };

  const updateOverlayFromEvent = (clientX: number, clientY: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((clientY - rect.top) / rect.height) * 100));
    setOverlayPos({ x, y });
  };

  return (
    <div className="py-10 md:py-16 bg-background space-y-12">
      {/* ========================================================================= */}
      {/* Hero Header */}
      {/* ========================================================================= */}
      <section className="container text-center max-w-4xl mx-auto space-y-4">
        <Badge className="uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1 gap-1.5 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> AI Space Styling Studio
        </Badge>
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Style My Space
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload a photo of your wall, living room, or pooja mandir. Our intelligent space analyzer pairs your wall color, lighting, and interior style with authentic handcrafted leather artworks.
        </p>
      </section>

      {/* ========================================================================= */}
      {/* Step 1: Upload or Choose Sample Room */}
      {/* ========================================================================= */}
      <section className="container max-w-6xl mx-auto">
        <Card className="border shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Upload className="h-5 w-5 text-amber-500" />
                  1. Upload Your Room or Try a Sample Wall
                </CardTitle>
                <CardDescription>
                  Upload your actual home wall or choose one of our curated interior templates.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-sm"
                  size="sm"
                >
                  <Upload className="h-4 w-4" /> Upload Room Photo
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Sample Rooms Selector */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Or select an interior template:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_ROOMS.map((sample) => {
                  const isSelected = selectedImage === sample.image;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all p-1.5 ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.02] bg-amber-500/10"
                          : "border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                        <img
                          src={sample.image}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-black rounded-full p-1 shadow">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 px-1">
                        <p className="text-xs font-semibold text-foreground truncate">{sample.name}</p>
                        <p className="text-[11px] text-muted-foreground">{sample.wallColor}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* Step 2: Interactive AR Wall Visualizer & Live Preview */}
      {/* ========================================================================= */}
      <section className="container max-w-6xl mx-auto">
        <Card className="border shadow-lg overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-amber-500" />
                  2. Interactive Wall Preview & Lighting Simulation
                </CardTitle>
                <CardDescription>
                  Drag the artwork onto your wall, adjust the scale, and toggle Day/Night lighting to witness the glowing shadow effect.
                </CardDescription>
              </div>

              {/* Day / Night Room Lighting Mode */}
              <div className="flex items-center gap-2 bg-background p-1 rounded-full border shadow-sm">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsRoomNight(false)}
                  className={`h-8 px-3 rounded-full text-xs font-semibold gap-1.5 ${
                    !isRoomNight
                      ? "bg-amber-500 text-black shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Daylight
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsRoomNight(true)}
                  className={`h-8 px-3 rounded-full text-xs font-semibold gap-1.5 ${
                    isRoomNight
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5 text-amber-300" /> Night Illumination
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Main AR Wall Stage */}
              <div className="lg:col-span-8 space-y-3">
                <div
                  ref={stageRef}
                  onMouseDown={handleStageMouseDown}
                  onMouseMove={handleStageMouseMove}
                  onMouseUp={handleStageMouseUp}
                  className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border shadow-inner select-none cursor-crosshair transition-all duration-500 ${
                    isRoomNight ? "brightness-[0.45] contrast-[1.15]" : ""
                  }`}
                >
                  {/* Background Room Photo */}
                  <img
                    src={selectedImage}
                    alt={roomName}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Overlaid Handcrafted Product on Wall */}
                  {previewProduct && (
                    <motion.div
                      style={{
                        position: "absolute",
                        left: `${overlayPos.x}%`,
                        top: `${overlayPos.y}%`,
                        transform: "translate(-50%, -50%)",
                        width: `${(overlayScale / 100) * 32}%`,
                      }}
                      className="cursor-move z-10 transition-transform duration-75"
                    >
                      <div className="relative group/artwork">
                        <img
                          src={
                            isRoomNight
                              ? previewProduct.imagesObj?.night || previewProduct.images[1] || previewProduct.images[0]
                              : previewProduct.imagesObj?.day || previewProduct.images[0]
                          }
                          alt={previewProduct.name}
                          className={`w-full h-auto object-contain pointer-events-none transition-all duration-300 ${
                            isRoomNight
                              ? "filter drop-shadow-[0_0_35px_rgba(251,191,36,0.85)] brightness-125"
                              : "filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                          }`}
                        />

                        {/* Interactive Drag Hint Overlay */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover/artwork:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 border border-white/20">
                          <Move className="h-2.5 w-2.5" /> Click & Drag to reposition
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Room Ambient Lighting Tint */}
                  {isRoomNight && (
                    <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply pointer-events-none" />
                  )}

                  {/* Stage Watermark & Helper Tag */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="font-semibold">{roomName}</span>
                    <span className="text-white/50">|</span>
                    <span className="text-amber-400 font-mono">
                      {isRoomNight ? "🌙 Night Backlit Glow" : "☀️ Natural Daylight"}
                    </span>
                  </div>
                </div>

                {/* AR Visualizer Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border text-xs">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="font-medium text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                      <Sliders className="h-3.5 w-3.5 text-amber-500" /> Scale Size:
                    </span>
                    <Slider
                      min={40}
                      max={180}
                      step={5}
                      value={[overlayScale]}
                      onValueChange={(val) => setOverlayScale(val[0])}
                      className="w-32 sm:w-44"
                    />
                    <span className="font-mono text-foreground font-semibold">{overlayScale}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOverlayPos({ x: 50, y: 38 });
                        setOverlayScale(100);
                      }}
                      className="h-7 text-xs gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Position
                    </Button>
                  </div>
                </div>
              </div>

              {/* Space Analysis & Currently Previewed Product Card */}
              <div className="lg:col-span-4 space-y-4">
                {/* Detected Palette & Atmosphere Card */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-amber-500" /> Space Attributes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Wall Tone:</span>
                      <span className="font-semibold text-foreground">{detectedPalette}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Lighting:</span>
                      <span className="font-semibold text-foreground">{detectedLighting}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Recommended Style:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {detectedRoomType} Heritage Accent
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Currently Placed Product Card */}
                {previewProduct && (
                  <Card className="border border-amber-500/40 bg-card shadow-sm overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 rounded-lg overflow-hidden border bg-muted/20 flex-shrink-0 p-1">
                          <img
                            src={previewProduct.images[0]}
                            alt={previewProduct.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-1">
                            {previewProduct.category}
                          </Badge>
                          <h4 className="font-serif text-sm font-bold text-foreground truncate">
                            {previewProduct.name}
                          </h4>
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            {formatPrice(previewProduct.price)}
                          </p>
                        </div>
                      </div>

                      {previewProduct.dimensions && (
                        <p className="text-[11px] text-muted-foreground">
                          Dimensions: <span className="font-medium text-foreground">{previewProduct.dimensions}</span>
                        </p>
                      )}

                      <div className="pt-2 flex gap-2">
                        <Button
                          asChild
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-8 gap-1.5 shadow-sm"
                        >
                          <Link to={`/product/${previewProduct.slug}`}>
                            <Eye className="h-3.5 w-3.5" /> View Product Page
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* Step 3: Recommended Handcrafted Artworks for this Space */}
      {/* ========================================================================= */}
      <section className="container max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-amber-500" />
              Recommended Artworks for Your Wall
            </h2>
            <p className="text-sm text-muted-foreground">
              Artisan creations ranked by color harmony, architectural proportion, and evening illumination glow.
            </p>
          </div>

          {/* Decor Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ROOM_STYLES.map((style) => (
              <Button
                key={style.id}
                size="sm"
                variant={preferredStyle === style.id ? "default" : "outline"}
                onClick={() => setPreferredStyle(style.id)}
                className={`h-8 text-xs rounded-full px-3 ${
                  preferredStyle === style.id
                    ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                    : ""
                }`}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Recommendation Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.slice(0, 9).map(({ product, matchScore, reason }) => {
            const isCurrentlyPreviewed = previewProduct?.id === product.id;
            return (
              <Card
                key={product.id}
                className={`flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:shadow-lg ${
                  isCurrentlyPreviewed ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/5" : "bg-card"
                }`}
              >
                <div>
                  {/* Image Stage with Match Score Badge */}
                  <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden border-b p-3 flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    />

                    {/* Match Score Badge */}
                    <Badge className="absolute top-3 right-3 bg-amber-500 text-black font-bold text-xs gap-1 shadow">
                      <Sparkles className="h-3 w-3" /> {matchScore}% Match
                    </Badge>

                    {product.imagesObj?.night && (
                      <Badge className="absolute bottom-3 left-3 bg-indigo-900/90 text-white text-[10px] font-medium gap-1 border-indigo-500/30">
                        <Moon className="h-2.5 w-2.5 text-amber-300" /> Day & Night View
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {product.category}
                      </Badge>
                      <span className="font-serif font-bold text-base text-foreground">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-foreground leading-snug line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Architectural / Aesthetic Pairing Rationale */}
                    <div className="p-2.5 rounded-lg bg-muted/40 border text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground block mb-0.5">Why it fits your space:</span>
                      {reason}
                    </div>

                    {product.dimensions && (
                      <p className="text-xs text-muted-foreground">
                        Size: <span className="font-medium text-foreground">{product.dimensions}</span>
                      </p>
                    )}
                  </CardContent>
                </div>

                {/* Actions Footer */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={isCurrentlyPreviewed ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPreviewProduct(product);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="text-xs font-semibold gap-1.5 h-9"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                    {isCurrentlyPreviewed ? "On Wall" : "Try on Wall"}
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-1.5 h-9 shadow-sm"
                  >
                    <Link to={`/product/${product.slug}`}>
                      <ExternalLink className="h-3.5 w-3.5" /> View Product
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Artisan Custom Commission Banner */}
      {/* ========================================================================= */}
      <section className="container max-w-6xl mx-auto pt-6">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 p-8 md:p-12 text-center space-y-4">
          <Badge className="bg-amber-500 text-black font-semibold uppercase tracking-wider">
            Need Custom Dimensions or Wall Murals?
          </Badge>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground">
            Bespoke Leather Artwork for Your Exact Wall Dimensions
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            Master artisan Sindhe Vijay creates custom-dimensioned shadow puppets, backlit murals, and bespoke lamps tailored to your architectural blueprints and interior color schemes.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-md">
              <Link to="/contact">
                Enquire for Custom Wall Commission <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/shop">Explore Full Catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StyleMySpace;
