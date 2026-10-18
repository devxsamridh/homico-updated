import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  Envelope,
  CheckCircle,
  ClockCountdown,
  Wrench,
  UserCheck,
  ClipboardText,
  Hammer,
} from "@phosphor-icons/react";
import Reveal, { RevealItem } from "../components/Reveal.jsx";
import { SUPPORT_EMAIL } from "../config/site.js";

/* ── FAQ data ── */
const FAQS = [
  {
    q: "How do I book a service?",
    a: "Go to the Services page, choose a category, then fill out the booking form with your preferred date, time slot, and address. You'll receive a confirmation on your Dashboard.",
  },
  {
    q: "What happens after I book?",
    a: "A verified professional visits your home for a ₹89 flat-rate inspection. After the visit, you'll receive a transparent, itemised quotation covering labour and materials.",
  },
  {
    q: "How much does the inspection cost?",
    a: "The site inspection visit costs a flat ₹89 — regardless of what service you choose. There are no hidden fees. If you decide not to proceed after the quotation, you only pay the ₹89.",
  },
  {
    q: "Can I see the quotation before work begins?",
    a: "Yes. After inspection, you'll see a detailed quotation on your Dashboard with a breakdown of labour and material costs. You can accept or decline — work only starts after your approval.",
  },
  {
    q: "How do I view my booking status?",
    a: "Log in and go to your Dashboard. Each booking shows a step-by-step progress tracker so you always know where things stand.",
  },
  {
    q: "What are the possible booking statuses?",
    a: 'Bookings move through: Requested → Vendor Assigned → Inspected → Quote Ready → In Progress → Finished (or Cancelled at any point before work begins).',
  },
  {
    q: "Can I cancel a booking?",
    a: "Please email us at support.homico@gmail.com with your booking ID to request a cancellation before work has started.",
  },
  {
    q: "How do I enquire about raw materials?",
    a: "Visit the Materials page to browse available items. Click 'Enquire' on any item to open a pre-filled email to our team. We'll respond with availability and delivery details.",
  },
  {
    q: "Is there online payment?",
    a: "Not yet. Payment arrangements are handled directly with the professional after the quotation is approved. Contact us at support.homico@gmail.com for any payment queries.",
  },
  {
    q: "I found a bug or have feedback — how do I report it?",
    a: `Email us at ${SUPPORT_EMAIL} with a description of the issue and any screenshots. We read every email.`,
  },
];

/* Status guide */
const STATUS_GUIDE = [
  { icon: CheckCircle,   label: "Requested",       desc: "Your booking has been submitted and is awaiting confirmation.",   tone: "text-zinc-400" },
  { icon: UserCheck,     label: "Vendor Assigned",  desc: "A verified professional has been assigned to your request.",      tone: "text-zinc-400" },
  { icon: MagnifyingGlass,label:"Inspected",        desc: "The professional has completed the site inspection visit.",        tone: "text-zinc-400" },
  { icon: ClipboardText, label: "Quote Ready",      desc: "A detailed quotation is waiting for your review on the Dashboard.",tone: "text-amber-400" },
  { icon: Hammer,        label: "In Progress",      desc: "You have approved the quote and work has begun.",                  tone: "text-zinc-400" },
  { icon: CheckCircle,   label: "Finished",         desc: "The job is complete.",                                             tone: "text-emerald-400" },
];

/* ── FAQ Accordion item ── */
function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-border-muted last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className="shrink-0 text-ink-faint">
          {isOpen ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-ink-muted leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Page ── */
export default function HelpDeskPage() {
  const [search, setSearch]   = useState("");
  const [openIdx, setOpenIdx] = useState(null);

  const filtered = FAQS.filter(
    (f) =>
      search.trim() === "" ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  /* Pre-fill mailto body */
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=Homico%20Support%20Request&body=Hi%20Homico%20Team%2C%0A%0APlease%20describe%20your%20issue%20here%3A%0A%0A`;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Header */}
      <Reveal className="text-center">
        <span className="badge border border-primary/30 bg-primary/10 text-primary dark:bg-primary/20">
          Help & Support
        </span>
        <h1 className="mt-4 text-display font-extrabold text-ink">
          How can we <span className="text-spectrum">help you?</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-muted">
          Browse frequently asked questions below, check the booking status guide, or email us directly.
        </p>

        {/* Search */}
        <div className="relative mx-auto mt-8 max-w-lg">
          <MagnifyingGlass
            size={18}
            weight="duotone"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="input-base pl-11 shadow-soft"
            aria-label="Search frequently asked questions"
          />
        </div>
      </Reveal>

      <div className="mt-16 grid gap-10 lg:grid-cols-3">
        {/* ── FAQ Accordion ── */}
        <section className="lg:col-span-2" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-6 text-heading font-bold text-ink">
            Frequently Asked Questions
          </h2>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-muted p-10 text-center">
              <p className="text-ink-muted">No questions match "{search}".</p>
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm font-medium text-primary hover:underline focus-visible:outline-none"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="card-surface px-6 py-2">
              {filtered.map((faq, i) => (
                <FaqItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openIdx === i}
                  onClick={() => toggle(i)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-6">
          {/* Contact card */}
          <Reveal delay={0.1}>
            <div className="card-surface p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                <Envelope size={22} weight="duotone" />
              </div>
              <h3 className="mt-4 font-bold text-ink">Email Support</h3>
              <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                Can't find what you need? Send us an email and we'll get back to you.
              </p>
              <a
                href={mailtoHref}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:bg-primary-strong hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Envelope size={16} weight="duotone" />
                Email us
              </a>
              <p className="mt-3 text-center text-xs text-ink-faint">
                Opens your default mail app
              </p>
            </div>
          </Reveal>

          {/* Inspection fact */}
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 dark:bg-primary/10">
              <p className="text-sm font-semibold text-ink">₹89 Flat Inspection</p>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Every booking starts with a flat-rate site visit. You only commit to work after you've seen and approved the quotation.
              </p>
            </div>
          </Reveal>
        </aside>
      </div>

      {/* ── Booking Status Guide ── */}
      <section className="mt-16" aria-labelledby="status-heading">
        <Reveal>
          <h2 id="status-heading" className="mb-8 text-heading font-bold text-ink">
            Understanding your booking status
          </h2>
        </Reveal>
        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATUS_GUIDE.map((s) => (
            <RevealItem key={s.label}>
              <div className="card-surface flex items-start gap-4 p-5">
                <s.icon size={22} weight="duotone" className={`mt-0.5 shrink-0 ${s.tone}`} />
                <div>
                  <p className="font-semibold text-ink text-sm">{s.label}</p>
                  <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </section>
    </div>
  );
}

