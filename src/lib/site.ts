export const site = {
  name: "Offcuts",
  tagline: "Things I tried, broke, fixed and checked the sources for.",
  description:
    "Notes and experiments on Linux, cloud and AI, written by Viraj Nalbalwar. Every outside claim links to its source.",
  author: "Viraj Nalbalwar",
  // One env var drives canonicals, RSS and OG URLs, so a custom domain is a one-line switch.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  portfolio: "https://viraj-verse.vercel.app",
  github: "https://github.com/VNalbalwar",
} as const;

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
