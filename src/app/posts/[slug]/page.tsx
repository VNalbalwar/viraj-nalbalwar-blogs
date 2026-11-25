import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { AuthorBio } from "@/components/AuthorBio";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Collage } from "@/components/Collage";
import { KineticTitle } from "@/components/KineticTitle";
import { mdxComponents } from "@/components/mdx";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { Toc } from "@/components/Toc";
import { formatDate, getAllPosts, getPost, tagSlug } from "@/lib/posts";
import { JsonLd, PERSON_ID, WEBSITE_ID, breadcrumbNode, personNode } from "@/lib/jsonld";
import { accentFor } from "@/lib/collage";
import { robotsFor } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}` },
    robots: robotsFor({ draft: post.draft, follow: !post.draft }),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/posts/${post.slug}`),
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [site.author],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
    other: { "article:section": post.tags[0] ?? "" },
  };
}

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: "plaintext",
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  const newer = all[i - 1];
  const older = all[i + 1];

  const accent = accentFor(post.slug, post.accent);
  const url = absoluteUrl(`/posts/${post.slug}`);
  const words = post.content.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        inLanguage: "en",
        wordCount: words,
        keywords: post.tags.join(", "),
        articleSection: post.tags[0],
        image: absoluteUrl(`/posts/${post.slug}/opengraph-image`),
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: personNode(),
        publisher: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
        url,
      },
      breadcrumbNode([
        { name: "Home", path: "/" },
        { name: "Posts", path: "/posts" },
        { name: post.title, path: `/posts/${post.slug}` },
      ]),
    ],
  };

  return (
    <div className="post-scope" data-accent={accent} style={{ "--post-accent": `var(--${accent})` } as React.CSSProperties}>
      <ReadingProgress />
      <article className="wrap pb-8 pt-6">
        <header className="mb-10 grid gap-5">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Posts", path: "/posts" }, { name: post.title }]} />
          <p className="t-meta m-0">
            {formatDate(post.date)}
            {post.updated && post.updated !== post.date ? `, updated ${formatDate(post.updated)}` : ""} · {post.minutes} min read
            {post.draft && <span className="chip ml-3">Draft, not published</span>}
          </p>
          <KineticTitle text={post.title} className="t-title m-0 max-w-[22ch]" />
          <p className="t-lead m-0">{post.description}</p>
          {post.tags.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {post.tags.map((t) => (
                <li key={t}>
                  <Link href={`/tags/${tagSlug(t)}`} className="chip">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="thumb mb-14 aspect-[16/7] sm:aspect-[16/6]">
          <Collage seed={post.slug} tags={post.tags} accent={post.accent} motif={post.motif} parallax title={`Cut-paper collage for ${post.title}`} />
        </div>

        <div className="grid gap-x-14 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Toc headings={post.headings} />
            </div>
          </aside>
          <div className="min-w-0">
            <div className="prose">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  // Posts are authored in this repo and reviewed in a PR, so prop expressions
                  // (lines={[...]}) are allowed. blockDangerousJS stays on.
                  blockJS: false,
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
                  },
                }}
              />
            </div>

            {post.sources.length > 0 && (
              <section className="prose mt-16" aria-labelledby="sources">
                <h2 id="sources">Sources</h2>
                <ol>
                  {post.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <RelatedPosts current={post} all={all} />

            <div className="mt-16">
              <AuthorBio />
            </div>

            <nav className="row-rule mt-12 grid max-w-[var(--measure)] gap-6 pt-6 sm:grid-cols-2" aria-label="More posts">
              {older ? (
                <Link href={`/posts/${older.slug}`} className="block">
                  <span className="t-meta">Older</span>
                  <span className="mt-1 block text-lg font-bold leading-snug">{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link href={`/posts/${newer.slug}`} className="block sm:text-right">
                  <span className="t-meta">Newer</span>
                  <span className="mt-1 block text-lg font-bold leading-snug">{newer.title}</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </article>
      <JsonLd data={jsonLd} />
    </div>
  );
}
