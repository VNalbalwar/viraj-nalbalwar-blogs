"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/posts";

const OFFSET = 88; // clears the sticky area above headings

export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const lock = useRef(false); // ignore scroll-spy while we are travelling to a section
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        if (lock.current) return;
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));

    // the reader taking over (wheel, touch, keys) cancels a running travel
    const cancel = () => stop.current?.();
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      io.disconnect();
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [headings]);

  function flash(el: HTMLElement) {
    el.classList.remove("flash");
    void el.offsetWidth; // restart the animation if it is already running
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1500);
  }

  function go(e: React.MouseEvent, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    stop.current?.();
    setActive(id);
    history.replaceState(null, "", `#${id}`);

    const from = window.scrollY;
    const to = Math.max(0, el.getBoundingClientRect().top + from - OFFSET);
    if (reduce || Math.abs(to - from) < 4) {
      window.scrollTo(0, to);
      el.focus({ preventScroll: true });
      return;
    }

    lock.current = true;
    const distance = Math.abs(to - from);
    const controls = animate(from, to, {
      duration: Math.min(1.5, 0.55 + distance / 2600),
      ease: [0.65, 0, 0.2, 1],
      onUpdate: (v) => window.scrollTo(0, v),
      onComplete: () => {
        lock.current = false;
        stop.current = null;
        flash(el);
      },
    });
    stop.current = () => {
      controls.stop();
      lock.current = false;
      stop.current = null;
    };
  }

  if (headings.length < 3) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="mb-2 text-sm font-bold">On this page</p>
      <ul className="m-0 list-none p-0">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.depth === 3 ? "1rem" : 0 }}>
            <a href={`#${h.id}`} onClick={(e) => go(e, h.id)} aria-current={active === h.id ? "true" : undefined}>
              {active === h.id && (
                <motion.i
                  layoutId="toc-marker"
                  className="toc-marker"
                  aria-hidden
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
