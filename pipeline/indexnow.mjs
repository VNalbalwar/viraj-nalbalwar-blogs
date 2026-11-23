#!/usr/bin/env node
// Tell IndexNow search engines (Bing, Yandex, Naver, Seznam and others) that URLs changed.
// Google does not use IndexNow: it finds new URLs through the sitemap and its own crawling.
//   node pipeline/indexnow.mjs /posts/my-slug /about
//   SITE_URL=https://example.com node pipeline/indexnow.mjs /posts/my-slug

import fs from "node:fs";
import path from "node:path";

const site = (process.env.SITE_URL ?? "https://viraj-offcuts.vercel.app").replace(/\/$/, "");
const keyFile = fs.readdirSync(path.join(process.cwd(), "public")).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("no IndexNow key file in public/");
  process.exit(1);
}
const key = keyFile.replace(".txt", "");
const urls = process.argv.slice(2).map((u) => (u.startsWith("http") ? u : `${site}${u.startsWith("/") ? u : `/${u}`}`));
if (!urls.length) {
  console.error("usage: indexnow.mjs <path-or-url> [...]");
  process.exit(2);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
});
// 200 = received, 202 = received and key validation pending; both are success
console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URL(s)`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
