import { motion } from "framer-motion";
import { fadeUp, STAGGER, DUR, EASE } from "../motion/config.js";

/**
 * Reveal — wraps children in a fade-up whileInView animation.
 * Pass `stagger` prop to animate children with staggered delays.
 *
 * Props:
 *   delay     — number (initial delay in seconds)
 *   stagger   — boolean (stagger direct children)
 *   as        — element type to render (default "div")
 */
export default function Reveal({ children, delay = 0, stagger = false, as = "div", className = "", ...props }) {
  const MotionEl = motion[as] ?? motion.div;

  if (stagger) {
    return (
      <MotionEl
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: STAGGER.normal, delayChildren: delay } },
        }}
        {...props}
      >
        {children}
      </MotionEl>
    );
  }

  return (
    <MotionEl
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      transition={{ duration: DUR.md, ease: EASE.out, delay }}
      {...props}
    >
      {children}
    </MotionEl>
  );
}

/** Single child item for use inside a stagger Reveal. */
export function RevealItem({ children, className = "", ...props }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      transition={{ duration: DUR.md, ease: EASE.out }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

