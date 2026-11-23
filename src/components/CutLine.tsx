"use client";

import { Scissors } from "lucide-react";
import { useEffect, useRef } from "react";

/** A section break. Scissors cut a dashed line across when it scrolls into view. */
export function CutLine() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.cut = "true";
          io.disconnect();
        }
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="cutline" role="separator" aria-hidden>
      <div className="cutline-solid" />
      <div className="cutline-dash" />
      <Scissors className="cutline-scissors" size={22} strokeWidth={2} />
    </div>
  );
}
