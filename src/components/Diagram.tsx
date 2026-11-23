"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

type Tone = "sun" | "persimmon" | "leaf" | "blush" | "pine" | "paper";

export type DiagramNode = {
  id: string;
  label: string; // "\n" starts a new line
  note?: string;
  /** centre, in percent of the width and height */
  x: number;
  y: number;
  tone?: Tone;
  /** override the auto width, in px of the 640-wide canvas */
  w?: number;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  /** flow: solid with a packet travelling along it. dashed: an optional or async link. both: arrows at both ends */
  kind?: "flow" | "dashed" | "both";
  /** set false to stop the packet on a flow edge */
  pulse?: boolean;
};

const W = 640;
const TONES: Record<Tone, { fill: string; text: string }> = {
  sun: { fill: "var(--sun)", text: "#181716" },
  persimmon: { fill: "var(--persimmon)", text: "#181716" },
  leaf: { fill: "var(--leaf)", text: "#181716" },
  blush: { fill: "var(--blush)", text: "#181716" },
  pine: { fill: "var(--pine)", text: "#faf9f7" },
  paper: { fill: "var(--paper-2)", text: "var(--ink)" },
};
const ORDER: Tone[] = ["sun", "blush", "leaf", "persimmon", "pine"];
const LINE = 21;

type Placed = DiagramNode & { cx: number; cy: number; hw: number; hh: number; lines: string[]; tone: Tone };

function jit(id: string, k: number) {
  return (((id.charCodeAt(k % id.length) * (k + 7)) % 7) / 7) * 3 - 1.5;
}

function place(nodes: DiagramNode[], height: number): Placed[] {
  return nodes.map((n, i) => {
    const lines = n.label.split("\n");
    const maxc = Math.max(...lines.map((l) => l.length));
    const w = n.w ?? Math.max(92, Math.round(maxc * 8.6 + 30));
    const h = 26 + lines.length * LINE + (n.note ? 20 : 0);
    return { ...n, lines, cx: (n.x / 100) * W, cy: (n.y / 100) * height, hw: w / 2, hh: Math.max(26, h / 2), tone: n.tone ?? ORDER[i % ORDER.length] };
  });
}

function edgeEnds(a: Placed, b: Placed) {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const cut = (n: Placed, sx: number, sy: number) => {
    const t = Math.min(n.hw / Math.abs(sx || 1e-6), n.hh / Math.abs(sy || 1e-6));
    return { x: n.cx + sx * t, y: n.cy + sy * t };
  };
  const gap = 5;
  const s = cut(a, ux, uy);
  const e = cut(b, -ux, -uy);
  return { s: { x: s.x + ux * gap, y: s.y + uy * gap }, e: { x: e.x - ux * gap, y: e.y - uy * gap }, ux, uy };
}

function arrow(p: { x: number; y: number }, ux: number, uy: number) {
  const nx = -uy;
  const ny = ux;
  return `${p.x},${p.y} ${p.x - ux * 13 + nx * 7},${p.y - uy * 13 + ny * 7} ${p.x - ux * 13 - nx * 7},${p.y - uy * 13 - ny * 7}`;
}

/** A packet that hops along an edge in held frames, like animation shot on twos. */
function Packet({ s, e, delay, run }: { s: { x: number; y: number }; e: { x: number; y: number }; delay: number; run: boolean }) {
  const N = 9;
  const xs: number[] = [];
  const ys: number[] = [];
  const times: number[] = [];
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const x = s.x + (e.x - s.x) * f;
    const y = s.y + (e.y - s.y) * f;
    xs.push(x, x);
    ys.push(y, y);
    times.push(i / N, Math.min(1, (i + 1) / N - 0.001));
  }
  return (
    <motion.g
      initial={{ x: s.x, y: s.y, opacity: 0 }}
      animate={run ? { x: xs, y: ys, opacity: 1 } : { opacity: 0 }}
      transition={
        run
          ? { x: { duration: 2.4, repeat: Infinity, ease: "linear", times, delay, repeatDelay: 0.5 }, y: { duration: 2.4, repeat: Infinity, ease: "linear", times, delay, repeatDelay: 0.5 }, opacity: { duration: 0.1 } }
          : { duration: 0 }
      }
    >
      <rect x={-5} y={-5} width={10} height={10} fill="var(--persimmon)" stroke="#181716" strokeWidth={1.5} />
    </motion.g>
  );
}

/**
 * A node-and-pipe diagram in cut paper. Nodes drop in, connections draw, and packets hop along
 * the flow edges. Hover a node to follow its connections. `caption` is required: it is the
 * figure's accessible name, and the nodes and edges are also written out for screen readers.
 */
