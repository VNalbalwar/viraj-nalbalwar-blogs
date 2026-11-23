"use client";

import { motion } from "motion/react";
import { useRef } from "react";

const SCRAPS = [
  { w: 124, h: 100, left: "4%", top: "8%", bg: "var(--persimmon)", clip: "polygon(8% 0, 100% 12%, 90% 100%, 0 82%)", r: -8 },
  { w: 100, h: 100, left: "38%", top: "2%", bg: "var(--sun)", clip: "polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)", r: 6 },
  { w: 160, h: 42, left: "46%", top: "50%", bg: "var(--blush)", clip: "polygon(0 14%, 100% 0, 98% 86%, 2% 100%)", r: -12 },
  { w: 86, h: 86, left: "14%", top: "54%", bg: "var(--leaf)", clip: "polygon(30% 0, 100% 20%, 70% 100%, 0 70%)", r: 14 },
  { w: 72, h: 72, left: "76%", top: "8%", bg: "var(--pine)", clip: "polygon(0 0, 100% 30%, 60% 100%)", r: -4 },
  { w: 64, h: 64, left: "72%", top: "62%", bg: "var(--sun)", clip: "polygon(50% 0, 88% 14%, 100% 52%, 80% 92%, 34% 100%, 4% 70%, 10% 24%)", r: 0 },
];

/** Loose scraps on a cutting table. Drag them; they carry on a little and settle. */
export function Scraps() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={ref} className="relative h-60 w-full lg:h-72" role="group" aria-label="Paper scraps you can drag around">
        {SCRAPS.map((s, i) => (
          <motion.div
            key={i}
            className="scrap"
            style={{ left: s.left, top: s.top, width: s.w, height: s.h, rotate: s.r, filter: "var(--shadow-paper)" }}
            initial={{ opacity: 0, scale: 0.5, y: 60, rotate: s.r + 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: s.r }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 180, damping: 13, delay: 0.5 + i * 0.08 }}
            drag
            dragConstraints={ref}
            dragElastic={0.18}
            dragTransition={{ bounceStiffness: 320, bounceDamping: 16, power: 0.35 }}
            whileHover={{ rotate: s.r + 7 }}
            whileDrag={{ scale: 1.1, rotate: s.r - 6, zIndex: 5 }}
          >
            <div style={{ background: s.bg, clipPath: s.clip }} />
          </motion.div>
        ))}
      </div>
      <p className="t-meta m-0 mt-2" aria-hidden>
        Scraps from the cutting table. Pick one up.
      </p>
    </div>
  );
}
