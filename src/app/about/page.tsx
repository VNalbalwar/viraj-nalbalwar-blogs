import type { Metadata } from "next";
import { KineticTitle } from "@/components/KineticTitle";
import { Portrait } from "@/components/Portrait";
import { author, bio, experience, facts, research, socials } from "@/content/author";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Viraj",
  description: `${author.name} is a computer engineering student in ${author.location.split(",")[0]} working on cloud infrastructure, Linux and GPU performance research. He writes this blog.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: absoluteUrl("/about"),
    image: absoluteUrl(author.photo),
    address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
    sameAs: [author.portfolio, ...socials.map((s) => s.href)],
    knowsAbout: ["Kubernetes", "Linux", "Cloud infrastructure", "GPU performance"],
  };

  return (
    <div className="wrap pb-8 pt-6 sm:pt-10">
      <section className="grid items-center gap-x-16 gap-y-12 overflow-x-clip lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="grid gap-6">
          <KineticTitle text={`Hi, I'm ${author.short}.`} className="t-title m-0" />
          <p className="t-lead m-0">{author.tagline}</p>
          <div className="prose">
            {bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              {site.name} is where I write down what I find: Linux and systems, cloud, and the AI and ML news worth a second look. Every outside claim links to where it came from.
            </p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[26rem] px-4 lg:px-0">
          <Portrait priority />
        </div>
      </section>

      <section className="mt-20 grid gap-x-16 gap-y-10 lg:grid-cols-[13rem_minmax(0,1fr)]" aria-labelledby="facts">
        <h2 id="facts" className="m-0 text-2xl font-bold tracking-tight">
          At a glance
        </h2>
        <dl className="m-0 grid max-w-[var(--measure)]">
          {facts.map(([k, v]) => (
            <div key={k} className="row-rule grid gap-x-6 py-4 sm:grid-cols-[8rem_1fr]">
              <dt className="font-bold">{k}</dt>
              <dd className="m-0 text-ink-2" style={{ fontFamily: "var(--font-text)" }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-20 grid gap-x-16 gap-y-10 lg:grid-cols-[13rem_minmax(0,1fr)]" aria-labelledby="work">
        <h2 id="work" className="m-0 text-2xl font-bold tracking-tight">
          Where I&apos;ve worked
        </h2>
        <ul className="m-0 grid max-w-[var(--measure)] list-none p-0">
          {experience.map((e) => (
            <li key={e.org} className="row-rule grid gap-1 py-5">
              <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="text-lg font-bold tracking-tight">
                  {e.role}, {e.org}
                </span>
                <span className="t-meta">{e.when}</span>
              </p>
              <p className="m-0 text-ink-2" style={{ fontFamily: "var(--font-text)" }}>
                {e.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 grid gap-x-16 gap-y-10 lg:grid-cols-[13rem_minmax(0,1fr)]" aria-labelledby="research">
        <h2 id="research" className="m-0 text-2xl font-bold tracking-tight">
          Research
        </h2>
        <ul className="m-0 grid max-w-[var(--measure)] list-none p-0">
          {research.map((r) => (
            <li key={r.title} className="row-rule grid gap-2 py-5">
              <p className="m-0 text-lg font-bold leading-snug tracking-tight">
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="ulink">
                  {r.title}
                </a>
              </p>
              <p className="t-meta m-0">{r.venue}</p>
              <p className="m-0 text-ink-2" style={{ fontFamily: "var(--font-text)" }}>
                {r.question}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 grid gap-x-16 gap-y-10 lg:grid-cols-[13rem_minmax(0,1fr)]" aria-labelledby="elsewhere">
        <h2 id="elsewhere" className="m-0 text-2xl font-bold tracking-tight">
          Find me
        </h2>
        <div className="grid max-w-[var(--measure)] gap-6">
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {[{ label: "Portfolio", href: author.portfolio }, ...socials].map((s) => (
              <li key={s.href}>
                <a href={s.href} className="chip !min-h-11 !px-4 !text-base" target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="m-0">
            <a href={author.contact} className="btn" target="_blank" rel="noopener noreferrer">
              Say hello
            </a>
          </p>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
