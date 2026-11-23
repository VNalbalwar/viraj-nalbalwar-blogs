"use client";

import { motion } from "motion/react";

type Tone = "sun" | "persimmon" | "leaf" | "blush" | "pine";
const ORDER: Tone[] = ["sun", "blush", "leaf", "persimmon", "pine"];

/**
 * Layers of paper laid on top of each other, first item on top. For architectures, protocol
 * stacks, privilege levels, anything that is "this sits on that". Layers slide in from alternating
 * sides, one after another. `caption` is required.
 */
export function Stack({ layers, caption }: { layers: { label: string; note?: string; tone?: Tone }[]; caption: string }) {
  return (
    <figure className="fig wide m-0">
      <motion.ol
        className="stack"
        aria-label={caption}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
      >
        {layers.map((l, i) => {
          const tone = l.tone ?? ORDER[i % ORDER.length];
          return (
            <motion.li
              key={l.label}
              className="stack-layer"
              style={{ "--n": `var(--${tone})`, color: tone === "pine" ? "#faf9f7" : "#181716", zIndex: layers.length - i } as React.CSSProperties}
              variants={{
                hidden: { opacity: 0, x: i % 2 ? 70 : -70, rotate: i % 2 ? 2.5 : -2.5 },
                show: { opacity: 1, x: 0, rotate: i % 2 ? 0.7 : -0.7, transition: { type: "spring", stiffness: 190, damping: 17 } },
              }}
              whileHover={{ x: i % 2 ? -8 : 8 }}
            >
              <b>{l.label}</b>
              {l.note && <span>{l.note}</span>}
            </motion.li>
          );
        })}
      </motion.ol>
      <figcaption className="fig-cap">{caption}</figcaption>
    </figure>
  );
}
