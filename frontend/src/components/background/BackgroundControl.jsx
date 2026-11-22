import { Pause, Play } from "@phosphor-icons/react";
import { IconButton } from "../Button.jsx";

export default function BackgroundControl({
  isPaused,
  isReducedMotion,
  isMotionOverride,
  onToggle,
  isVisible,
}) {
  if (!isVisible) return null;

  const isPlaying = !isPaused && (!isReducedMotion || isMotionOverride);
  const Icon = isPlaying ? Pause : Play;
  const label = isPlaying ? "Pause background animation" : "Play background animation";

  return (
    <IconButton
      type="button"
      size="sm"
      variant="secondary"
      className="bg-surface/70 text-ink shadow-soft backdrop-blur-md"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "1rem",
        zIndex: 60,
        width: "40px",
        height: "40px",
        minWidth: "40px",
        minHeight: "40px",
      }}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={isPlaying}
      title={
        isReducedMotion
          ? "Animations are reduced by your system settings."
          : label
      }
    >
      <Icon size={18} weight="bold" />
    </IconButton>
  );
}
