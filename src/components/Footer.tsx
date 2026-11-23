import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="wrap row-rule mt-24 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-8 text-[0.95rem] text-ink-2">
      <p>
        {site.name} is written by{" "}
        <a href={site.portfolio} className="ulink text-ink">
          {site.author}
        </a>
        . Posts are researched and drafted with Claude, then read, edited and merged by a human.
      </p>
      <p className="flex gap-5">
        <a href={site.github} className="ulink">
          GitHub
        </a>
        <a href="/rss.xml" className="ulink">
          RSS
        </a>
      </p>
    </footer>
  );
}
