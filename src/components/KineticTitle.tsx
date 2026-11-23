"use client";

import { motion } from "motion/react";

/** A heading whose words rise out of a mask, one after another. The full text stays on the element for assistive tech. */
export function KineticTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-top" style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
          <motion.span
            className="inline-block"
            initial={{ y: "115%", rotate: 5 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 19, delay: 0.1 + i * 0.045 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
