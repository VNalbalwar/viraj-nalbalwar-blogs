import { H, W, makeCollage } from "./collage";

const HEX = { persimmon: "#ff4f2e", sun: "#ffc21a", leaf: "#2ba36b", blush: "#ffb3c7", pine: "#0f4c44" } as const;

/** Static (un-animated) collage for OG images. */
export function OgCollage({ seed, width, height }: { seed: string; width: number; height: number }) {
  const pieces = makeCollage(seed);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      {pieces.map((p) => (
        <polygon key={p.id} points={p.points} fill={HEX[p.paper]} transform={`rotate(${p.rotate} ${p.cx} ${p.cy})`} />
      ))}
    </svg>
  );
}
