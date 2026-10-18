import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

/**
 * AnimatedPill - Monochrome pill badge with subtle hover transition.
 */
export default function AnimatedPill({
  text = "Your complete home ecosystem",
  badge = "Platform",
  href,
  className = "",
  isReducedMotion = false,
}) {
  const content = (
    <div
      className={`spectrum-pill group relative inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-semibold text-ink shadow-soft-xs backdrop-blur-md transition-all duration-300 hover:border-ink/30 hover:bg-surface hover:shadow-soft md:text-sm ${className}`}
    >
      {badge && (
        <span className="spectrum-pill-badge flex items-center rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink border border-line">
          {badge}
        </span>
      )}
      <span className="text-ink-muted transition-colors group-hover:text-ink">
        {text}
      </span>
      <ArrowRight
        size={14}
        weight="bold"
        className="text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ink"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: isReducedMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isReducedMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {href ? (
        <a href={href} className="inline-block focus-visible:outline-none">
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
}
