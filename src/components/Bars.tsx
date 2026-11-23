"use client";

import { motion } from "motion/react";

/**
 * Comparison bars cut from paper. Bars grow from the left when scrolled into view. One bar can be
 * highlighted. Only use numbers that come from a cited source, and say which in `caption`.
 */
export function Bars({
  items,
  unit = "",
  caption,
  max,
  highlight,
}: {
  items: { label: string; value: number; note?: string }[];
  unit?: string;
  caption: string;
  max?: number;
  /** index of the bar to emphasise */
  highlight?: number;
}) {
  const top = max ?? Math.max(...items.map((i) => i.value));
  return (
    <figure className="fig wide m-0">
      <motion.ul
        className="bars"
        aria-label={caption}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
      >
        {items.map((it, i) => (
          <li key={it.label} className="bar-row">
            <span className="bar-label">
              {it.label}
              {it.note && <small>{it.note}</small>}
            </span>
            <span className="bar-track" aria-hidden>
              <motion.span
                className="bar-fill"
                style={{ "--w": `${Math.max(2, (it.value / top) * 100)}%`, "--c": i === highlight ? "var(--persimmon)" : "var(--sun)" } as React.CSSProperties}
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { type: "spring", stiffness: 120, damping: 20 } } }}
              />
            </span>
            <span className="bar-val">
              {it.value.toLocaleString("en-IN")}
              {unit && <span className="bar-unit"> {unit}</span>}
            </span>
          </li>
        ))}
      </motion.ul>
      <figcaption className="fig-cap">{caption}</figcaption>
    </figure>
  );
}
