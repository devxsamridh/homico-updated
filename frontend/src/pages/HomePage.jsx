import { lazy, Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Wrench,
  Truck,
  Ruler,
  HardHat,
  CalendarCheck,
  MapPin,
  ClipboardText,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  CurrencyInr,
} from "@phosphor-icons/react";
import ServiceCard from "../components/ServiceCard.jsx";
import Reveal, { RevealItem } from "../components/Reveal.jsx";
import AnimatedPill from "../components/hero/AnimatedPill.jsx";

// Lazy-load heavier visual elements of the hero to keep initial bundle optimal
const HeroBackgroundEffect = lazy(
  () => import("../components/hero/HeroBackgroundEffect.jsx")
);
const HomicoAppMock = lazy(() => import("../components/hero/HomicoAppMock.jsx"));

/* ── Content Data ── */
const SERVICES = [
  {
    icon: Wrench,
    title: "Home Services",
    description: "Plumbing, electrical, AC repair & house help.",
  },
  {
    icon: Ruler,
    title: "Architecture & Planning",
    description: "Designs & consultations from licensed architects.",
  },
  {
    icon: Truck,
    title: "Raw Materials",
    description: "Cement, steel, bricks — delivered to site.",
  },
  {
    icon: HardHat,
    title: "Full Construction",
    description: "End-to-end turnkey home building.",
  },
];

const STEPS = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "Book a service",
    desc: "Pick the service, slot and address in under a minute.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Expert visits you",
    desc: "A verified professional inspects on-site for ₹89.",
  },
  {
    icon: ClipboardText,
    step: "03",
    title: "Get a quotation",
    desc: "Transparent breakdown of labour + materials, no surprises.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Approve & start",
    desc: "Accept the quote and the work begins immediately.",
  },
];

const VALUE_PROPS = [
  { icon: CurrencyInr, text: "₹89 Flat Inspection Visit" },
  { icon: ShieldCheck, text: "Verified Professionals" },
  { icon: ClipboardText, text: "Transparent Quotations" },
];

function StepCard({ icon: Icon, step, title, desc }) {
  return (
    <RevealItem>
      <div className="relative flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-soft-xs transition-all duration-200 hover:shadow-soft hover:border-ink/20">
        <div className="flex items-center justify-between">
          <span className="text-5xl font-black text-ink/10 select-none">
            {step}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface-muted text-ink">
            <Icon size={22} weight="duotone" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">{desc}</p>
        </div>
      </div>
    </RevealItem>
  );
}

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const [manualSimplified, setManualSimplified] = useState(false);
  const isReduced = shouldReduceMotion || manualSimplified;

  return (
    <>
      {/* ── Reference-Inspired Clean Hero Section ────────────────── */}
      <section
        className="hero-spectrum relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32"
        aria-label="Homico Introduction"
        data-simplified={isReduced ? "true" : undefined}
      >
        {/* Ambient background glow & grid lines (lazy loaded) */}
        <Suspense fallback={null}>
          <HeroBackgroundEffect />
        </Suspense>

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Top Badge / Animated Pill */}
            <div className="mb-6 flex justify-center">
              <AnimatedPill
                text="Your complete home ecosystem"
                badge="Platform"
                href="#services-heading"
                isReducedMotion={isReduced}
              />
            </div>

            {/* Main Headline */}
            <motion.h1
              className="hero-headline text-3xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12]"
              initial={{ opacity: 0, y: isReduced ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isReduced ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="headline-sheen">Build, Repair &amp; Manage Your Home,</span>{" "}
              <span className="text-spectrum inline-block">
                All in One Place
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-base font-normal text-ink-muted md:text-lg leading-relaxed text-balance"
              initial={{ opacity: 0, y: isReduced ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: isReduced ? 0.01 : 0.55,
                delay: isReduced ? 0 : 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              Book <span className="hl hl-1">on-demand home services</span>, source <span className="hl hl-3">raw materials</span>, hire <span className="hl hl-2">architects</span>
              and manage <span className="hl hl-4">full home construction</span> from one app.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4"
              initial={{ opacity: 0, y: isReduced ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: isReduced ? 0.01 : 0.55,
                delay: isReduced ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Primary action: Solid primary, text-primary-foreground */}
              <Link
                to="/services"
                className="spectrum-primary group relative flex h-14 w-full sm:w-auto min-w-[210px] items-center justify-center gap-2.5 rounded-2xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
              >
                <span>Explore Services</span>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              {/* Secondary action: border-line, bg-surface */}
              <Link
                to="/materials"
                className="flex h-14 w-full sm:w-auto min-w-[210px] items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-7 text-sm font-semibold text-ink shadow-soft-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-muted hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
              >
                <span>Order Materials</span>
              </Link>
            </motion.div>

            {/* Value Props Row */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isReduced ? 0 : 0.35, duration: isReduced ? 0.01 : 0.5 }}
            >
              {VALUE_PROPS.map((vp, index) => (
                <div
                  key={vp.text}
                  className="spectrum-chip inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3.5 py-1 text-xs font-medium text-ink-muted backdrop-blur-sm"
                >
                  <vp.icon size={14} weight="duotone" className={`spectrum-chip-icon spectrum-icon-${index + 1}`} />
                  <span>{vp.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Accessibility / simplified version toggle */}
            <div className="mt-4 text-[11px] text-ink-faint">
              <span>Looking for reduced animation? </span>
              <button
                type="button"
                onClick={() => setManualSimplified((prev) => !prev)}
                className="underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {manualSimplified
                  ? "Turn animations back on"
                  : "Switch to simplified version"}
              </button>
            </div>
          </div>

          {/* Large Visual Below Copy: Homico Application Mock */}
          <div className="mt-14 md:mt-20">
            <Suspense
              fallback={
                <div className="mx-auto h-[400px] w-full max-w-5xl rounded-3xl border border-line bg-surface-muted skeleton" />
              }
            >
              <HomicoAppMock isReducedMotion={isReduced} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── What we offer ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20" aria-labelledby="services-heading">
        <Reveal className="text-center mb-12">
          <h2 id="services-heading" className="text-heading-lg font-bold text-ink">
            Everything you need, in one place
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            From a leaky tap to a full home build — Homico connects you with the right professionals.
          </p>
        </Reveal>

        <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </Reveal>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section
        className="py-20 bg-surface-muted border-y border-line"
        aria-labelledby="how-heading"
      >
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-14">
            <h2 id="how-heading" className="text-heading-lg font-bold text-ink">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-muted">
              Four simple steps from booking to completed work — fully transparent at every stage.
            </p>
          </Reveal>

          <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <StepCard key={s.title} {...s} index={i} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-10 text-center text-ink shadow-soft-lg md:p-16">
            {/* Subtle monochrome ambient light inside banner */}
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/[0.04] blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/[0.04] blur-2xl"
              aria-hidden
            />

            <h2 className="relative text-2xl font-extrabold md:text-4xl text-ink">
              Ready to transform your home?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-ink-muted">
              Start with a flat ₹89 inspection visit. No obligation — just a transparent quote from a verified professional.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Create a free account
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Browse services
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
