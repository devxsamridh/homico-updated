import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import {
  Star,
  Wrench, Zap, Droplets, Paintbrush, Hammer,
  Sparkles, HardHat, Users, Settings2, Snowflake,
  Calculator,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

type CategoryKey = "all" | "repairs" | "trades" | "help";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.enum(["all", "repairs", "trades", "help"]), "all").default("all"),
});

export const Route = createFileRoute("/services/")({
  validateSearch: zodValidator(searchSchema),
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Home Services — Plumbing, Electrical & more | Homico" },
      { name: "description", content: "Book trusted home services in minutes — plumbing, electrical, painting, carpentry, AC service, cleaning, mason and labour." },
    ],
  }),
});

type ServiceItem = {
  slug: string;
  title: string;
  desc: string;
  fee: string;
  icon: typeof Wrench;
  accent: string;
  tags: string[];
  category: Exclude<CategoryKey, "all">;
  rating: number;
  bookings: string;
};

export const SERVICES: ServiceItem[] = [
  { slug: "plumbing",     title: "Plumbing",              desc: "Leaks, fittings & pipe installations",     fee: "Inspection fee ₹89",  icon: Wrench,     accent: "bg-blue-500/10 text-blue-600",     tags: ["plumber","leak","tap","pipe","geyser"], category: "repairs", rating: 4.8, bookings: "3.2k+ done" },
  { slug: "electrician",  title: "Electrician",           desc: "Wiring, switches, fans & lights",          fee: "Inspection fee ₹89",  icon: Zap,        accent: "bg-amber-500/10 text-amber-600",   tags: ["electrician","wiring","fan","switch"],  category: "repairs", rating: 4.9, bookings: "4.1k+ done" },
  { slug: "waterproofing",title: "Waterproofing",         desc: "Roof, walls & bathroom sealing",           fee: "Inspection fee ₹149", icon: Droplets,   accent: "bg-cyan-500/10 text-cyan-600",     tags: ["waterproofing","seepage","roof"],       category: "repairs", rating: 4.7, bookings: "1.4k+ done" },
  { slug: "minor-repairs",title: "Minor Repairs",         desc: "Hinges, locks, patchwork & more",          fee: "Inspection fee ₹89",  icon: Settings2,  accent: "bg-orange-500/10 text-orange-600", tags: ["repair","handyman","lock","hinge"],     category: "repairs", rating: 4.7, bookings: "2.6k+ done" },
  { slug: "ac-service",   title: "AC Service",            desc: "Cleaning, gas refill & repair",            fee: "Inspection fee ₹99",  icon: Snowflake,  accent: "bg-sky-500/10 text-sky-600",       tags: ["ac","air conditioner","gas"],           category: "repairs", rating: 4.8, bookings: "2.9k+ done" },
  { slug: "mason",        title: "Mason",                 desc: "Brickwork, plastering & tiling",           fee: "Inspection fee ₹89",  icon: HardHat,    accent: "bg-stone-500/10 text-stone-700",   tags: ["mason","brick","plaster","tile"],       category: "trades",  rating: 4.7, bookings: "1.1k+ done" },
  { slug: "carpentry",    title: "Carpentry",             desc: "Wardrobes, cabinets & woodwork",           fee: "Inspection fee ₹89",  icon: Hammer,     accent: "bg-amber-600/10 text-amber-700",   tags: ["carpenter","wood","wardrobe"],          category: "trades",  rating: 4.8, bookings: "2.3k+ done" },
  { slug: "painting",     title: "Painting",              desc: "Interior, exterior & texture finishes",    fee: "Inspection fee ₹99",  icon: Paintbrush, accent: "bg-rose-500/10 text-rose-600",     tags: ["paint","wall","texture"],               category: "trades",  rating: 4.9, bookings: "3.7k+ done" },
  { slug: "labour",       title: "Labour / Helper",       desc: "General labour for any construction task", fee: "Per day ₹599",        icon: Users,      accent: "bg-slate-500/10 text-slate-700",   tags: ["labour","helper","construction"],       category: "help",    rating: 4.7, bookings: "900+ done" },
  { slug: "cleaning",     title: "Cleaning & Pest Control", desc: "Deep cleaning & pest control",           fee: "Starting ₹499",       icon: Sparkles,   accent: "bg-emerald-500/10 text-emerald-600", tags: ["cleaning","pest","deep clean"],       category: "help",    rating: 4.8, bookings: "5.4k+ done" },
];

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "repairs", label: "Repairs & maintenance" },
  { key: "trades",  label: "Skilled trades" },
  { key: "help",    label: "Help & labour" },
];

