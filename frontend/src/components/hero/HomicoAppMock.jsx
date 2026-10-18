import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  MapPin,
  Wrench,
  ShieldCheck,
  Sparkle,
  ArrowUpRight,
  CurrencyInr,
  UserCheck,
  DotsThreeVertical,
} from "@phosphor-icons/react";

/**
 * HomicoAppMock - Visual mock of Homico's platform UI.
 * Monochrome theme: zinc/white/black surfaces with soft semantic indicators for status.
 */
export default function HomicoAppMock({ isReducedMotion = false }) {
  const containerVariants = {
    hidden: { opacity: 0, y: isReducedMotion ? 0 : 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isReducedMotion ? 0.01 : 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: isReducedMotion ? 0 : 0.3,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full max-w-5xl [perspective:1400px]"
    >
      {/* Outer subtle glow behind mock */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-white/[0.04] opacity-50 blur-xl"
        aria-hidden="true"
      />

      {/* Main Mock Container */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-line bg-surface/95 shadow-soft-lg backdrop-blur-xl">
        {/* Mock Top App Bar */}
        <div className="flex h-11 items-center justify-between border-b border-line bg-surface-muted/60 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-zinc-600/80" />
            <div className="h-3 w-3 rounded-full bg-zinc-600/80" />
            <div className="h-3 w-3 rounded-full bg-zinc-600/80" />
            <span className="ml-3 hidden text-xs font-semibold text-ink-muted sm:inline">
              Homico Platform · Customer Portal Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300 border border-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Verified Network Active
            </span>
            <div className="h-4 w-px bg-line" />
            <span className="text-[11px] text-ink-faint">Bengaluru, IN</span>
          </div>
        </div>

        {/* Mock Inner Content Body */}
        <div className="p-4 md:p-7">
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left Column: Live Service Booking Card (7 cols) */}
            <div className="space-y-4 lg:col-span-7">
              <div className="rounded-2xl border border-line bg-surface p-4 md:p-5 shadow-soft-xs">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-muted text-ink">
                      <Wrench size={22} weight="duotone" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-ink md:text-base">
                          Plumbing Inspection &amp; Leakage Diagnosis
                        </h4>
                      </div>
                      <p className="text-xs text-ink-faint">
                        Booking #HMC-84291 · Confirmed
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-bold text-ink border border-line">
                    In Progress
                  </span>
                </div>

                {/* Stepper Progress Visualizer */}
                <div className="mt-5 rounded-xl border border-line bg-surface-muted/40 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-ink-muted">
                    <span>Booking Workflow</span>
                    <span className="font-semibold text-ink">Step 3 of 4: Quotation Ready</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="h-2 rounded-full bg-primary" />
                    <div className="h-2 rounded-full bg-primary" />
                    <div className="h-2 rounded-full bg-primary" />
                    <div className="h-2 rounded-full bg-line" />
                  </div>
                  <div className="mt-2.5 flex justify-between text-[10px] font-semibold text-ink-faint">
                    <span className="text-ink font-bold">1. Requested</span>
                    <span className="text-ink font-bold">2. Assigned</span>
                    <span className="text-ink font-bold">3. Inspected</span>
                    <span>4. Finished</span>
                  </div>
                </div>

                {/* Inspection Meta */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-muted">
                  <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted/50 p-2">
                    <CalendarCheck size={16} weight="duotone" className="text-ink" />
                    <span>Today, 11:00 - 13:00</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted/50 p-2">
                    <MapPin size={16} weight="duotone" className="text-ink" />
                    <span className="truncate">Indiranagar 100ft Rd</span>
                  </div>
                </div>

                {/* Quotation breakdown snippet */}
                <div className="mt-4 rounded-xl border border-line bg-surface-muted/60 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">Transparent Quotation Ready</span>
                    <span className="font-extrabold text-ink">₹640 total</span>
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-ink-muted">
                    <span>Labor &amp; Pipe Replacement</span>
                    <span className="font-semibold text-emerald-400">
                      Approval Needed
                    </span>
                  </div>
                </div>
              </div>

              {/* Technician Card */}
              <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-3.5 shadow-soft-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-muted font-bold text-ink text-xs">
                    RK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Rajesh Kumar</p>
                    <p className="text-[11px] text-ink-faint flex items-center gap-1">
                      <ShieldCheck size={12} weight="fill" className="text-emerald-400" />
                      Verified Service Professional
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                  Badge ID: #VD-402
                </div>
              </div>
            </div>

            {/* Right Column: Values & Quick Cards (5 cols) */}
            <div className="space-y-4 lg:col-span-5">
              {/* Flat 89 Pricing Card */}
              <div className="rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-muted p-5 shadow-soft-xs">
                <div className="flex items-center justify-between">
                  <span className="badge border border-line bg-surface-muted text-ink">
                    Honest Pricing
                  </span>
                  <CurrencyInr size={18} weight="bold" className="text-ink" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-ink">₹89</span>
                  <span className="ml-1 text-xs text-ink-muted">flat inspection visit</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  No hidden travel fees or surprise diagnosis costs. A pro inspects in-person before you decide.
                </p>
              </div>

              {/* Available Services Summary */}
              <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft-xs">
                <p className="text-xs font-bold text-ink mb-3">Popular Services Today</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-line bg-surface-muted/50 p-2">
                    <span className="text-ink">Electrical Wiring Check</span>
                    <span className="font-semibold text-ink">₹89 Visit</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line bg-surface-muted/50 p-2">
                    <span className="text-ink">AC Deep Clean &amp; Service</span>
                    <span className="font-semibold text-ink">₹89 Visit</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-line bg-surface-muted/50 p-2">
                    <span className="text-ink">Masonry &amp; Wall Repair</span>
                    <span className="font-semibold text-ink">₹89 Visit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
