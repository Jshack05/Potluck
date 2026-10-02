// Adapted from Aceternity UI's Container Scroll Animation.
// Original registry snapshot and license/source links: vendor/ and THIRD_PARTY_NOTICES.md.
// Potluck changes: gentle ranges, intrinsic sizing, no scroll trap, reduced-motion support.
import { useRef, type ReactNode } from "react";
import { useHydrated } from "./useHydrated";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export function AceternityScroll({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 0.45, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.96, 1, 0.99]);
  const translate = useTransform(scrollYProgress, [0, 0.45, 1], [24, 0, -12]);

  return (
    <div ref={containerRef} className="aceternity-scroll">
      <motion.div
        className="scroll-surface"
        style={
          !hydrated || reduceMotion
            ? undefined
            : { rotateX: rotate, scale, y: translate }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
