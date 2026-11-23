import { author, socials } from "@/content/author";
import { absoluteUrl, site } from "./site";

/** Safe to place inside a <script>: "<" is escaped so content can never close the tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export const PERSON_ID = absoluteUrl("/about#person");
export const WEBSITE_ID = absoluteUrl("/#website");

/** The author as a Person. Everything here is visible on /about. */
export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: author.name,
    url: absoluteUrl("/about"),
    image: absoluteUrl(author.photo),
    address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
    sameAs: [author.portfolio, ...socials.map((s) => s.href)],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: absoluteUrl("/"),
    description: site.description,
    inLanguage: "en",
    publisher: personNode(),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
