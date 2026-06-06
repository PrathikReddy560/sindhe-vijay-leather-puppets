import { motion } from "framer-motion";
import { Award, Loader2, Sparkles } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Achievements = () => {
  const { data: achievements, isLoading } = useAchievements();

  return (
    <div className="py-12 md:py-20 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="mb-3 uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black font-semibold">Honors & Recognition</Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl flex items-center justify-center gap-2">
            <Award className="h-8 w-8 text-amber-500 hidden sm:inline" />
            Achievements
          </h1>
          <p className="mt-4 text-muted-foreground">
            A testament to generations of dedicated craftsmanship and efforts to keep the traditional art of leather puppetry alive.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <div>
            {achievements && achievements.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col justify-between border-amber-500/20 bg-card/80">
                      {ach.image_url && (
                        <div className="h-64 overflow-hidden relative group">
                          <img
                            src={ach.image_url}
                            alt={ach.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-amber-500 text-black p-1.5 rounded-full">
                            <Sparkles className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="font-serif text-xl font-bold mb-3 text-foreground">{ach.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{ach.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-lg border border-dashed bg-muted/30 max-w-lg mx-auto">
                <Award className="h-12 w-12 text-amber-500/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No accomplishments posted yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Our family has been crafting art for decades; we will update our awards database soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
