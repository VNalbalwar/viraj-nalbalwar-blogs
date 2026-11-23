import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse Offcuts posts by topic.",
  alternates: { canonical: "/tags" },
};

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <div className="wrap pb-8 pt-8">
      <h1 className="t-title mb-8">Tags</h1>
      {tags.length === 0 ? (
        <p className="t-lead">Tags appear once the first post is published.</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {tags.map((t) => (
            <li key={t.slug}>
              <Link href={`/tags/${t.slug}`} className="chip !min-h-11 !px-4 !text-base">
                {t.tag}
                <span className="t-meta ml-2">{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
