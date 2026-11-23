"use client";

import { motion } from "motion/react";

const PAPERS = ["var(--sun)", "var(--blush)", "var(--leaf)", "var(--persimmon)"];

/** A left-to-right (or top-to-bottom on phones) process. Paper nodes drop in, dashed connectors march. */
export function Flow({ steps, caption }: { steps: { label: string; note?: string }[]; caption?: string }) {
  return (
    <figure className="fig wide m-0">
      <motion.ol
        className="flow"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.16 } } }}
      >
        {steps.map((s, i) => (
          <motion.li
            key={s.label}
            className="flow-node"
            style={{ "--n": PAPERS[i % PAPERS.length] } as React.CSSProperties}
            variants={{
              hidden: { opacity: 0, y: -28, rotate: -5, scale: 0.9 },
              show: { opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2, scale: 1, transition: { type: "spring", stiffness: 210, damping: 14 } },
            }}
          >
            <b>{s.label}</b>
            {s.note && <span>{s.note}</span>}
          </motion.li>
        ))}
      </motion.ol>
      {caption && <figcaption className="mt-5 text-sm text-ink-2">{caption}</figcaption>}
    </figure>
  );
}
