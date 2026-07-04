"use client";

import { useReducedMotion } from "framer-motion";

// ease-out-expo, calm not bouncy
export const EASE = [0.16, 1, 0.3, 1]; 
export const DURATION = { fast: 0.15, base: 0.25, slow: 0.4 };

// Standard transition to use across the app
export const TRANSITION = {
  ease: EASE,
  duration: DURATION.base,
};

export const TRANSITION_FAST = {
  ease: EASE,
  duration: DURATION.fast,
};

export const TRANSITION_SLOW = {
  ease: EASE,
  duration: DURATION.slow,
};

/**
 * Helper hook to retrieve standard motion variants that respect prefers-reduced-motion.
 * It simply returns opacity-only (or instant) variants if reduced motion is enabled.
 */
export function useMotionConfig() {
  const shouldReduceMotion = useReducedMotion();

  return {
    shouldReduceMotion,
    // Variants for entering/exiting items (e.g., task rows)
    itemVariants: {
      initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 },
      animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
      exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 },
    },
    // Page-level transition variants (fade only)
    pageVariants: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  };
}
