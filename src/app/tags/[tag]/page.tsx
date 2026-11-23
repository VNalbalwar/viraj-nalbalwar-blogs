import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostRow } from "@/components/PostRow";
import { getAllPosts, getAllTags, tagSlug } from "@/lib/posts";

type Props = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  const tags = getAllTags();
  // an empty list would fail a static build of a dynamic route, so keep one placeholder
  return tags.length ? tags.map((t) => ({ tag: t.slug })) : [{ tag: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const found = getAllTags().find((t) => t.slug === tag);
  if (!found) return {};
  return {
    title: `Posts tagged ${found.tag}`,
    description: `Every Offcuts post tagged ${found.tag}.`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const found = getAllTags().find((t) => t.slug === tag);
  if (!found) notFound();
  const posts = getAllPosts().filter((p) => p.tags.some((t) => tagSlug(t) === tag));
  return (
    <div className="wrap pb-8 pt-8">
      <h1 className="t-title mb-8">{found.tag}</h1>
      {posts.map((p) => (
        <PostRow key={p.slug} post={p} />
      ))}
    </div>
  );
}
