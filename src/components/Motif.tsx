"use client";

import { motion } from "motion/react";
import type { MotifKind } from "@/lib/collage";

const INK = "#181716";
const PAPER = "#faf9f7";
const SUN = "#ffc21a";
const PERSIMMON = "#ff4f2e";


const RULES: [RegExp, MotifKind][] = [
  [/database|sql|postgres|mysql|storage|redis|cache/i, "database"],
  [/docker|container|podman|image|oci/i, "container"],
  [/timer|cron|schedule|latency|time/i, "clock"],
  [/\bgit\b|branch|ci\b|release|merge|version/i, "branch"],
  [/benchmark|performance|metrics|monitoring|chart|prometheus|grafana/i, "chart"],
  [/network|dns|http|web|internet|tcp|browser/i, "globe"],
  [/linux|arch|shell|terminal|systemd|kernel|bash|hyprland|cli/i, "terminal"],
  [/cloud|kubernetes|k8s|devops|docker|openstack|openshift|aws|infra/i, "cloud"],
  [/gpu|cuda|hardware|hpc|chip|nvidia|cpu/i, "chip"],
  [/\bai\b|ml|llm|model|claude|openai|anthropic|neural|agent/i, "nodes"],
  [/security|selinux|auth|crypto|privacy/i, "lock"],
];

/** Pick a topic scene from a post's tags. Returns null when there are no tags. */
export function motifFor(tags: string[] | undefined, override?: MotifKind): MotifKind | null {
  if (override) return override;
  if (!tags || tags.length === 0) return null;
  for (const t of tags) for (const [re, kind] of RULES) if (re.test(t)) return kind;
  return "doc";
}

function ngon(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + 0.3;
    const rr = r * (0.9 + ((i * 37) % 10) / 100);
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
}

