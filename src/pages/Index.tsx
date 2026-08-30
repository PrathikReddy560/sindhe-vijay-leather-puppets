import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Award, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { useFeaturedProducts, toDisplayProduct, useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { categories } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const defaultBackgrounds = [
  "/images/products/big-ganesha.jpg",
  "/images/products/lamp-2-night.jpg",
  "/images/products/big-ramayana.jpg",
  "/images/products/lamp-4-night.jpg",
];

const Index = () => {
  const { data: featuredDb, isLoading } = useFeaturedProducts();
  const { data: dbProducts } = useProducts();
  const { data: dbCategories } = useCategories();
  const featured = featuredDb?.map(toDisplayProduct) || [];
  const [heroBackgrounds, setHeroBackgrounds] = useState<string[]>(defaultBackgrounds);
  const [bgIndex, setBgIndex] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("image_url")
          .order("created_at", { ascending: true });
        
        if (!error && data && data.length > 0) {
          setHeroBackgrounds(data.map((slide: any) => slide.image_url));
        }
      } catch (err) {
        console.error("Error fetching hero slides:", err);
      }
    };

    const fetchHomeContent = async () => {
      try {
        const { data: vids } = await supabase.from("showcase_videos").select("*").order("created_at", { ascending: false });
        if (vids) setVideos(vids);
        
        const { data: storyData } = await supabase.from("art_stories").select("*").order("created_at", { ascending: false });
        if (storyData) setStories(storyData);
      } catch (err) {
        console.error("Error fetching homepage videos/stories:", err);
      }
    };

    fetchHeroSlides();
    fetchHomeContent();
  }, []);

  useEffect(() => {
    if (heroBackgrounds.length <= 1) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBackgrounds]);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100vh] items-center overflow-hidden bg-black text-white -mt-16 md:-mt-20 pt-16 md:pt-20">
        {/* Background Slideshow with Slow Cinematic Ken Burns Zoom */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 0.5, scale: 1.05 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 5.5, ease: "linear" }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${heroBackgrounds[bgIndex]}')` }}
            />
          </AnimatePresence>
          {/* Subtle Ambient & Edge Vignette Overlays for Maximum Art Brilliance */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 z-10 pointer-events-none" />
          <div
            className="absolute inset-0 z-10 opacity-70 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)" }}
          />
        </div>

        <div className="container relative z-20 py-24 md:py-32">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs md:text-sm font-semibold uppercase tracking-[0.35em] text-amber-400/90 drop-shadow-sm"
            >
              Jeekavandlapalli · Karnataka
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-4 font-serif text-3xl font-bold leading-tight text-white md:text-6xl lg:text-7xl tracking-tight"
            >
              The Dance of<br />
              <span className="italic font-normal text-amber-400 drop-shadow-[0_2px_20px_rgba(251,191,36,0.35)]">
                Shadows & Light
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone-200/90 md:text-lg"
            >
              Handcrafted leather shadow puppets and luminous art from the ancient tradition of
              Thogalu Gombe — where goat hide transforms into stories that dance with light.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="group bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all"
                asChild
              >
                <Link to="/shop" className="flex items-center gap-2">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-black/30 backdrop-blur-sm text-white border-white/30 hover:bg-white/15 hover:text-white transition-colors"
                asChild
              >
                <Link to="/heritage">Our Heritage</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Authenticity Bar */}
      <section className="border-y bg-card">
        <div className="container flex flex-wrap items-center justify-center gap-8 py-5 text-sm md:gap-16">
          {[
            { icon: Shield, text: "Certified Handmade" },
            { icon: Award, text: "8th Generation Heritage" },
            { icon: Sparkles, text: "Natural Dyes & Materials" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">The Art</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">Ancient Craft, Living Tradition</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Each piece begins with carefully selected goat hide, cured and treated using methods unchanged for centuries. The leather is then hand-perforated with thousands of tiny holes using iron styluses, creating the intricate patterns that come alive when backlit. Natural mineral dyes — turmeric yellow, indigo blue, pomegranate red — are applied by hand, layer by layer.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-6 md:gap-8 md:grid-cols-3">
            {[
              { title: "Select & Cure", desc: "Premium goat hide is carefully selected and treated using traditional lime-water curing methods for flexibility and translucency." },
              { title: "Perforate & Shape", desc: "Thousands of perforations are hand-punched with iron styluses to create patterns that cast mesmerizing shadows when illuminated." },
              { title: "Paint & Assemble", desc: "Natural mineral dyes are applied in multiple layers. Articulated puppets are assembled with bamboo sticks for performance." },
            ].map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2, duration: 0.5 }} className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-serif text-lg font-bold text-primary">{i + 1}</div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Collections</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">Browse by Category</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {(dbCategories || []).map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className="group relative flex h-48 items-end overflow-hidden rounded-lg bg-stone-900 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {(() => {
                    const imgUrl = cat.image_url || dbProducts?.find((p) => p.category === cat.slug)?.image_day;
                    return imgUrl ? (
                      <>
                        <img
                          src={imgUrl}
                          alt={cat.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent z-10" />
                    );
                  })()}
                  <span className="relative z-20 font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors drop-shadow-md">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Curated</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">Featured Pieces</h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/shop">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="mt-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="bg-card py-20 border-t">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">The Process</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">Art in Motion</h2>
              <p className="mt-3 text-muted-foreground text-sm">Watch the master artisans bringing traditional leather shadow puppetry to life.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {videos.map((vid) => (
                <div key={vid.id} className="rounded-lg overflow-hidden border shadow-sm bg-background">
                  <div className="aspect-video relative">
                    <iframe
                      src={vid.video_url}
                      title={vid.title || "Showcase Video"}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {vid.title && (
                    <div className="p-4 bg-card">
                      <h3 className="font-serif text-base font-semibold text-foreground">{vid.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Art Stories Section */}
      {stories.length > 0 && (
        <section className="py-20 border-t">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Folklore</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">Stories Behind the Art</h2>
              <p className="mt-3 text-muted-foreground text-sm">Every leather puppet and motif represents an ancient mythological legend or local folklore.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <Card key={story.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="h-60 bg-muted overflow-hidden">
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-bold mb-3">{story.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{story.story}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Index;
