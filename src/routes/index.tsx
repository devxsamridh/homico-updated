import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, ArrowRight, Wrench, Users, Palette, Package,
  Compass, Calculator, HardHat,
  BadgeIndianRupee, LineChart, Sparkles, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Homico — Build, Repair & Upgrade Your Home" },
      { name: "description", content: "Services, materials, custom designs and construction — all in one smart platform for Bengaluru homeowners." },
      { property: "og:title", content: "Homico — Build, Repair & Upgrade Your Home" },
      { property: "og:description", content: "Trusted professionals, raw materials, custom designs and construction — all in one platform." },
    ],
  }),
});

const heroServices = [
  { emoji: "🛠️", label: "Home Maintenance", to: "/services/home-services" },
  { emoji: "👷", label: "Skilled Workforce", to: "/services/workforce" },
  { emoji: "🎨", label: "Renovation", to: "/services/renovation" },
  { emoji: "🧱", label: "Raw Materials", to: "/services/materials" },
  { emoji: "📐", label: "Architecture", to: "/services/planning" },
  { emoji: "🧮", label: "Cost Estimation", to: "/tools/estimator" },
  { emoji: "🏗️", label: "Construction", to: "/services/construction" },
] as const;

const popularSearches = [
  { label: "Plumbing", to: "/services/home-services" },
  { label: "Cement", to: "/services/materials" },
  { label: "Interior Design", to: "/services/renovation" },
  { label: "Painting", to: "/services/renovation" },
] as const;

const stats = [
  { k: "500+", v: "Homes Built" },
  { k: "120+", v: "Verified Experts" },
  { k: "1000+", v: "Orders Delivered" },
];

const categories = [
  { icon: Wrench, title: "Home Maintenance", desc: "Plumbing, electrical & repairs", to: "/services/home-services" },
  { icon: Users, title: "Skilled Workforce", desc: "Masons, painters, carpenters", to: "/services/workforce" },
  { icon: Palette, title: "Renovation & Interiors", desc: "Modular kitchens & interiors", to: "/services/renovation" },
  { icon: Package, title: "Raw Materials", desc: "Cement, steel, bricks, tiles", to: "/services/materials" },
  { icon: Compass, title: "Architecture", desc: "Licensed architects & plans", to: "/services/planning" },
  { icon: Calculator, title: "Cost Estimation", desc: "AI-assisted budget tool", to: "/tools/estimator" },
  { icon: HardHat, title: "Full Construction", desc: "End-to-end turnkey builds", to: "/services/construction" },
];

const whyHomico = [
  { icon: CheckCircle2, t: "Verified Professionals", d: "Background-checked & rated experts." },
  { icon: BadgeIndianRupee, t: "Transparent Pricing", d: "No hidden costs, clear quotes." },
  { icon: Calculator, t: "Smart Estimation", d: "AI-assisted budget calculator." },
  { icon: LineChart, t: "Project Tracking", d: "Live phases & site photos." },
  { icon: Sparkles, t: "Custom Designs", d: "Tailored elevations & interiors." },
];

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate({ to: "/services", search: { q: term } });
  };

  return (
    <PublicLayout>
      {/* Centered search-first Hero (HomeTriangle-style) */}
      <section className="relative overflow-hidden bg-background">
        {/* Decorative shapes — soft & minimal */}
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-24 hidden md:block">
          <div className="relative h-[280px] w-[280px]">
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute top-20 right-16 h-24 w-24 rounded-full bg-accent/15" />
            <div className="absolute bottom-6 right-32 grid grid-cols-3 gap-1.5 opacity-50">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-accent/50" />
              ))}
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-40 hidden md:block h-56 w-56 rounded-full opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, hsl(var(--accent) / 0.25) 0 1.5px, transparent 1.5px 10px)",
            WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 70%)",
            maskImage: "radial-gradient(circle, black 55%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 pt-[60px] md:pt-[60px] pb-12 md:pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-[1.15]">
              Build, Repair &amp;
              <br />
              <span className="text-accent">Upgrade</span> Your Home
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              Services, materials, custom designs and construction — all in one smart platform.
            </p>
          </motion.div>

          {/* Unified location + search pill */}
          <motion.form
            onSubmit={onSearch}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <div className="flex items-stretch rounded-full border border-border bg-card shadow-sm focus-within:border-accent focus-within:shadow-md transition-all overflow-hidden">
              {/* Location — ~30% */}
              <button
                type="button"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-accent/5 transition-colors text-left shrink-0 basis-[38%] sm:basis-[30%] min-w-0"
                aria-label="Change location"
              >
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight truncate">Bengaluru</div>
                  <div className="hidden sm:block text-[11px] text-muted-foreground leading-tight truncate">Only available here</div>
                </div>
              </button>

              {/* Divider */}
              <span className="w-px bg-border my-2" aria-hidden />

              {/* Search — ~70% */}
              <div className="flex items-center gap-2 px-3 sm:px-4 flex-1 min-w-0">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="Search plumbing, cement, painting…"
                  aria-label="Search services, materials, construction, designs"
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground py-2"
                />
                <button
                  type="submit"
                  className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity my-1 mr-1"
                >
                  Search
                </button>
                <button
                  type="submit"
                  aria-label="Search"
                  className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-full bg-accent text-accent-foreground my-1 mr-1"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.form>

          {/* Popular searches */}
          <div className="mt-4 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <span className="text-xs text-muted-foreground mr-1">Popular:</span>
            {popularSearches.map((p) => (
              <Link
                key={p.label}
                to={p.to}
                className="text-xs px-2.5 py-1 rounded-full border border-border/70 text-muted-foreground hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-colors"
              >
                {p.label}
              </Link>
            ))}
          </div>

          {/* Service cards — illustrated */}
          <div className="mt-10 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {heroServices.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className="group flex flex-col items-center justify-center gap-2.5 h-28 px-3 py-4 rounded-xl border border-border/70 bg-card hover:border-accent/50 hover:shadow-[0_8px_24px_-12px_hsl(var(--accent)/0.35)] hover:-translate-y-0.5 transition-all duration-300 text-center"
              >
                <span className="text-3xl md:text-4xl leading-none group-hover:scale-110 transition-transform duration-300" aria-hidden>
                  {s.emoji}
                </span>
                <span className="text-xs md:text-sm font-medium leading-tight text-foreground line-clamp-2">
                  {s.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Explore all CTA */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/services"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:gap-2.5 transition-all"
            >
              Explore All Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            {stats.map((s, i) => (
              <div key={s.v} className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{s.k}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.v}</span>
                {i < stats.length - 1 && <span className="hidden md:inline mx-4 h-4 w-px bg-border" aria-hidden />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Homico */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-1">Why Homico</h2>
            <h3 className="text-2xl md:text-3xl font-semibold">A smarter way to manage your home</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {whyHomico.map((w) => (
              <div key={w.t} className="flex flex-col items-start p-4 rounded-xl border border-border bg-card">
                <span className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
                  <w.icon className="h-4 w-4" />
                </span>
                <h5 className="text-sm font-semibold">{w.t}</h5>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slim CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold">Start your dream home today</h3>
              <p className="text-sm text-muted-foreground mt-1">Get a free personalized estimate in minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/tools/estimator">Get Free Quote <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outlineNavy" size="lg">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
