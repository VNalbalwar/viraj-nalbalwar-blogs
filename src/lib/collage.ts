// Deterministic cut-paper collages. Same seed gives the same collage on the server,
// the client and in the OG image, so nothing needs to be stored.

export const W = 640;
export const H = 400;

export const PAPERS = ["persimmon", "sun", "leaf", "blush", "pine"] as const;
export type Paper = (typeof PAPERS)[number];

export type Piece = {
  id: number;
  points: string;
  paper: Paper;
  rotate: number;
  cx: number;
  cy: number;
  /** boil amplitude in px */
  amp: number;
  dur: number;
  delay: number;
  /** hover re-cut offsets */
  hx: number;
  hy: number;
  hr: number;
};

function seedFrom(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function polygon(rand: () => number, cx: number, cy: number, r: number, n: number, irr: number, squash = 1) {
  const pts: string[] = [];
  const phase = rand() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const ang = phase + (i / n) * Math.PI * 2 + (rand() - 0.5) * (Math.PI / n) * 0.9;
    const rad = r * (1 - irr * rand());
    pts.push(`${r1(cx + Math.cos(ang) * rad)},${r1(cy + Math.sin(ang) * rad * squash)}`);
  }
  return pts.join(" ");
}

function strip(rand: () => number, cx: number, cy: number, len: number, thick: number) {
  const a = (rand() - 0.5) * 0.5;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const corners = [
    [-len / 2, -thick / 2 + (rand() - 0.5) * 3],
    [len / 2, -thick / 2 + (rand() - 0.5) * 3],
    [len / 2, thick / 2 + (rand() - 0.5) * 3],
    [-len / 2, thick / 2 + (rand() - 0.5) * 3],
  ];
  return corners.map(([x, y]) => `${r1(cx + x * c - y * s)},${r1(cy + x * s + y * c)}`).join(" ");
}

function shuffle<T>(rand: () => number, arr: readonly T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeCollage(seed: string): Piece[] {
  const rand = rng(seedFrom(seed));
  const order = shuffle(rand, PAPERS);
  let ci = 0;
  const nextPaper = (): Paper => order[ci++ % order.length];
  const pieces: Piece[] = [];

  const add = (points: string, cx: number, cy: number, size: number) => {
    pieces.push({
      id: pieces.length,
      points,
      paper: nextPaper(),
      rotate: r1((rand() - 0.5) * 36),
      cx,
      cy,
      amp: r1(1.2 + rand() * 1.8),
      dur: r1(0.8 + rand() * 0.7),
      delay: -r1(rand() * 1.4),
      hx: r1((rand() - 0.5) * 34 * (size > 100 ? 0.5 : 1)),
      hy: r1((rand() - 0.5) * 26 * (size > 100 ? 0.5 : 1)),
      hr: r1((rand() - 0.5) * 22),
    });
  };

  // ground block: large, off-centre, bleeds past the frame
  add(polygon(rand, W * (0.42 + rand() * 0.16), H * (0.45 + rand() * 0.1), 330, 4 + Math.floor(rand() * 2), 0.18, 0.78), W / 2, H / 2, 330);

  // mid shapes
  const mids = 3;
  for (let i = 0; i < mids; i++) {
    const cx = W * (0.15 + rand() * 0.7);
    const cy = H * (0.2 + rand() * 0.6);
    const r = 70 + rand() * 80;
    add(polygon(rand, cx, cy, r, 5 + Math.floor(rand() * 2), 0.38), cx, cy, r);
  }

  // hand-cut circles
  for (let i = 0; i < 2; i++) {
    const cx = W * (0.1 + rand() * 0.8);
    const cy = H * (0.15 + rand() * 0.7);
    const r = 26 + rand() * 40;
    add(polygon(rand, cx, cy, r, 10, 0.1), cx, cy, r);
  }

  // strips
  for (let i = 0; i < 2; i++) {
    const cx = W * (0.2 + rand() * 0.6);
    const cy = H * (0.15 + rand() * 0.7);
    add(strip(rand, cx, cy, 180 + rand() * 160, 16 + rand() * 14), cx, cy, 120);
  }

  // confetti triangles
  for (let i = 0; i < 2; i++) {
    const cx = W * (0.1 + rand() * 0.8);
    const cy = H * (0.1 + rand() * 0.8);
    const r = 14 + rand() * 18;
    add(polygon(rand, cx, cy, r, 3, 0.25), cx, cy, r);
  }

  return pieces;
}
