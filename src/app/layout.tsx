import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Nunito, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { JsonLd, websiteNode } from "@/lib/jsonld";
import { robotsFor } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});
// Reading face: rounded stroke endings and soft curves, readable at paragraph sizes.
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-reading",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false, // only code blocks use it, so it should not compete with the fonts every page needs
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Linux, cloud and AI notes by ${site.author}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: `${site.url}/about` }],
  creator: site.author,
  publisher: site.author,
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: { type: "website", siteName: site.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: robotsFor(),
  // Search Console and Bing Webmaster ownership checks. Set the env vars on Vercel to enable.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

// Runs before first paint so the right theme is there from frame one.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${nunito.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={{ "@context": "https://schema.org", ...websiteNode() }} />
        <Providers>
          <a href="#main" className="skip">
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
