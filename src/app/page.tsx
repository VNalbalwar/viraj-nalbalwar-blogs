import Link from "next/link";
import { HeroTitle } from "@/components/HeroTitle";
import { Scraps } from "@/components/Scraps";
import { AuthorBio } from "@/components/AuthorBio";
import { FeaturePost, PostRow } from "@/components/PostRow";
import { getAllPosts } from "@/lib/posts";
import { author } from "@/content/author";
import { site } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();
  const [latest, ...rest] = posts;

  return (
    <div className="wrap">
      <section className="pb-14 pt-6 sm:pt-10">
        <HeroTitle />
        <div className="mt-8 grid items-center gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
          <p className="t-lead m-0">{site.tagline} Notes on Linux, cloud and AI by {author.name}, a computer engineering student in Pune.</p>
          <Scraps />
        </div>
      </section>

      {latest ? (
        <section className="pb-16" aria-label="Newest post">
          <FeaturePost post={latest} />
        </section>
      ) : (
        <section className="pb-24">
          <p className="t-lead">No posts yet. The first one is being cut.</p>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-label="Earlier posts">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Earlier</h2>
          {rest.slice(0, 6).map((p) => (
            <PostRow key={p.slug} post={p} />
          ))}
          <p className="mt-8">
            <Link href="/posts" className="btn">
              All {posts.length} posts
            </Link>
          </p>
        </section>
      )}
    
      <section className="mt-20" aria-label="About the author">
        <AuthorBio heading="Hi, I'm Viraj" />
      </section>
    </div>
  );
}
