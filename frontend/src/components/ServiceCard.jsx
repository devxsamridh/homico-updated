import { motion } from "framer-motion";
import { scaleIn } from "../motion/config.js";

/**
 * Generic service card — token-based, monochrome zinc tones.
 * Accepts either an icon component (`icon` prop) or a Phosphor icon element.
 */
export default function ServiceCard({ icon: Icon, title, description, onClick }) {
  return (
    <motion.div
      variants={scaleIn}
      className={`card-surface flex flex-col gap-3 p-5 transition-all duration-200 ease-smooth ${
        onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-soft-md hover:border-ink/30" : ""
      }`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick(e) : undefined}
    >
      {/* Icon tile: monochrome zinc surface with line border */}
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface-muted text-ink">
        {Icon ? <Icon className="h-5 w-5" size={20} weight="duotone" /> : null}
      </div>

      <div>
        <h3 className="font-semibold text-ink leading-snug">{title}</h3>
        <p className="mt-1 text-sm text-ink-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