function Scene({ kind }: { kind: MotifKind }) {
  switch (kind) {
    case "terminal":
      return (
        <>
          <polygon points="2,6 168,0 170,124 0,130" fill={INK} />
          <polygon points="2,6 168,0 169,22 1,28" fill={SUN} />
          <polyline points="26,56 54,76 26,96" fill="none" stroke={PAPER} strokeWidth="9" />
          <rect className="m-fill m-blink" x="70" y="92" width="38" height="9" fill={PAPER} />
          <rect className="m-fill m-type" x="70" y="58" width="78" height="8" fill={PERSIMMON} />
          <rect className="m-fill m-type" style={{ animationDelay: "0.5s" }} x="70" y="74" width="52" height="8" fill={PAPER} />
        </>
      );
    case "cloud":
      return (
        <>
          <polygon points="2,114 160,112 170,86 150,62 128,54 118,28 90,10 58,22 48,50 22,56 0,84" fill={INK} />
          <polygon points="34,90 134,88 128,72 100,60 74,64 46,72" fill={SUN} opacity="0.95" />
          {[44, 80, 116].map((x, i) => (
            <rect key={x} className="m-fill m-rise" style={{ animationDelay: `${i * 0.55}s` }} x={x} y="118" width="8" height="12" fill={PERSIMMON} />
          ))}
        </>
      );
    case "chip":
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x="6" y={22 + i * 20} width="26" height="9" fill={INK} />
              <rect x="138" y={22 + i * 20} width="26" height="9" fill={INK} />
              <rect x={32 + i * 20} y="2" width="9" height="22" fill={INK} />
              <rect x={32 + i * 20} y="106" width="9" height="22" fill={INK} />
            </g>
          ))}
          <polygon points="28,16 142,12 146,116 26,120" fill={INK} />
          <polygon points="52,38 118,36 120,92 50,94" fill={PAPER} />
          <rect className="m-fill m-pop" x="72" y="54" width="26" height="22" fill={PERSIMMON} />
        </>
      );
    case "nodes": {
      const pts: [number, number][] = [[20, 66], [80, 20], [80, 108], [146, 42], [146, 96]];
      const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 4]];
      return (
        <>
          <polygon points="4,8 166,0 170,126 0,130" fill={PAPER} />
          {edges.map(([a, b], i) => (
            <line
              key={i}
              className="m-march"
              style={{ animationDelay: `${i * 0.18}s` }}
              x1={pts[a][0]}
              y1={pts[a][1]}
              x2={pts[b][0]}
              y2={pts[b][1]}
              stroke={INK}
              strokeWidth="5"
            />
          ))}
          {pts.map(([x, y], i) => (
            <polygon key={i} className="m-fill m-pop" style={{ animationDelay: `${i * 0.3}s` }} points={ngon(x, y, 15, 9)} fill={i % 2 ? PERSIMMON : INK} />
          ))}
        </>
      );
    }
    case "lock":
      return (
        <>
          <polyline className="m-lift" points="46,58 46,34 62,14 108,14 124,34 124,58" fill="none" stroke={INK} strokeWidth="14" />
          <polygon points="22,56 148,52 152,124 18,128" fill={INK} />
          <polygon points={ngon(85, 84, 11, 9)} fill={SUN} />
          <polygon points="81,88 89,88 91,110 79,110" fill={SUN} />
        </>
      );
    case "database":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <polygon points={`22,${20 + i * 36} 150,${16 + i * 36} 152,${46 + i * 36} 20,${50 + i * 36}`} fill={INK} />
              <polygon points={`22,${20 + i * 36} 150,${16 + i * 36} 150,${26 + i * 36} 22,${30 + i * 36}`} fill={i === 0 ? SUN : PAPER} />
              <rect className="m-fill m-blink" style={{ animationDelay: `${i * 0.33}s` }} x="126" y={34 + i * 36} width="14" height="8" fill={i === 1 ? PERSIMMON : PAPER} />
            </g>
          ))}
        </>
      );
    case "container":
      return (
        <>
          <polygon points="6,16 166,10 168,122 4,126" fill={INK} />
          {[0, 1, 2].map((c) =>
            [0, 1].map((r) => (
              <rect
                key={`${c}${r}`}
                className={c === 1 && r === 0 ? "m-fill m-pop" : undefined}
                x={18 + c * 50}
                y={24 + r * 48}
                width="42"
                height="38"
                fill={c === 1 && r === 0 ? PERSIMMON : r === 1 && c === 2 ? SUN : PAPER}
              />
            )),
          )}
        </>
      );
    case "clock":
      return (
        <>
          <polygon points={ngon(85, 65, 60, 12)} fill={INK} />
          <polygon points={ngon(85, 65, 50, 12)} fill={PAPER} />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="83" y="19" width="4" height="10" fill={INK} transform={`rotate(${a} 85 65)`} />
          ))}
          <rect x="83" y="40" width="5" height="28" fill={INK} />
          <g className="m-fill m-spin" style={{ transformOrigin: "85px 65px", transformBox: "view-box" } as React.CSSProperties}>
            <rect x="84" y="24" width="3" height="42" fill={PERSIMMON} />
          </g>
          <polygon points={ngon(85, 65, 6, 8)} fill={INK} />
        </>
      );
    case "branch": {
      const pts: [number, number][] = [[40, 108], [40, 62], [40, 18], [118, 40], [118, 90]];
      return (
        <>
          <line x1="40" y1="108" x2="40" y2="18" stroke={INK} strokeWidth="7" />
          <polyline points="40,86 78,62 118,62 118,90" fill="none" stroke={INK} strokeWidth="7" />
          <polyline points="40,40 78,20 118,20 118,40" fill="none" stroke={INK} strokeWidth="7" />
          {pts.map(([x, y], i) => (
            <polygon key={i} className="m-fill m-pop" style={{ animationDelay: `${i * 0.35}s` }} points={ngon(x, y, 13, 9)} fill={i === 3 ? PERSIMMON : i === 1 ? SUN : INK} />
          ))}
        </>
      );
    }
    case "chart":
      return (
        <>
          <polygon points="6,6 166,0 168,126 4,130" fill={PAPER} />
          <polyline points="22,18 22,108 152,108" fill="none" stroke={INK} strokeWidth="6" />
          {[[34, 52], [62, 74], [90, 30], [118, 58]].map(([x, h], i) => (
            <rect key={i} className="m-fill m-grow" style={{ animationDelay: `${i * 0.25}s` }} x={x} y={104 - h} width="20" height={h} fill={i === 2 ? PERSIMMON : INK} />
          ))}
        </>
      );
    case "globe":
      return (
        <>
          <polygon points={ngon(85, 65, 60, 14)} fill={INK} />
          <polyline points="30,65 140,65" fill="none" stroke={PAPER} strokeWidth="4" />
          <polyline points="38,38 132,38" fill="none" stroke={PAPER} strokeWidth="4" />
          <polyline points="38,92 132,92" fill="none" stroke={PAPER} strokeWidth="4" />
          <polygon points="85,6 118,65 85,124 52,65" fill="none" stroke={PAPER} strokeWidth="4" />
          <line className="m-march" x1="85" y1="8" x2="85" y2="122" stroke={SUN} strokeWidth="5" />
          <polygon className="m-fill m-pop" points={ngon(112, 46, 8, 8)} fill={PERSIMMON} />
        </>
      );
    default:
      return (
        <>
          <polygon points="30,0 112,0 150,38 146,128 26,130" fill={INK} />
          <polygon points="112,0 112,38 150,38" fill={PAPER} />
          <rect className="m-fill m-type" x="48" y="58" width="78" height="8" fill={PAPER} />
          <rect className="m-fill m-type" style={{ animationDelay: "0.4s" }} x="48" y="76" width="64" height="8" fill={PERSIMMON} />
          <rect className="m-fill m-type" style={{ animationDelay: "0.8s" }} x="48" y="94" width="72" height="8" fill={PAPER} />
        </>
      );
  }
}

/** A cut-paper topic scene. Pops in with the collage, then loops in stepped frames. */
export function Motif({ kind, x, y, scale = 1.05 }: { kind: MotifKind; x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <motion.g
        variants={{
          hidden: { scale: 0.4, opacity: 0, rotate: -14 },
          show: { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 210, damping: 12, delay: 0.55 } },
        }}
        style={{ transformBox: "fill-box", transformOrigin: "center", filter: "drop-shadow(0 3px 4px rgb(0 0 0 / 0.3))" }}
      >
        <Scene kind={kind} />
      </motion.g>
    </g>
  );
}
