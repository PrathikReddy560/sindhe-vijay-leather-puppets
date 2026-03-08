import { motion } from "framer-motion";

const timeline = [
  { era: "~1800s", title: "The Beginning", desc: "The Sindhe family begins their journey in leather puppetry in the village of Jeekavandlapalli, Karnataka, creating puppets for royal courts and temple festivals." },
  { era: "~1900s", title: "Golden Era of Performances", desc: "Shadow puppet shows become the primary entertainment across South Indian villages. The Sindhe family performs epic tales from the Ramayana and Mahabharata to audiences of thousands." },
  { era: "~1960s", title: "Facing Modernity", desc: "With the arrival of cinema and television, traditional puppet performances decline. The family adapts by creating decorative pieces and wall art alongside performance puppets." },
  { era: "~1990s", title: "National Recognition", desc: "The artform gains national attention. Government initiatives and cultural festivals bring Thogalu Gombe to international stages, preserving the heritage." },
  { era: "Today", title: "8th Generation Renaissance", desc: "The current generation combines ancestral techniques with contemporary design, bringing this ancient art into modern homes as luxury décor, lighting, and wearable art." },
];

const Heritage = () => (
  <div className="py-12">
    <div className="container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Our Story</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">
          Eight Generations of<br />
          <span className="italic text-primary">Living Heritage</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
          In the village of Jeekavandlapalli, nestled in Chikkabalapur district of
          Karnataka, the Sindhe family has been transforming humble goat hide into
          luminous works of art for generations.
        </p>
      </motion.div>

      {/* Tholu Bommalata */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto mt-16 max-w-3xl"
      >
        <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">What is Thogalu Gombe?</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          <em>Thogalu Gombe</em> — literally "leather puppets" in Kannada — is one of the oldest
          forms of shadow puppetry in Karnataka. This art form uses
          large, translucent leather puppets held against a white cloth screen, backlit by an oil lamp
          or fire. The leather's perforations and colored dyes create vivid, moving images that bring
          mythological epics to life.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Traditional performances could last through entire nights, with a single family of puppeteers
          narrating, singing, and manipulating multiple characters. The stories — drawn from the
          Ramayana, Mahabharata, and Puranas — served not merely as entertainment but as moral
          education, spiritual practice, and community bonding.
        </p>
      </motion.section>

      {/* Timeline */}
      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center font-serif text-2xl font-bold text-foreground md:text-3xl">
          The Sindhe Family Journey
        </h2>
        <div className="mt-12 space-y-0">
          {timeline.map((item, i) => (
            <motion.div
              key={item.era}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative border-l-2 border-primary/20 pb-10 pl-8 last:pb-0"
            >
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
              <p className="font-serif text-sm font-bold text-primary">{item.era}</p>
              <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Jeekavandlapalli */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto mt-20 max-w-3xl rounded-lg border bg-card p-8"
      >
        <h2 className="font-serif text-2xl font-bold text-foreground">Jeekavandlapalli — The Village of Puppets</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Jeekavandlapalli is a village in Bagepalli taluk, Chikkabalapur district, that has been
          home to traditional leather puppetry for generations. The artisans here continue to work
          using time-honoured techniques, keeping the ancient craft of Thogalu Gombe alive
          through their dedication and skill.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          By purchasing from Sindhe Vijay Leather Puppets, you are directly supporting the
          preservation of this traditional cultural heritage and the livelihoods
          of artisan families in Jeekavandlapalli.
        </p>
      </motion.section>
    </div>
  </div>
);

export default Heritage;
