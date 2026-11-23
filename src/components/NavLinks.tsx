"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/posts", label: "Posts" },
  { href: "/tags", label: "Tags" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="nav-link"
          aria-current={pathname === l.href || pathname.startsWith(`${l.href}/`) ? "page" : undefined}
        >
          {l.label}
        </Link>
      ))}
      <a href="/rss.xml" className="nav-link">
        RSS
      </a>
    </>
  );
}
