import Link from "next/link";
import { Portrait } from "./Portrait";
import { author, socials } from "@/content/author";

/** A short "who is writing this" block. Used on the home page and at the end of every post. */
export function AuthorBio({ heading = "Written by Viraj" }: { heading?: string }) {
  return (
    <aside className="row-rule grid max-w-[var(--measure)] grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 pt-8" aria-label="About the author">
      <Portrait size="sm" />
      <div className="grid gap-2">
        <p className="m-0 text-lg font-bold tracking-tight">{heading}</p>
        <p className="m-0 text-ink-2" style={{ fontFamily: "var(--font-text)" }}>
          {author.name} is a computer engineering student in Pune. {author.tagline}
        </p>
        <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
          <Link href="/about" className="ulink font-semibold">
            About me
          </Link>
          {socials.slice(0, 2).map((s) => (
            <a key={s.href} href={s.href} className="ulink" target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </p>
      </div>
    </aside>
  );
}
