import Link from "next/link";
import { author, socials } from "@/content/author";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="wrap mt-24">
      <div className="row-rule flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-8 text-[0.95rem] text-ink-2">
        <p className="m-0">
          {site.name} is written by{" "}
          <Link href="/about" className="ulink text-ink">
            {author.name}
          </Link>
          .
        </p>
        <p className="m-0 flex flex-wrap gap-x-5 gap-y-1">
          {socials.slice(0, 2).map((s) => (
            <a key={s.href} href={s.href} className="ulink" target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
          <a href={author.portfolio} className="ulink" target="_blank" rel="noopener noreferrer">
            Portfolio
          </a>
          <a href="/rss.xml" className="ulink">
            RSS
          </a>
        </p>
      </div>
    </footer>
  );
}
