/** Shared motion constants — keeps animations consistent across the app. */

export const EASE = {
  out: [0.0, 0.0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 400, damping: 30 },
};

export const DUR = {
  xs: 0.15,
  sm: 0.2,
  md: 0.3,
  lg: 0.45,
  xl: 0.6,
};

export const STAGGER = {
  fast: 0.06,
  normal: 0.1,
  slow: 0.15,
};

/** Standard fade-up variant for Reveal components. */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/** Standard fade-in variant. */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Scale-in variant for cards. */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

