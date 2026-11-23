"use client";

import { useState } from "react";

/** Two layers on one sheet. Drag, tap, or use the arrow keys to slide the top layer away. */
export function Compare({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  caption,
}: {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="fig wide m-0">
      <div className="cmp" style={{ "--pos": `${pos}%` } as React.CSSProperties}>
        <div className="cmp-layer" aria-label={afterLabel}>
          {after}
        </div>
        <div className="cmp-layer cmp-top" aria-label={beforeLabel}>
          {before}
        </div>
        <div className="cmp-handle" aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Slide between ${beforeLabel} and ${afterLabel}`}
        />
      </div>
      <figcaption className="mt-2 flex justify-between text-sm text-ink-2">
        <span>{beforeLabel}</span>
        {caption && <span className="text-center">{caption}</span>}
        <span>{afterLabel}</span>
      </figcaption>
    </figure>
  );
}
