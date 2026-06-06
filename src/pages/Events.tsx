import { motion } from "framer-motion";
import { MapPin, Calendar, Ticket, Loader2 } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Events = () => {
  const { data: events, isLoading } = useEvents();

  const todayStr = new Date().toISOString().split("T")[0];

  const upcoming = events?.filter(e => e.end_date >= todayStr) || [];
  const past = events?.filter(e => e.end_date < todayStr) || [];

  const formatDateRange = (start: string, end: string) => {
    const sOpt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const startDate = new Date(start).toLocaleDateString("en-IN", sOpt);
    const endDate = new Date(end).toLocaleDateString("en-IN", sOpt);
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  };

  return (
    <div className="py-12 md:py-20 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="mb-3 uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black font-semibold">Exhibitions & Stalls</Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">Our Live Events</h1>
          <p className="mt-4 text-muted-foreground">
            We regularly set up stalls and conduct leather shadow puppetry showcases at major cultural festivals and events. Find us near you!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Events */}
            <div>
              <h2 className="font-serif text-2xl font-bold mb-8 border-b pb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                Upcoming Exhibitions
              </h2>
              {upcoming.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-dashed bg-muted/30">
                  <p className="text-muted-foreground">No upcoming exhibitions scheduled at the moment.</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon or follow our Instagram for live updates!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {upcoming.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        {ev.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <CardContent className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-none font-medium">
                                Stall: {ev.stall_no || "To Be Announced"}
                              </Badge>
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-3">{ev.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{ev.description}</p>
                          </div>
                          <div className="space-y-2 pt-4 border-t text-sm text-muted-foreground mt-auto">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{formatDateRange(ev.start_date, ev.end_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{ev.location}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Events */}
            {past.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-8 border-b pb-2 text-muted-foreground">Past Shows & Exhibitions</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((ev) => (
                    <Card key={ev.id} className="overflow-hidden bg-card/60 opacity-90 h-full flex flex-col justify-between">
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-2">{formatDateRange(ev.start_date, ev.end_date)}</span>
                          <h3 className="font-serif text-lg font-bold mb-2">{ev.title}</h3>
                          <p className="text-muted-foreground text-xs line-clamp-3 mb-4">{ev.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-3 border-t">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{ev.location}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
