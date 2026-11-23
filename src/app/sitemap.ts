import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => !p.draft);
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/posts"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/tags"), changeFrequency: "weekly", priority: 0.4 },
    ...getAllTags().map((t) => ({ url: absoluteUrl(`/tags/${t.slug}`), priority: 0.4 })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/posts/${p.slug}`),
      lastModified: new Date(`${p.updated ?? p.date}T00:00:00Z`),
      priority: 0.9,
    })),
  ];
}
