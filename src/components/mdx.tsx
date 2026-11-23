import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { Collage } from "./Collage";
import { Compare } from "./Compare";
import { Flow } from "./Flow";
import { CopyButton } from "./CopyButton";
import { CutLine } from "./CutLine";
import { Terminal } from "./Terminal";

export const mdxComponents: MDXComponents = {
  Callout,
  Collage,
  Compare,
  Flow,
  Terminal,
  hr: () => <CutLine />,
  a: ({ href = "", children, ...rest }) => {
    if (href.startsWith("/") || href.startsWith("#")) {
      return href.startsWith("#") ? (
        <a href={href} {...rest}>
          {children}
        </a>
      ) : (
        <Link href={href}>{children}</Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
  figure: ({ children, ...props }) => {
    const isCode = "data-rehype-pretty-code-figure" in props;
    return (
      <figure {...props} className={isCode ? "wide" : "fig"}>
        {children}
        {isCode && <CopyButton />}
      </figure>
    );
  },
  img: ({ alt = "", src, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" {...props} />
  ),
};
