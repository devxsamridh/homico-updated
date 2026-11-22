import { createContext, useContext, useEffect, useMemo, useState } from "react";

const MotionPreferenceContext = createContext(null);

export function MotionPreferenceProvider({ children }) {
  const [isSimplified, setIsSimplified] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = (event) => setIsReducedMotion(event.matches);

    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  const value = useMemo(
    () => ({
      isSimplified,
      isReducedMotion,
      toggleSimplified: () => setIsSimplified((current) => !current),
    }),
    [isSimplified, isReducedMotion]
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference() {
  const context = useContext(MotionPreferenceContext);
  if (!context) {
    throw new Error(
      "useMotionPreference must be used within a MotionPreferenceProvider"
    );
  }
  return context;
}
