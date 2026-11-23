#!/usr/bin/env node
// Mechanical checks for a generated post. Prints problems and exits 1 if any are errors.
//   node pipeline/validate.mjs content/posts/<slug>.mdx --lane <lane> [--offline]
//
// This cannot judge whether a post is good or true. It catches the failures a machine can:
// missing fields, thin sourcing, dead links, invented first-person experience, invented
// terminal output, and the phrases that make a post read as machine-written.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const laneName = args[args.indexOf("--lane") + 1];
const offline = args.includes("--offline");
const reviewPath = args.includes("--review") ? args[args.indexOf("--review") + 1] : null;
if (!file || !laneName) {
  console.error("usage: validate.mjs <file> --lane <lane> [--offline]");
  process.exit(2);
}

const lanes = JSON.parse(fs.readFileSync(path.join(process.cwd(), "pipeline", "lanes.json"), "utf8")).lanes;
const lane = lanes[laneName];
if (!lane) {
  console.error(`unknown lane ${laneName}`);
  process.exit(2);
}

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const raw = fs.readFileSync(file, "utf8");
const { data: fm, content } = matter(raw);
const slug = path.basename(file).replace(/\.mdx?$/, "");

// ── frontmatter ────────────────────────────────────────────────────────────
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) err(`filename "${slug}" must be kebab-case`);
if (typeof fm.title !== "string" || !fm.title.trim()) err("missing title");
else {
  if (fm.title.length > 90) err(`title is ${fm.title.length} chars (max 90)`);
  else if (fm.title.length > 65) warn(`title is ${fm.title.length} chars; search results cut titles off around 60`);
  if (/[A-Z]{6,}/.test(fm.title)) err("title has shouting capitals");
  if (/you won'?t believe|number \d+ will|this one trick/i.test(fm.title)) err("clickbait title");
}
if (typeof fm.description !== "string") err("missing description");
else if (fm.description.length < 80 || fm.description.length > 170) err(`description is ${fm.description.length} chars (want 80 to 170)`);

const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date ?? "");
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) err("date must be yyyy-mm-dd");
else {
  const days = Math.abs(Date.now() - new Date(`${date}T00:00:00Z`).getTime()) / 864e5;
  if (days > 2) err(`date ${date} is not today`);
}
if (!Array.isArray(fm.tags) || fm.tags.length < 2 || fm.tags.length > 4) err("tags must be 2 to 4 items");
else if (fm.tags.some((t) => t !== String(t).toLowerCase() || /\s/.test(t))) err("tags must be lowercase, no spaces");
if (fm.draft !== false) err("draft must be false (the pull request is the review gate)");

