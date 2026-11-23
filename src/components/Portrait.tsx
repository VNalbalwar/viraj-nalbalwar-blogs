"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { author } from "@/content/author";

const PIECES = [
  { color: "var(--persimmon)", clip: "polygon(6% 0, 100% 10%, 92% 100%, 0 86%)", style: { left: "-6%", top: "6%", width: "58%", height: "52%" }, r: -9, from: { x: -60, y: -40 } },
  { color: "var(--sun)", clip: "polygon(0 14%, 88% 0, 100% 78%, 18% 100%)", style: { right: "-7%", top: "-4%", width: "46%", height: "44%" }, r: 8, from: { x: 60, y: -50 } },
  { color: "var(--pine)", clip: "polygon(10% 0, 100% 18%, 80% 100%, 0 70%)", style: { right: "-5%", bottom: "4%", width: "50%", height: "46%" }, r: -6, from: { x: 70, y: 50 } },
  { color: "var(--blush)", clip: "polygon(0 8%, 96% 0, 100% 90%, 8% 100%)", style: { left: "-4%", bottom: "-3%", width: "40%", height: "30%" }, r: 7, from: { x: -60, y: 50 } },
];

/**
 * The author's photo, cut out with scissors and pasted onto coloured paper. Pieces spring in
 * when it scrolls into view, and settle apart a little on hover.
 */
export function Portrait({ size = "lg", priority = false }: { size?: "lg" | "sm"; priority?: boolean }) {
  if (size === "sm") {
    return (
      <div className="portrait-sm" aria-hidden={false}>
        <div className="portrait-sm-bg" />
        <Image src={author.photo} alt={author.photoAlt} width={160} height={160} className="portrait-sm-img" sizes="72px" />
      </div>
    );
  }
  return (
    <motion.div className="portrait" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}>
      {PIECES.map((p, i) => (
        <motion.div
          key={i}
          className="portrait-piece"
          style={{ ...p.style, filter: "var(--shadow-paper)" }}
          variants={{
            hidden: { opacity: 0, x: p.from.x, y: p.from.y, rotate: p.r * 4, scale: 0.7 },
            show: { opacity: 1, x: 0, y: 0, rotate: p.r, scale: 1, transition: { type: "spring", stiffness: 150, damping: 14 } },
          }}
          whileHover={{ rotate: p.r * 1.6 }}
        >
          <div style={{ background: p.color, clipPath: p.clip }} />
        </motion.div>
      ))}
      <motion.div
        className="portrait-photo"
        style={{ filter: "var(--shadow-paper)" }}
        variants={{
          hidden: { opacity: 0, y: 40, rotate: -4, scale: 0.92 },
          show: { opacity: 1, y: 0, rotate: -1.5, scale: 1, transition: { type: "spring", stiffness: 130, damping: 15, delay: 0.25 } },
        }}
      >
        <Image
          src={author.photo}
          alt={author.photoAlt}
          width={900}
          height={900}
          priority={priority}
          sizes="(min-width: 1024px) 420px, 80vw"
          style={{ clipPath: "polygon(2% 3%, 98% 0, 100% 97%, 0 100%)" }}
        />
      </motion.div>
    </motion.div>
  );
}
