import Link from "next/link";

/** Visible breadcrumb trail. Pair it with breadcrumbNode() JSON-LD that lists the same items. */
export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="t-meta">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
        {items.map((it, i) => (
          <li key={it.name} className="flex items-center gap-2">
            {it.path ? (
              <Link href={it.path} className="ulink">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-[28ch] truncate sm:max-w-none">
                {it.name}
              </span>
            )}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