// ── sources ────────────────────────────────────────────────────────────────
const sources = Array.isArray(fm.sources) ? fm.sources : [];
if (sources.length < lane.minSources) err(`needs at least ${lane.minSources} sources (has ${sources.length})`);
const sourceUrls = new Set();
for (const s of sources) {
  if (!s?.title || !s?.url) err("every source needs title and url");
  else if (!/^https:\/\//.test(s.url)) err(`source is not https: ${s.url}`);
  else sourceUrls.add(s.url.replace(/#.*$/, "").replace(/\/$/, ""));
}
if (["news", "explainer"].includes(laneName)) {
  const hosts = new Set([...sourceUrls].map((u) => new URL(u).hostname.replace(/^www\./, "")));
  if (hosts.size < 2) err("sources should come from at least 2 different domains");
}

// ── body ───────────────────────────────────────────────────────────────────
const words = content
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/<[^>]+>/g, " ")
  .split(/\s+/)
  .filter(Boolean).length;
if (words < lane.words[0]) err(`${words} words is under the ${lane.words[0]} minimum for the ${laneName} lane`);
if (words > lane.words[1] * 1.25) err(`${words} words is over the ${lane.words[1]} maximum for the ${laneName} lane`);

const prose = content.replace(/```[\s\S]*?```/g, " ");
const h2 = (content.match(/^## /gm) ?? []).length;
if (laneName !== "quick" && (h2 < 2 || h2 > 7)) err(`${h2} "##" sections (want 2 to 7)`);
if (/^# /m.test(content.replace(/```[\s\S]*?```/g, ""))) err('body has a "#" heading (the title is the h1)');
if (/^##\s+(conclusion|summary|tl;?dr|final thoughts|wrapping up)/im.test(content)) err("remove the conclusion/summary section");
if ((content.match(/<Callout/g) ?? []).length > 1) err("more than one <Callout>");
if ((content.match(/^---\s*$/gm) ?? []).length > 1) err("more than one section break");
if (/!\[[^\]]*\]\(/.test(content)) err("no markdown images: use <Figure> (with alt, caption and credit) when a picture is the evidence");

// ── identity and visuals ────────────────────────────────────────────────────
// keep these lists in sync with PAPERS and MOTIFS in src/lib/collage.ts
const ACCENTS = ["persimmon", "sun", "leaf", "blush", "pine"];
const MOTIFS = ["terminal", "cloud", "chip", "nodes", "lock", "doc", "database", "container", "clock", "branch", "chart", "globe"];
if (fm.accent === undefined) warn("no `accent` in frontmatter (the post will wear its slug's default colour)");
else if (!ACCENTS.includes(fm.accent)) err(`accent must be one of: ${ACCENTS.join(", ")}`);
if (fm.motif !== undefined && !MOTIFS.includes(fm.motif)) err(`motif must be one of: ${MOTIFS.join(", ")}`);

const FIGURES = ["Diagram", "Stack", "Bars", "Timeline", "Figure", "Flow", "Compare"];
function blocksOf(name) {
  const out = [];
  const re = new RegExp(`<${name}\\b`, "g");
  let m;
  while ((m = re.exec(content))) {
    const rest = content.slice(m.index);
    const end = rest.search(/\n\/>|\/>\s*(\n|$)|<\/[A-Za-z]+>/);
    out.push(rest.slice(0, end > 0 ? end : 3000));
  }
  return out;
}
const figureBlocks = FIGURES.flatMap((n) => blocksOf(n).map((b) => [n, b]));
if (laneName !== "quick" && figureBlocks.length === 0) err("add at least one visual (Diagram, Stack, Bars, Timeline, Compare, Flow or Figure) designed for this post");
if (figureBlocks.length > 3) err(`${figureBlocks.length} figures (max 3)`);
for (const [n, b] of figureBlocks) {
  if (n !== "Compare" && !/\bcaption\s*=/.test(b)) err(`<${n}> needs a caption that says what it shows`);
  if (n === "Figure") {
    if (!/\balt\s*=/.test(b)) err("<Figure> needs alt text");
    if (!/\bcredit\s*=/.test(b)) err("<Figure> needs a credit (where the image came from, and the licence if it is not the author's)");
    if (!/\bsrc\s*=\s*["']\/posts\//.test(b)) err("<Figure> src must be a local file in /posts/<slug>/ (never hotlink)");
  }
}

const slop = [
  "delve", "tapestry", "game-changer", "game changer", "revolutionize", "revolutionise", "unlock the", "harness the",
  "leverage", "seamless", "robust", "cutting-edge", "cutting edge", "groundbreaking", "ever-evolving", "fast-paced",
  "in today's", "realm", "embark", "elevate", "supercharge", "unleash", "testament", "pivotal", "crucial",
  "it's important to note", "it is important to note", "in conclusion", "at the end of the day", "dive into",
  "deep dive", "let's explore", "here's the thing", "whether you're a", "navigate the", "landscape", "journey",
  "furthermore", "moreover", "buckle up", "stands as",
];
const lower = prose.toLowerCase() + " " + String(fm.title ?? "").toLowerCase() + " " + String(fm.description ?? "").toLowerCase();
for (const p of slop) if (new RegExp(`(^|[^a-z])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(lower)) err(`machine-sounding phrase: "${p}"`);
if (/\bnot just\b[^.]{0,80}\bbut\b/i.test(prose)) err('"not just X but Y" construction');
const dashes = (prose.match(/—/g) ?? []).length;
if (dashes > 2) err(`${dashes} em dashes (max 2)`);
if (/[\u{1F300}-\u{1FAFF}]/u.test(raw)) err("no emoji");

// invented experience and invented output (everything except the notes lane)
if (laneName !== "notes") {
  const claims = prose.match(/\b(I|we) (ran|tried|tested|benchmarked|measured|installed|built|broke|fixed|deployed|set up|spent)\b[^.]{0,60}/gi) ?? [];
  for (const c of claims) err(`claims personal experience: "${c.trim()}"`);
  if (/\bmy (laptop|machine|rig|setup|4060|server|desktop|homelab|cluster)\b/i.test(prose)) err("describes the author's own machine or setup");
  if (/<Terminal[\s\S]*?\bout\s*:/.test(content)) err("<Terminal> out: lines are only allowed in the notes lane");
}

// links in the body must be listed as sources
const bodyLinks = [...prose.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
for (const l of bodyLinks) {
  const norm = l.replace(/#.*$/, "").replace(/\/$/, "");
  if (!sourceUrls.has(norm)) err(`body link not listed in sources: ${l}`);
}

// repeated links and heavy quoting
const linkCounts = {};
for (const m of prose.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
  const u = m[1].replace(/#.*$/, "").replace(/\/$/, "");
  linkCounts[u] = (linkCounts[u] ?? 0) + 1;
}
for (const [u, n] of Object.entries(linkCounts)) if (n > 2) err(`the same source is linked ${n} times (max 2): ${u}`);
const longQuotes = (prose.match(/["\u201c][^"\u201c\u201d\n]{40,}["\u201d]/g) ?? []).filter((q) => q.split(/\s+/).length >= 8);
if (longQuotes.length > 2) err(`${longQuotes.length} direct quotes (max 2). Paraphrase instead`);

// the review file the human reads must disclose where claims and background came from
if (reviewPath) {
  if (!fs.existsSync(reviewPath)) err(`${reviewPath} is missing: the writer must produce the review file`);
  else {
    const review = fs.readFileSync(reviewPath, "utf8");
    for (const h of ["What this post says", "Claims to verify", "Background knowledge used", "Opinions I put in", "Things I could not confirm"]) {
      if (!new RegExp(`^##\\s+${h}`, "mi").test(review)) err(`${reviewPath} is missing the "## ${h}" section`);
    }
    const bg = review.split(/^##\s+Background knowledge used/mi)[1]?.split(/^##\s/m)[0] ?? "";
    if (bg.trim() && !/^\W*none\W*$/i.test(bg.trim())) warn("the writer admitted statements from general knowledge: check the Background knowledge section of the PR");
  }
}

// ── links resolve ──────────────────────────────────────────────────────────
async function check(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (offcuts-link-check)" } });
    if (res.status === 405 || res.status === 403 || res.status === 400) {
      res = await fetch(url, { method: "GET", redirect: "follow", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (offcuts-link-check)" } });
    }
    return res.status;
  } catch (e) {
    return e?.name === "AbortError" ? "timeout" : `error:${e?.cause?.code ?? e?.message}`;
  } finally {
    clearTimeout(t);
  }
}
if (!offline) {
  const urls = [...new Set([...sourceUrls, ...bodyLinks])];
  const results = await Promise.all(urls.map(async (u) => [u, await check(u)]));
  for (const [u, s] of results) {
    if (typeof s === "number" && s >= 200 && s < 400) continue;
    if (s === 404 || s === 410 || (typeof s === "string" && /ENOTFOUND|ECONNREFUSED/.test(s))) err(`dead link (${s}): ${u}`);
    else warn(`could not verify (${s}): ${u}`); // bot walls (401/403/429/999) and slow sites are warnings
  }
}

for (const w of warns) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`${slug}: ${words} words, ${sources.length} sources, ${errors.length} errors, ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
