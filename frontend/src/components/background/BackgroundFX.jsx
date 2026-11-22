import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../../context/MotionPreferenceContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import BackgroundControl from "./BackgroundControl.jsx";
import "./background-fx.css";

const PAUSE_STORAGE_KEY = "homico.bgfx.paused";
const MOTION_OVERRIDE_STORAGE_KEY = "homico.bgfx.motion-opt-in";

function readStoredPreference(key) {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch (error) {
    console.warn("Could not read the background animation preference.", error);
    return false;
  }
}

function readBackgroundPreferences() {
  return {
    isPaused: readStoredPreference(PAUSE_STORAGE_KEY),
    isMotionOverride: readStoredPreference(MOTION_OVERRIDE_STORAGE_KEY),
  };
}

function writeStoredPreference(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch (error) {
    console.warn("Could not save the background animation preference.", error);
  }
}

const HOUSES = [
  [180, 190],
  [410, 300],
  [650, 150],
  [850, 330],
  [1120, 170],
  [1410, 290],
  [300, 610],
  [600, 760],
  [980, 620],
  [1320, 790],
];

const SIGNALS = [
  [180, 190, 410, 300, "lavender"],
  [410, 300, 650, 150, "pink"],
  [650, 150, 850, 330, "amber"],
  [850, 330, 1120, 170, "lavender"],
  [1120, 170, 1410, 290, "pink"],
  [410, 300, 600, 760, "amber"],
  [600, 760, 980, 620, "lavender"],
  [980, 620, 1320, 790, "pink"],
];

