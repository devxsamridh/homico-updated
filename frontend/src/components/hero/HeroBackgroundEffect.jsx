/**
 * HeroBackgroundEffect
 * Monochrome background effect: faint white/grey radial spotlight & subtle mesh grid.
 * Spectrum motion is paused by the parent hero's shared simplified-mode state.
 */
export default function HeroBackgroundEffect() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="spectrum-aurora spectrum-aurora-one" />
      <div className="spectrum-aurora spectrum-aurora-two" />
      <div className="spectrum-aurora spectrum-aurora-three" />
      <div className="spectrum-grain" />

      {/* Top center subtle radial spotlight (low opacity white on black) */}
      <div
        className="absolute left-1/2 top-[-10%] h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.08] dark:opacity-[0.07] blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, white 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%)",
        }}
      />

      {/* Modern subtle monochrome grid pattern */}
      <svg
        className="absolute inset-0 h-full w-full stroke-ink/[0.04] [mask-image:radial-gradient(100%_100%_at_top_center,white_30%,transparent_90%)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 48V.5H48" fill="none" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
      </svg>

      {/* Bottom fade into section border */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
