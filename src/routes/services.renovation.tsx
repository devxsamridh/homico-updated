import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Star, ShieldCheck, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { getServicesByGroup, formatServicePrice } from "@/lib/home-services";

export const Route = createFileRoute("/services/renovation")({
  component: RenovationPage,
  head: () => ({
    meta: [
      { title: "Renovation & Interiors — Modular Kitchen, False Ceiling, Interior Design | Homico" },
      { name: "description", content: "Interior design, painting, modular kitchens, false ceilings and full space renovations — designed and delivered end-to-end." },
      { property: "og:title", content: "Renovation & Interiors — Homico" },
      { property: "og:description", content: "Transform your home with end-to-end renovation and interior services." },
    ],
  }),
});

function RenovationPage() {
  const services = getServicesByGroup("renovation");

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
            <Palette className="h-3.5 w-3.5" /> Designed & delivered end-to-end
          </span>
          <h1 className="text-4xl md:text-5xl font-bold">Renovation & Interiors</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From a fresh coat of paint to a brand-new modular kitchen — everything you need to transform your space, with on-site inspection and transparent quotations.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to="/services/home-services/$category"
                  params={{ category: s.slug }}
                  className="group relative block h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-elegant hover:-translate-y-1.5"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={s.cover}
                      alt={s.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className={`absolute top-3 left-3 h-10 w-10 rounded-xl ${s.accent} backdrop-blur flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2 py-1 text-[11px] font-bold shadow">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {s.rating}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h2 className="text-lg font-bold leading-tight drop-shadow">{s.name}</h2>
                      <p className="text-[11px] opacity-90 mt-0.5">{s.tagline}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.highlights.map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-accent" />
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {s.basePrice === 0 ? "Site visit" : "Inspection fee"}
                        </div>
                        <div className="font-extrabold text-xl mt-0.5">{formatServicePrice(s)}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> {s.jobs}
                        </div>
                      </div>
                      <Button size="sm" variant="hero" className="gap-1 shadow-md group-hover:translate-x-1 transition-transform">
                        Book <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
