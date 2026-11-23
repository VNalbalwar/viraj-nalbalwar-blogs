import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/posts";

/** Up to three other posts that share tags with this one. Real internal links, not filler. */
export function RelatedPosts({ current, all }: { current: Post; all: Post[] }) {
  const related = all
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({ p, overlap: p.tags.filter((t) => current.tags.includes(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, 3)
    .map((x) => x.p);
  if (related.length === 0) return null;
  return (
    <section className="mt-16 max-w-[var(--measure)]" aria-labelledby="related">
      <h2 id="related" className="m-0 text-2xl font-bold tracking-tight">
        Keep reading
      </h2>
      <ul className="m-0 mt-4 grid list-none p-0">
        {related.map((p) => (
          <li key={p.slug} className="row-rule cut-group relative grid gap-1 py-4">
            <p className="t-meta m-0">{formatDate(p.date)}</p>
            <Link href={`/posts/${p.slug}`} className="text-lg font-bold leading-snug tracking-tight after:absolute after:inset-0 after:content-['']">
              <span className="draw">{p.title}</span>
            </Link>
            <p className="t-deck-sm m-0">{p.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
