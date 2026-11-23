/** Tag pages need at least this many posts to be worth indexing; thinner ones are noindex and left out of the sitemap. */
export const MIN_POSTS_FOR_TAG_PAGE = 3;

/** Only the production deployment is indexable. Previews and drafts are kept out of search. */
export const isProduction = (process.env.VERCEL_ENV ?? "production") === "production";

export function robotsFor({ draft = false, follow = true, index = true } = {}) {
  if (!isProduction || draft || !index) return { index: false, follow };
  return {
    index: true,
    follow,
    googleBot: { index: true, follow, "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 },
  };
}

/** Google Search Console ownership token (public by design; it must stay in the page for the property to stay verified). */
export const GOOGLE_SITE_VERIFICATION = "ns7X2ceEjeM1B6X1pqsdCjvy-2ZWrvb2Ko-iFG23DBQ";
