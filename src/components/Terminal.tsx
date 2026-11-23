"use client";

import { Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type TermLine = { cmd: string } | { out: string; wait?: number };

const reducedSub = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reducedNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A command replay. Typing advances two characters every 60ms, like animation on twos.
 * The full transcript is always in the DOM for screen readers and no-JS readers.
 */
export function Terminal({
  lines,
  title = "terminal",
  prompt = "$",
}: {
  lines: TermLine[];
  title?: string;
  prompt?: string;
}) {
  const reduced = useSyncExternalStore(reducedSub, reducedNow, () => false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [chars, setChars] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || reduced || step >= lines.length) return;
    const line = lines[step];
    let t: ReturnType<typeof setTimeout>;
    if ("cmd" in line) {
      if (chars < line.cmd.length) {
        t = setTimeout(() => setChars((c) => Math.min(c + 2, line.cmd.length)), 60);
      } else {
        t = setTimeout(() => {
          setStep((s) => s + 1);
          setChars(0);
        }, 420);
      }
    } else {
      t = setTimeout(() => setStep((s) => s + 1), line.wait ?? 180);
    }
    return () => clearTimeout(t);
  }, [started, reduced, step, chars, lines]);

  const shown = reduced ? lines.length : step;
  const done = shown >= lines.length;
  const transcript = lines.map((l) => ("cmd" in l ? `${prompt} ${l.cmd}` : l.out)).join("\n");

  function replay() {
    setStep(0);
    setChars(0);
    setStarted(true);
  }

  return (
    <div className="term wide" ref={rootRef}>
      <div className="term-bar">
        <span>{title}</span>
        <span className="flex gap-2">
          {!done && !reduced && (
            <button type="button" className="term-btn" onClick={() => setStep(lines.length)}>
              <SkipForward size={14} aria-hidden /> Skip
            </button>
          )}
          {done && !reduced && (
            <button type="button" className="term-btn" onClick={replay}>
              <RotateCcw size={14} aria-hidden /> Replay
            </button>
          )}
          {!started && !reduced && (
            <button type="button" className="term-btn" onClick={() => setStarted(true)}>
              <Play size={14} aria-hidden /> Play
            </button>
          )}
        </span>
      </div>
      <pre className="sr-only">{transcript}</pre>
      <div className="term-body" aria-hidden>
        {lines.slice(0, shown).map((l, i) =>
          "cmd" in l ? (
            <div key={i}>
              <span className="term-ps">{prompt} </span>
              {l.cmd}
            </div>
          ) : (
            <div key={i} className="term-out">
              {l.out}
            </div>
          ),
        )}
        {!done && "cmd" in lines[shown] && (
          <div>
            <span className="term-ps">{prompt} </span>
            {lines[shown].cmd.slice(0, chars)}
            <span className="term-caret" />
          </div>
        )}
        {done && (
          <div>
            <span className="term-ps">{prompt} </span>
            <span className="term-caret" />
          </div>
        )}
      </div>
    </div>
  );
}