export function Diagram({
  nodes,
  edges,
  caption,
  height = 320,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  caption: string;
  height?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-12% 0px" });
  const reduce = useReducedMotion();
  const [hot, setHot] = useState<string | null>(null);
  const placed = place(nodes, height);
  const byId = Object.fromEntries(placed.map((n) => [n.id, n]));
  const run = inView && !reduce;

  const description = edges
    .filter((e) => byId[e.from] && byId[e.to])
    .map((e) => `${byId[e.from].label.replace("\n", " ")} ${e.kind === "both" ? "and" : "to"} ${byId[e.to].label.replace("\n", " ")}${e.label ? `: ${e.label}` : ""}`);

  return (
    <figure ref={ref} className="fig wide m-0">
      <div className="dg-scroll">
        <motion.svg
          className="dg-svg"
          viewBox={`0 0 ${W} ${height}`}
          role="img"
          aria-label={caption}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {edges.map((e, i) => {
            const a = byId[e.from];
            const b = byId[e.to];
            if (!a || !b) return null;
            const { s, e: en, ux, uy } = edgeEnds(a, b);
            const dashed = e.kind === "dashed";
            const dim = hot && hot !== e.from && hot !== e.to;
            const mx = (s.x + en.x) / 2;
            const my = (s.y + en.y) / 2;
            // labels sit beside the connection: above a horizontal one, to the right of a vertical one
            const vertical = Math.abs(uy) > 0.85;
            let nx = -uy;
            let ny = ux;
            if (vertical ? nx < 0 : ny > 0) {
              nx = -nx;
              ny = -ny;
            }
            const lab = vertical
              ? { x: mx + 12, y: my + 4.5, anchor: "start" as const }
              : { x: mx + nx * 17, y: my + ny * 17 + 4.5, anchor: "middle" as const };
            return (
              <motion.g
                key={i}
                className="dg-edge"
                style={{ opacity: dim ? 0.18 : 1 }}
                variants={{ hidden: { opacity: 0 }, show: { opacity: dim ? 0.18 : 1, transition: { delay: 0.45 + i * 0.07, duration: 0.3 } } }}
              >
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={en.x - ux * 11}
                  y2={en.y - uy * 11}
                  stroke="var(--ink)"
                  strokeWidth={3}
                  strokeDasharray={dashed ? "7 8" : undefined}
                />
                <polygon points={arrow(en, ux, uy)} fill="var(--ink)" />
                {e.kind === "both" && <polygon points={arrow(s, -ux, -uy)} fill="var(--ink)" />}
                {e.label && (
                  <text
                    x={lab.x}
                    y={lab.y}
                    textAnchor={lab.anchor}
                    fontSize={13}
                    fontWeight={700}
                    fill="var(--ink)"
                    stroke="var(--paper)"
                    strokeWidth={5}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                  >
                    {e.label}
                  </text>
                )}
                {!dashed && e.pulse !== false && <Packet s={s} e={{ x: en.x - ux * 12, y: en.y - uy * 12 }} delay={i * 0.35} run={run} />}
              </motion.g>
            );
          })}

          {placed.map((n, i) => {
            const t = TONES[n.tone];
            const dim = hot && hot !== n.id && !edges.some((e) => (e.from === hot && e.to === n.id) || (e.to === hot && e.from === n.id));
            const top = -((n.lines.length - 1) * LINE) / 2 - (n.note ? 8 : 0) + 6;
            const pts = [
              [-n.hw + jit(n.id, 0), -n.hh + jit(n.id, 1)],
              [n.hw + jit(n.id, 2), -n.hh + jit(n.id, 3)],
              [n.hw + jit(n.id, 4), n.hh + jit(n.id, 5)],
              [-n.hw + jit(n.id, 6), n.hh + jit(n.id, 7)],
            ]
              .map((p) => p.join(","))
              .join(" ");
            return (
              <g key={n.id} transform={`translate(${n.cx} ${n.cy})`} onPointerEnter={() => setHot(n.id)} onPointerLeave={() => setHot(null)}>
                <motion.g
                  className="dg-node"
                  style={{ transformBox: "fill-box", transformOrigin: "center", opacity: dim ? 0.3 : undefined }}
                  variants={{
                    hidden: { opacity: 0, y: -28, rotate: -5, scale: 0.88 },
                    show: { opacity: dim ? 0.3 : 1, y: 0, rotate: ((i % 3) - 1) * 1.1, scale: 1, transition: { type: "spring", stiffness: 210, damping: 15 } },
                  }}
                >
                  <polygon points={pts} fill={t.fill} stroke={n.tone === "paper" ? "var(--line)" : undefined} style={{ filter: "var(--shadow-paper)" }} />
                  {n.lines.map((ln, li) => (
                    <text key={li} x={0} y={top + li * LINE} textAnchor="middle" fontSize={17} fontWeight={700} fill={t.text} style={{ letterSpacing: "-0.01em" }}>
                      {ln}
                    </text>
                  ))}
                  {n.note && (
                    <text x={0} y={top + n.lines.length * LINE + 2} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={t.text} opacity={0.85}>
                      {n.note}
                    </text>
                  )}
                </motion.g>
              </g>
            );
          })}
        </motion.svg>
      </div>
      <p className="dg-hint" aria-hidden>
        Swipe sideways to see the whole diagram.
      </p>
      <ul className="sr-only">
        {description.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <figcaption className="fig-cap">{caption}</figcaption>
    </figure>
  );
}
