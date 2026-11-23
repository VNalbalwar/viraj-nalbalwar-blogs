import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, tagSlug } from "@/lib/posts";
import { MIN_POSTS_FOR_TAG_PAGE } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";


const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => !p.draft);
  const latest = posts.length ? day(posts.reduce((m, p) => ((p.updated ?? p.date) > m ? (p.updated ?? p.date) : m), "")) : undefined;

  const tags = getAllTags()
    .filter((t) => t.count >= MIN_POSTS_FOR_TAG_PAGE)
    .map((t) => {
      const newest = posts.filter((p) => p.tags.some((x) => tagSlug(x) === t.slug)).reduce((m, p) => ((p.updated ?? p.date) > m ? (p.updated ?? p.date) : m), "");
      return { url: absoluteUrl(`/tags/${t.slug}`), lastModified: day(newest) };
    });

  // lastModified only where it reflects a real content change; Google ignores priority and changefreq.
  return [
    { url: absoluteUrl("/"), lastModified: latest },
    { url: absoluteUrl("/posts"), lastModified: latest },
    { url: absoluteUrl("/about") },
    ...tags,
    ...posts.map((p) => ({ url: absoluteUrl(`/posts/${p.slug}`), lastModified: day(p.updated ?? p.date) })),
  ];
}
