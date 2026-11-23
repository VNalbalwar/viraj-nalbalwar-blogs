import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Collage } from "./Collage";
import { formatDate, tagSlug } from "@/lib/format";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  minutes: number;
  draft?: boolean;
};

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="relative z-10 m-0 flex list-none flex-wrap gap-2 p-0">
      {tags.map((t) => (
        <li key={t}>
          <Link href={`/tags/${tagSlug(t)}`} className="chip">
            {t}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const stretch = { after: "after:absolute after:inset-0 after:content-['']" };

export function PostRow({ post }: { post: PostSummary }) {
  return (
    <article className="post-row cut-group row-rule relative grid items-center gap-x-8 gap-y-4 py-7 sm:grid-cols-[13rem_1fr_auto]">
      <div className="thumb aspect-[8/5]">
        <Collage seed={post.slug} tags={post.tags} />
      </div>
      <div className="grid gap-2.5">
        <p className="t-meta m-0">
          {formatDate(post.date)} · {post.minutes} min read
          {post.draft && <span className="chip ml-3">Draft</span>}
        </p>
        <h3 className="m-0 text-[1.5rem] font-bold leading-tight tracking-tight [font-variation-settings:'wdth'_92]">
          <Link href={`/posts/${post.slug}`} className={stretch.after}>
            <span className="draw">{post.title}</span>
          </Link>
        </h3>
        <p className="t-deck-sm m-0">{post.description}</p>
        <Tags tags={post.tags} />
      </div>
      <span className="go hidden sm:inline-grid" aria-hidden>
        <ArrowUpRight size={22} strokeWidth={2.2} />
      </span>
    </article>
  );
}

export function FeaturePost({ post }: { post: PostSummary }) {
  return (
    <article className="cut-group relative grid items-center gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="thumb aspect-[8/5]">
        <Collage seed={post.slug} tags={post.tags} />
      </div>
      <div className="grid gap-5">
        <p className="t-meta m-0">
          {formatDate(post.date)} · {post.minutes} min read
          {post.draft && <span className="chip ml-3">Draft</span>}
        </p>
        <h2 className="t-title m-0">
          <Link href={`/posts/${post.slug}`} className={stretch.after}>
            <span className="draw">{post.title}</span>
          </Link>
        </h2>
        <p className="t-deck m-0">{post.description}</p>
        <Tags tags={post.tags} />
        <span className="cta mt-1" aria-hidden>
          Read the post
          <span className="go">
            <ArrowUpRight size={20} strokeWidth={2.4} />
          </span>
        </span>
      </div>
    </article>
  );
}
