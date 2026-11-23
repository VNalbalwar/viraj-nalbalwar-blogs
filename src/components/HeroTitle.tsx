"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const LETTERS = Array.from(site.name);
const TILES = [
  { bg: "var(--persimmon)", fg: "#181716" },
  { bg: "var(--sun)", fg: "#181716" },
  { bg: "var(--leaf)", fg: "#181716" },
  { bg: "var(--blush)", fg: "#181716" },
  { bg: "var(--pine)", fg: "#faf9f7" },
];
const ROT = [-4, 3, -2, 5, -5, 2, -3, 4, -2, 3];
const CLIPS = [
  "polygon(1% 3%, 99% 0, 100% 97%, 0 100%)",
  "polygon(0 1%, 98% 3%, 100% 100%, 2% 97%)",
  "polygon(2% 0, 100% 2%, 97% 100%, 0 96%)",
  "polygon(0 4%, 100% 0, 99% 99%, 3% 100%)",
  "polygon(3% 2%, 98% 0, 100% 98%, 0 100%)",
  "polygon(0 0, 97% 4%, 100% 100%, 1% 96%)",
  "polygon(2% 3%, 100% 0, 98% 100%, 0 97%)",
];

/**
 * The site name as paper tiles. On load they are tossed in with a spring, one after another.
 * Pointer proximity lifts and turns a tile; a click re-colours it.
 */
export function HeroTitle() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState(() => LETTERS.map((_, i) => i % TILES.length));
  const [near, setNear] = useState<boolean[]>(() => LETTERS.map(() => false));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const tiles = wrapRef.current?.querySelectorAll<HTMLElement>(".tile");
    if (!tiles) return;
    const next = Array.from(tiles).map((t) => {
      const r = t.getBoundingClientRect();
      return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < r.width * 0.95;
    });
    setNear((prev) => (prev.every((v, i) => v === next[i]) ? prev : next));
  }
  function onLeave() {
    setNear((prev) => (prev.some(Boolean) ? LETTERS.map(() => false) : prev));
  }
  function recolor(i: number) {
    setColors((c) => c.map((v, j) => (j === i ? (v + 1) % TILES.length : v)));
  }

  return (
    <h1 aria-label={site.name} className="m-0">
      <div ref={wrapRef} className="tiles" onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden>
        {LETTERS.map((ch, i) => {
          const c = TILES[colors[i]];
          const rot = ROT[i % ROT.length];
          return (
            <motion.span
              key={i}
              className="tile"
              role="presentation"
              onClick={() => recolor(i)}
              initial={{ y: -260, rotate: rot - 40, opacity: 0 }}
              animate={{ y: near[i] ? -16 : 0, rotate: near[i] ? rot * -1.8 : rot, scale: near[i] ? 1.07 : 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: near[i] || settled ? 420 : 170,
                damping: near[i] || settled ? 16 : 11,
                delay: settled ? 0 : 0.15 + i * 0.07,
              }}
              style={{ "--tile-bg": c.bg, "--tile-fg": c.fg, clipPath: CLIPS[i % CLIPS.length] } as React.CSSProperties}
            >
              <span
                className="tile-boil"
                style={{ "--dur": `${1 + (i % 3) * 0.17}s`, "--delay": `${-i * 0.23}s` } as React.CSSProperties}
              >
                {ch}
              </span>
            </motion.span>
          );
        })}
      </div>
    </h1>
  );
}
