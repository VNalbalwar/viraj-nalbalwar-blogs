"use client";

import { motion, useMotionValue, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { useRef } from "react";
import { H, W, makeCollage, type MotifKind, type Paper, type Piece } from "@/lib/collage";
import { Motif, motifFor } from "./Motif";

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};

// Each piece is "pasted down": it starts away from its spot, rotated, then springs into place.
const pasted: Variants = {
  hidden: (p: Piece) => ({
    x: (p.cx - W / 2) * 1.5,
    y: (p.cy - H / 2) * 1.5 + (p.id % 2 ? -90 : 90),
    rotate: p.rotate * 3,
    opacity: 0,
    scale: p.id === 0 ? 0.85 : 0.6,
  }),
  show: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 140, damping: 15 } },
};

function PieceView({ p, progress }: { p: Piece; progress?: MotionValue<number> }) {
  const idle = useMotionValue(0.5);
  const depth = 0.4 + (p.id % 5) * 0.35;
  const y = useTransform(progress ?? idle, [0, 1], [depth * -26, depth * 26]);
  return (
    <g transform={`rotate(${p.rotate} ${p.cx} ${p.cy})`}>
      <motion.g variants={pasted} custom={p} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <motion.g style={{ y }}>
          <g className="jig" style={{ "--hx": p.hx, "--hy": p.hy, "--hr": p.hr } as React.CSSProperties}>
            <g
              className="boil paper"
              style={{ "--amp": p.amp, "--dur": `${p.dur}s`, "--delay": `${p.delay}s` } as React.CSSProperties}
            >
              <polygon className={`fill-${p.paper}`} points={p.points} />
            </g>
          </g>
        </motion.g>
      </motion.g>
    </g>
  );
}

type Props = {
  seed: string;
  title?: string;
  /** tags pick a topic scene that sits on top of the collage */
  tags?: string[];
  /** pin the topic scene instead of letting the tags choose */
  motif?: MotifKind;
  /** the paper colour laid down first as the ground piece */
  accent?: Paper;
  /** pieces drift at different depths while the page scrolls */
  parallax?: boolean;
};

function Frame({ seed, title, tags, motif, accent, progress, svgRef }: Props & { progress?: MotionValue<number>; svgRef?: React.Ref<SVGSVGElement> }) {
  const pieces = makeCollage(seed, accent);
  const kind = motifFor(tags, motif);
  return (
    <motion.svg
      ref={svgRef}
      className="collage"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {pieces.map((p) => (
        <PieceView key={p.id} p={p} progress={progress} />
      ))}
      {kind && <Motif kind={kind} x={W * 0.52} y={H * 0.3} />}
    </motion.svg>
  );
}

function Parallax(props: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const { scrollYProgress } = useScroll({ target: ref as unknown as React.RefObject<HTMLElement>, offset: ["start end", "end start"] });
  return <Frame {...props} progress={scrollYProgress} svgRef={ref} />;
}

/**
 * A cut-paper collage generated from a seed. It assembles when scrolled into view,
 * re-cuts on hover (via an ancestor with `.cut-group`), and idles in stepped stop-motion.
 */
export function Collage(props: Props) {
  return props.parallax ? <Parallax {...props} /> : <Frame {...props} />;
}
