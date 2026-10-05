import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass, Calculator, HardHat, LineChart, Building2, ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services/planning-construction")({
  component: PlanningConstructionPage,
  head: () => ({
    meta: [
      { title: "Planning & Construction — Homico" },
      {
        name: "description",
        content:
          "From idea to handover — pick the right tool: architect consultation, cost estimation, full construction or live project tracking.",
      },
      { property: "og:title", content: "Planning & Construction — Homico" },
      {
        property: "og:description",
        content:
          "Choose your next step: consultation, estimation, construction or tracking.",
      },
    ],
  }),
});

const TOOLS = [
  {
    icon: Sparkles,
    title: "AI Home Planner",
    desc: "Answer a few questions and let AI draft a personalized floor plan, cost and materials list in minutes.",
    to: "/tools/ai-home-planner",
    cta: "Try AI Planner",
  },
  {
    icon: Compass,
    title: "Architecture Consultation",
    desc: "Share plot details and home requirements. Get build-ready plan direction from licensed architects.",
    to: "/services/planning",
    cta: "Book consultation",
  },
  {
    icon: Calculator,
    title: "Cost Estimation",
    desc: "Instant budget range, material requirements and timeline based on your plot, floors and finish quality.",
    to: "/tools/estimator",
    cta: "Open estimator",
  },
  {
    icon: Building2,
    title: "Home Elevation Ideas",
    desc: "Browse modern front elevations and request a plan tailored to your plot.",
    to: "/services/elevation-ideas",
    cta: "Browse designs",
  },
  {
    icon: HardHat,
    title: "Full Construction",
    desc: "One team, one contract — contractors, materials, workforce and quality, all coordinated end-to-end.",
    to: "/services/construction",
    cta: "Request construction",
  },
  {
    icon: LineChart,
    title: "Project Tracking",
    desc: "Live dashboard for every phase, progress percentage and on-site updates from your active project.",
    to: "/dashboard/projects",
    cta: "Open dashboard",
  },
] as const;

function PlanningConstructionPage() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container relative mx-auto px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-5">
              <HardHat className="h-3.5 w-3.5" /> Planning & Construction
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              From idea to handover —<br className="hidden md:block" />
              <span className="text-accent"> one tool at a time.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Pick the step you're on. Each tool focuses on one job, so you're never overwhelmed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
          {TOOLS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={t.to}
                className="group block h-full rounded-2xl border border-border bg-card p-7 hover:border-accent/40 hover:shadow-elegant hover:-translate-y-1 transition-base"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <t.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                <span className="mt-5 inline-flex items-center text-sm font-semibold text-accent gap-1 group-hover:gap-2 transition-all">
                  {t.cta} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-gradient-subtle p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Not sure where to start?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Begin with a free cost estimate, then book a consultation.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="hero">
              <Link to="/tools/estimator">Estimate cost</Link>
            </Button>
            <Button asChild variant="outlineNavy">
              <Link to="/services/planning">Talk to architect</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
