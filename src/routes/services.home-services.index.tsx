import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  SPECIALIZED_SERVICES,
  type SpecializedService,
} from "@/lib/specialized-services";

export const Route = createFileRoute("/services/home-services/")({
  component: HomeMaintenancePage,
  head: () => ({
    meta: [
      { title: "Specialized Home Solutions — Plumbing, Electrical & more | Homico" },
      {
        name: "description",
        content:
          "Book trusted home services in Bengaluru — plumbing, electrical, painting, carpentry and materials. Transparent pricing, verified pros, fast response.",
      },
      { property: "og:title", content: "Specialized Home Solutions — Homico" },
      {
        property: "og:description",
        content: "Inspection-based home services with transparent quotes.",
      },
    ],
  }),
});

function HomeMaintenancePage() {
  const isMobile = useIsMobile();

  return (
    <PublicLayout>
      <section className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-4">
            <Wrench className="h-3.5 w-3.5" /> Inspection-based booking
          </span>
          <h1 className="text-4xl md:text-5xl font-bold">Specialized Home Solutions</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Plumbing, electrical, painting, carpentry and materials — booked in minutes, delivered by verified Bengaluru pros with transparent on-site quotes.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        {isMobile ? (
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {SPECIALIZED_SERVICES.map((s, i) => (
                <CarouselItem key={s.slug} className="pl-3 basis-[85%]">
                  <SpecializedCard service={s} index={i} mobile />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECIALIZED_SERVICES.map((s, i) => (
              <SpecializedCard key={s.slug} service={s} index={i} />
            ))}
          </div>
        )}

        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">How inspection-based booking works</h2>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Pay only the inspection visit fee upfront. Final price is set after on-site review.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: 1, t: "Book a slot", d: "Pick date, time and address. Pay only the inspection fee." },
              { n: 2, t: "Pro visits you", d: "Verified vendor arrives and inspects the issue on-site." },
              { n: 3, t: "Get a quote", d: "Transparent breakdown of labor + material cost. No surprises." },
              { n: 4, t: "Accept or reject", d: "Approve to start the work, or pay only the inspection fee." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
                <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center mb-3">
                  {s.n}
                </div>
                <div className="font-semibold">{s.t}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-gradient-subtle p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Looking for renovation or interiors?</h3>
            <p className="text-sm text-muted-foreground">
              Modular kitchens, false ceilings, painting, interior design and full space renovations.
            </p>
          </div>
          <Button asChild variant="hero">
            <Link to="/services/renovation">
              Explore Renovation & Interiors <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

function SpecializedCard({
  service: s,
  index,
  mobile = false,
}: {
  service: SpecializedService;
  index: number;
  mobile?: boolean;
}) {
  const Icon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <div
        className={`group relative h-full rounded-2xl border-2 border-border bg-card p-5 flex flex-col transition-all duration-300 hover:border-accent hover:shadow-elegant hover:-translate-y-1 motion-reduce:hover:translate-y-0`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`h-12 w-12 rounded-xl ${s.accent} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {s.tagline}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 px-2 py-1 text-[11px] font-bold shrink-0">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {s.rating}
          </span>
        </div>

        {/* Verified badge */}
        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified Professionals
        </div>

        {/* Price + response */}
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold leading-tight">{s.priceLabel}</div>
            <div className="text-[11px] text-muted-foreground">{s.priceNote}</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              {s.responseTime}
            </div>
          </div>
        </div>

        {/* Sub-services: hover-expand on desktop, always visible on mobile */}
        <div
          className={
            mobile
              ? "mt-4 grid grid-cols-1 gap-1.5"
              : "mt-0 grid grid-cols-1 gap-1.5 overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-4 transition-all duration-300 ease-out"
          }
          aria-label={`${s.name} sub-services`}
        >
          {s.subServices.map((sub) => (
            <div
              key={sub}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              {sub}
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                s.availability.available ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <MapPin className="h-3 w-3" />
            {s.availability.label}
          </span>
          <span className="font-medium">{s.jobs}</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            asChild
            variant="hero"
            size="sm"
            className="gap-1 group-hover:shadow-glow transition-all"
          >
            {s.detailsHref ? (
              <Link to={s.detailsHref}>
                Book Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                to="/services/home-services/$category"
                params={{ category: s.bookSlug }}
              >
                Book Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </Button>
          {s.detailsHref ? (
            <Link
              to={s.detailsHref}
              className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
            >
              View Details <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              to="/services/home-services/$category"
              params={{ category: s.bookSlug }}
              className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
            >
              View Details <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