export default function BackgroundFX() {
  const layerRef = useRef(null);
  const { isSimplified, isReducedMotion } = useMotionPreference();
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState(readBackgroundPreferences);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isArtReady, setIsArtReady] = useState(false);
  const { isPaused, isMotionOverride } = preferences;
  const isStatic =
    isSimplified ||
    theme !== "dark" ||
    (isReducedMotion && !isMotionOverride);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  useEffect(() => {
    writeStoredPreference(PAUSE_STORAGE_KEY, isPaused);
    writeStoredPreference(MOTION_OVERRIDE_STORAGE_KEY, isMotionOverride);
  }, [isMotionOverride, isPaused]);

  useEffect(() => {
    let idleHandle;
    const fallbackHandle = window.setTimeout(() => setIsArtReady(true), 150);
    const mountArt = () => {
      window.clearTimeout(fallbackHandle);
      setIsArtReady(true);
    };

    if (window.requestIdleCallback) {
      idleHandle = window.requestIdleCallback(mountArt, { timeout: 1200 });
    }

    return () => {
      if (idleHandle !== undefined && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleHandle);
      }
      window.clearTimeout(fallbackHandle);
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;

    let frame = 0;
    const updateProgress = () => {
      if (isPausedRef.current || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (isPausedRef.current) return;
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          scrollableHeight > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
            : 0;

        layer.style.setProperty("--fx-p", progress.toFixed(3));
        layer.style.setProperty(
          "--fx-stage-top",
          Math.max(0.45, 1 - progress).toFixed(3)
        );
        layer.style.setProperty(
          "--fx-stage-middle",
          Math.max(0.65, 1 - Math.abs(progress - 0.5) * 2).toFixed(3)
        );
        layer.style.setProperty(
          "--fx-stage-bottom",
          Math.max(0.75, progress).toFixed(3)
        );
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isPaused]);

  useEffect(() => {
    const updateVisibility = () =>
      setIsTabHidden(document.visibilityState === "hidden");

    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const handleControlToggle = () => {
    if (isReducedMotion && !isMotionOverride) {
      setPreferences({ isPaused: false, isMotionOverride: true });
      return;
    }

    setPreferences((current) => ({
      isPaused: !current.isPaused,
      isMotionOverride:
        isReducedMotion && !current.isPaused
          ? false
          : isReducedMotion || current.isMotionOverride,
    }));
  };

  return (
    <>
      <div
        ref={layerRef}
        className="background-fx pointer-events-none fixed inset-0 z-0 overflow-hidden"
        data-static={isStatic ? "true" : undefined}
        data-paused={isPaused ? "true" : undefined}
        data-hidden={isTabHidden ? "true" : undefined}
        data-light={theme !== "dark" ? "true" : undefined}
        data-motion-override={
          isMotionOverride &&
          isReducedMotion &&
          !isPaused &&
          !isStatic &&
          !isTabHidden
            ? "true"
            : undefined
        }
        aria-hidden="true"
      >
        <div className="background-fx__tint" />
        <div className="background-fx__blob background-fx__blob--violet" />
        <div className="background-fx__blob background-fx__blob--lavender" />
        <div className="background-fx__blob background-fx__blob--pink" />
        <div className="background-fx__blob background-fx__blob--pink-secondary" />
        <div className="background-fx__blob background-fx__blob--amber" />
        <div className="background-fx__conic" />
        <div className="background-fx__horizon" />

        {isArtReady && (
          <div className="background-fx__art">
            <svg
              className="background-fx__ribbons"
              viewBox="0 0 1600 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="fx-ribbon-fill" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#16141f" />
                  <stop offset=".52" stopColor="#221f31" />
                  <stop offset="1" stopColor="#34304a" />
                </linearGradient>
                <linearGradient id="fx-ribbon-metal" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#e9e2ff" stopOpacity=".04" />
                  <stop offset=".5" stopColor="#e9e2ff" stopOpacity=".22" />
                  <stop offset="1" stopColor="#e9e2ff" stopOpacity=".035" />
                </linearGradient>
                <linearGradient id="fx-ribbon-mask" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="white" />
                  <stop offset=".7" stopColor="white" stopOpacity=".8" />
                  <stop offset="1" stopColor="black" stopOpacity="0" />
                </linearGradient>
                <mask id="fx-ribbon-fade">
                  <rect width="100%" height="100%" fill="url(#fx-ribbon-mask)" />
                </mask>
              </defs>
              <g
                fill="none"
                stroke="url(#fx-ribbon-fill)"
                strokeWidth="32"
                mask="url(#fx-ribbon-fade)"
              >
                <path d="M-320 60 510 760" />
                <path d="M-170 -120 760 670" />
                <path d="M130 -180 1010 570" />
                <path d="M490 -210 1350 520" />
                <path d="M1580 -80 670 570" />
                <path d="M1790 80 810 780" />
                <path d="M1510 280 770 820" />
                <path d="M1390 470 760 920" />
              </g>
              <g
                fill="none"
                stroke="url(#fx-ribbon-metal)"
                strokeWidth="1.5"
                mask="url(#fx-ribbon-fade)"
              >
                <path d="M-320 60 510 760" />
                <path d="M-170 -120 760 670" />
                <path d="M130 -180 1010 570" />
                <path d="M490 -210 1350 520" />
                <path d="M1580 -80 670 570" />
                <path d="M1790 80 810 780" />
                <path d="M1510 280 770 820" />
                <path d="M1390 470 760 920" />
              </g>
            </svg>

            <div className="background-fx__sheen" />
            <div className="background-fx__weave" />
            <div className="background-fx__brushed" />

            <svg
              className="background-fx__blueprint"
              viewBox="0 0 1600 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="fx-blueprint-grid"
                  width="48"
                  height="48"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M.5 48V.5H48" fill="none" />
                </pattern>
                <linearGradient id="fx-blueprint-fade" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="white" stopOpacity=".75" />
                  <stop offset=".72" stopColor="white" stopOpacity=".65" />
                  <stop offset="1" stopColor="black" stopOpacity="0" />
                </linearGradient>
                <mask id="fx-blueprint-mask">
                  <rect width="100%" height="100%" fill="url(#fx-blueprint-fade)" />
                </mask>
                <g id="fx-house" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="m-7 0 7-6 7 6v8h-14z" />
                  <path d="M-2 8V3h4v5" />
                </g>
              </defs>
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                mask="url(#fx-blueprint-mask)"
              >
                <rect width="100%" height="100%" fill="url(#fx-blueprint-grid)" />
                <path d="M180 190 410 300 650 150 850 330 1120 170 1410 290" />
                <path d="M410 300 600 760 980 620 1320 790" />
                <path
                  className="background-fx__floor-plan background-fx__floor-plan--1"
                  d="m290 455 88-56 94 52v102H290z M318 455v-48h76v48 M318 502h26v51"
                />
                <path
                  className="background-fx__floor-plan background-fx__floor-plan--2"
                  d="m790 500 112-66 110 64v122H790z M824 498v-40h64v40 M824 554h34v66"
                />
                <path
                  className="background-fx__floor-plan background-fx__floor-plan--3"
                  d="m1180 450 90-54 92 53v102h-182z M1208 450v-38h62v38 M1208 504h28v47"
                />
                {HOUSES.map(([x, y], index) => (
                  <use
                    key={`${x}-${y}`}
                    href="#fx-house"
                    x={x}
                    y={y}
                    className={`background-fx__house background-fx__house--${index % 4}`}
                  />
                ))}
              </g>
            </svg>

            <div className="background-fx__signals">
              {SIGNALS.map(([x1, y1, x2, y2, color], index) => (
                <span
                  key={`${x1}-${y1}-${x2}-${y2}`}
                  className={`background-fx__signal background-fx__signal--${color}`}
                  style={{
                    left: `${x1 / 16}%`,
                    top: `${y1 / 10}%`,
                    "--fx-signal-dx": `${(x2 - x1) / 16}vw`,
                    "--fx-signal-dy": `${(y2 - y1) / 10}vh`,
                    animationDelay: `${-index * 0.8}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="background-fx__grain" />
        <div className="background-fx__vignette" />
      </div>
      <BackgroundControl
        isPaused={isPaused}
        isReducedMotion={isReducedMotion}
        isMotionOverride={isMotionOverride}
        onToggle={handleControlToggle}
        isVisible={!isSimplified && theme === "dark"}
      />
    </>
  );
}
