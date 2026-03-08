import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Award, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { useFeaturedProducts, toDisplayProduct } from "@/hooks/useProducts";
import { categories } from "@/data/products";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const Index = () => {
  const { data: featuredDb, isLoading } = useFeaturedProducts();
  const featured = featuredDb?.map(toDisplayProduct) || [];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-gradient-to-br from-background via-parchment to-muted">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('/placeholder.svg')", backgroundSize: "300px", backgroundRepeat: "repeat" }} />
        <div className="container relative z-10 py-20">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium uppercase tracking-[0.3em] text-primary">
              Jeekavandlapalli · Karnataka
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="mt-4 font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              The Dance of<br />
              <span className="italic text-primary">Shadows & Light</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Handcrafted leather shadow puppets and luminous art from the ancient tradition of
              Thogalu Gombe — where goat hide transforms into stories that dance with light.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/shop">Explore Collection <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
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
          <div className="mt-14 grid gap-8 md:grid-cols-3">
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
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.value} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Link to={`/shop?category=${cat.value}`} className="group flex h-40 items-end overflow-hidden rounded-lg bg-muted p-6 transition-shadow hover:shadow-lg">
                  <span className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{cat.label}</span>
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
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
    </>
  );
};

export default Index;
