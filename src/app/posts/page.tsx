import type { Metadata } from "next";
import { PostBrowser } from "@/components/PostBrowser";
import { getAllPosts, getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "All posts",
  description: "Every post on Offcuts, searchable by title, tag and text.",
  alternates: { canonical: "/posts" },
};

export default function PostsPage() {
  const posts = getAllPosts().map(({ slug, title, description, date, tags, minutes, draft, accent, motif }) => ({
    slug,
    title,
    description,
    date,
    tags,
    minutes,
    draft,
    accent,
    motif,
  }));
  const tags = getAllTags().map((t) => t.tag);
  return (
    <div className="wrap pb-8 pt-8">
      <h1 className="t-title mb-8">All posts</h1>
      <PostBrowser posts={posts} tags={tags} />
    </div>
  );
}
