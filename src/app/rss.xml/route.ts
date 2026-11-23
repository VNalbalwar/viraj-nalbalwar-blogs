import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: site.name,
    description: site.description,
    id: absoluteUrl("/"),
    link: absoluteUrl("/"),
    language: "en",
    copyright: `${new Date().getFullYear()} ${site.author}`,
    feedLinks: { rss: absoluteUrl("/rss.xml") },
    author: { name: site.author, link: site.portfolio },
  });
  for (const p of getAllPosts().filter((p) => !p.draft)) {
    feed.addItem({
      title: p.title,
      id: absoluteUrl(`/posts/${p.slug}`),
      link: absoluteUrl(`/posts/${p.slug}`),
      description: p.description,
      date: new Date(`${p.date}T00:00:00Z`),
      category: p.tags.map((name) => ({ name })),
    });
  }
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
