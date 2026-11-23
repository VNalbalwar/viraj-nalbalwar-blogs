import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/site";

function Glyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden className="shrink-0">
      <polygon points="3,9 16,3 20,17 7,22" fill="var(--persimmon)" />
      <polygon points="12,14 25,10 24,24 11,25" fill="var(--sun)" style={{ mixBlendMode: "multiply" }} />
      <polygon points="4,20 11,17 13,26 5,26" fill="var(--pine)" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="wrap flex items-center justify-between gap-4 py-4">
      <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight" aria-label={`${site.name}, home`}>
        <Glyph />
        {site.name}
      </Link>
      <nav aria-label="Main" className="flex items-center gap-1">
        <NavLinks />
        <ThemeToggle />
      </nav>
    </header>
  );
}
