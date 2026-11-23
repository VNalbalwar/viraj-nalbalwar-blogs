"use client";

import { motion } from "motion/react";

const ORDER = ["sun", "persimmon", "leaf", "blush", "pine"];

/** A dashed paper tape with a notch per event, oldest first. Events slide in one by one. `caption` is required. */
export function Timeline({ events, caption }: { events: { date: string; label: string; note?: string }[]; caption: string }) {
  return (
    <figure className="fig wide m-0">
      <motion.ol
        className="tl"
        aria-label={caption}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
      >
        {events.map((e, i) => (
          <motion.li
            key={`${e.date}-${e.label}`}
            className="tl-item"
            style={{ "--n": `var(--${ORDER[i % ORDER.length]})` } as React.CSSProperties}
            variants={{ hidden: { opacity: 0, x: -36 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } } }}
          >
            <span className="tl-date">{e.date}</span>
            <span className="tl-label">{e.label}</span>
            {e.note && <span className="tl-note">{e.note}</span>}
          </motion.li>
        ))}
      </motion.ol>
      <figcaption className="fig-cap">{caption}</figcaption>
    </figure>
  );
}
