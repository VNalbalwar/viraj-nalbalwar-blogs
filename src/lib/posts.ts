import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import GithubSlugger from "github-slugger";
import { tagSlug } from "./format";
import { MOTIFS, PAPERS, type MotifKind, type Paper } from "./collage";

export { formatDate, tagSlug } from "./format";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type Source = { title: string; url: string };
export type Heading = { depth: 2 | 3; text: string; id: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  updated?: string;
  tags: string[];
  draft: boolean;
  sources: Source[];
  cover?: string;
  /** paper colour this post wears (cover ground piece, progress bar, contents marker) */
  accent?: Paper;
  /** pinned topic scene for the cover; otherwise the tags choose */
  motif?: MotifKind;
  minutes: number;
  headings: Heading[];
  content: string;
};

/** Drafts are visible in dev and when SHOW_DRAFTS=1 (Vercel preview builds). Never in production. */
function draftsVisible() {
  return process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";
}

function stripInline(md: string) {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fence: string | null = null;
  for (const line of source.split("\n")) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = stripInline(m[2]);
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}

function fail(file: string, msg: string): never {
  throw new Error(`content/posts/${file}: ${msg}`);
}

function readPost(file: string): Post {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);

  if (typeof data.title !== "string" || !data.title) fail(file, "missing `title`");
  if (typeof data.description !== "string" || !data.description) fail(file, "missing `description`");
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(file, "`date` must be yyyy-mm-dd");

  const tags: string[] = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const sources: Source[] = Array.isArray(data.sources)
    ? data.sources.map((s: { title?: string; url?: string }) => {
        if (!s?.url || !s?.title) fail(file, "each source needs `title` and `url`");
        return { title: String(s.title), url: String(s.url) };
      })
    : [];

  if (data.accent !== undefined && !(PAPERS as readonly string[]).includes(data.accent)) fail(file, `\`accent\` must be one of: ${PAPERS.join(", ")}`);
  if (data.motif !== undefined && !(MOTIFS as readonly string[]).includes(data.motif)) fail(file, `\`motif\` must be one of: ${MOTIFS.join(", ")}`);

  return {
    slug,
    title: data.title,
    description: data.description,
    date,
    updated: data.updated ? String(data.updated) : undefined,
    tags,
    draft: data.draft === true,
    sources,
    cover: data.cover ? String(data.cover) : undefined,
    accent: data.accent as Paper | undefined,
    motif: data.motif as MotifKind | undefined,
    minutes: Math.max(1, Math.round(readingTime(content).minutes)),
    headings: extractHeadings(content),
    content,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(readPost)
    .filter((p) => !p.draft || draftsVisible())
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllTags(): { tag: string; slug: string; count: number }[] {
  const map = new Map<string, { tag: string; count: number }>();
  for (const p of getAllPosts()) {
    for (const t of p.tags) {
      const s = tagSlug(t);
      const cur = map.get(s);
      map.set(s, { tag: cur?.tag ?? t, count: (cur?.count ?? 0) + 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