const SECTIONS: { key: Exclude<CategoryKey, "all">; label: string }[] = [
  { key: "repairs", label: "Repairs & maintenance" },
  { key: "trades",  label: "Skilled trades" },
  { key: "help",    label: "Help & labour" },
];

function matchesQuery(item: ServiceItem, q: string): boolean {
  if (!q) return true;
  const ql = q.toLowerCase();
  return (
    item.title.toLowerCase().includes(ql) ||
    item.desc.toLowerCase().includes(ql) ||
    item.tags.some((t) => t.includes(ql))
  );
}

function ServiceCard({ item }: { item: ServiceItem }) {
  const Icon = item.icon;
  return (
    <div className="group rounded-2xl border border-border bg-card p-4 flex flex-col transition-base hover:border-accent hover:shadow-elegant hover:-translate-y-0.5">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${item.accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">{item.desc}</p>
      <p className="text-xs font-medium text-foreground/80 mt-2">{item.fee}</p>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="font-medium text-foreground">{item.rating.toFixed(1)}</span>
        <span>·</span>
        <span>{item.bookings}</span>
      </div>
      <Button asChild variant="hero" size="sm" className="mt-3 w-full">
        <Link to="/services/book/$slug" params={{ slug: item.slug }}>
          Book
        </Link>
      </Button>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Book a visit",
      desc: "Choose your service, pick a date and time slot, pay a small inspection fee of ₹89–₹149.",
    },
    {
      num: "2",
      title: "Professional visits",
      desc: "A verified professional arrives at your home at the scheduled time with all necessary tools.",
    },
    {
      num: "3",
      title: "Inspection & quote",
      desc: "The professional inspects the issue and gives you a transparent, itemised cost quotation on the spot.",
    },
    {
      num: "4",
      title: "Accept or reject",
      desc: "You review the quote. Accept to proceed with the work, or reject with no extra charges beyond the inspection fee.",
    },
  ];

  return (
    <section className="bg-muted/40 border-y border-border py-10 md:py-14">
      <div className="container mx-auto px-4">
        {/* Desktop: 4 columns with dashed connector line */}
        <div className="hidden md:grid grid-cols-4 gap-4 relative">
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-border" />
          {steps.map((step) => (
            <div key={step.num} className="relative text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center">
                {step.num}
              </div>
              <h3 className="font-semibold text-sm mt-4">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack with dashed line */}
        <div className="md:hidden relative pl-10 space-y-8">
          <div className="absolute left-[19px] top-5 bottom-5 w-px border-l-2 border-dashed border-border" />
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <div className="absolute -left-10 top-0 h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center">
                {step.num}
              </div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 md:mt-10">
          You only pay the full amount after the work is completed to your satisfaction
        </p>
      </div>
    </section>
  );
}

function ServicesPage() {
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/services" });

  const filtered = useMemo(
    () => SERVICES.filter((i) => matchesQuery(i, q.trim())),
    [q],
  );

  const visibleSections = useMemo(
    () => (cat === "all" ? SECTIONS : SECTIONS.filter((s) => s.key === cat)),
    [cat],
  );

  return (
    <PublicLayout>
      {/* Compact toolbar — no big hero, land straight on cards */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-sm font-semibold text-foreground mr-1">Home Services & Maintenance</h1>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => {
              const active = cat === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => navigate({ search: (prev: { q: string; cat: "all" | "repairs" | "trades" | "help" }) => ({ ...prev, cat: c.key }) })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-base ${
                    active
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-foreground border-border hover:border-accent"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 md:py-10">
        {q.trim() && (
          <div className="mb-6 text-sm text-muted-foreground">
            {filtered.length === 0
              ? <>No results for <span className="font-medium text-foreground">“{q}”</span>.</>
              : <>{filtered.length} {filtered.length === 1 ? "service" : "services"} for <span className="font-medium text-foreground">“{q}”</span></>}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium">Nothing matched your search.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate({ search: (prev: { q: string; cat: "all" | "repairs" | "trades" | "help" }) => ({ ...prev, q: "", cat: "all" }) })}>
              Show all services
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {visibleSections.map((section) => {
              const items = filtered.filter((i) => i.category === section.key);
              if (items.length === 0) return null;
              return (
                <div key={section.key}>
                  <h2 className="text-lg md:text-xl font-semibold mb-4">{section.label}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {items.map((item) => <ServiceCard key={item.slug} item={item} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-14 rounded-2xl border border-border bg-gradient-subtle p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Not sure where to start?</h3>
              <p className="text-sm text-muted-foreground">Try our free AI cost estimator.</p>
            </div>
          </div>
          <Button asChild variant="hero">
            <Link to="/tools/estimator">Open Estimator</Link>
          </Button>
        </div>
      </section>

      <HowItWorks />
    </PublicLayout>
  );
}

