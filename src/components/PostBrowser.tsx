"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { PostRow, type PostSummary } from "./PostRow";

export function PostBrowser({ posts, tags }: { posts: PostSummary[]; tags: string[] }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (tag && !p.tags.includes(tag)) return false;
      if (!needle) return true;
      return `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(needle);
    });
  }, [posts, q, tag]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Search posts</span>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, tags, text"
            className="h-11 w-full rounded-full border border-[var(--line)] bg-transparent pl-10 pr-4 text-base outline-none focus:border-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action"
          />
        </label>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {tags.map((t) => (
            <li key={t}>
              <button type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="t-meta mb-2 mt-6" aria-live="polite">
        {shown.length} {shown.length === 1 ? "post" : "posts"}
      </p>
      {shown.length === 0 ? (
        <p className="py-12 text-lg">
          Nothing matches “{q}”. Clear the search or pick a different tag.
        </p>
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 24, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -16, rotate: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <PostRow post={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
