"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

export function CopyButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const [done, setDone] = useState(false);

  async function copy() {
    const pre = ref.current?.closest("figure")?.querySelector("pre");
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ""));
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard blocked: the code stays selectable */
    }
  }

  return (
    <button ref={ref} type="button" onClick={copy} className="copy-btn" aria-label="Copy code">
      {done ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}
