# Offcuts

A personal tech blog by Viraj Nalbalwar: Linux, cloud and AI, with every outside claim linked to its source. Next.js (App Router), MDX posts, Tailwind, Motion. Deployed on Vercel.

The design is a cut-paper collage world: every post gets a generated collage cover that assembles on scroll, a topic scene chosen from its tags, and stop-motion idle movement. See [DESIGN.md](DESIGN.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also what the writer pipeline runs)
npm run lint
```

Drafts (`draft: true`) show in dev and when `SHOW_DRAFTS=1`; they never ship to production.

`NEXT_PUBLIC_SITE_URL` sets the canonical URL, RSS, sitemap and OG image base. Leave it unset locally; set it on Vercel.

## Writing a post

Add `content/posts/<slug>.mdx`:

```mdx
---
title: "A specific, defensible title"
description: "One sentence, 90 to 160 characters."
date: "2026-11-24"
tags: ["linux", "systemd"]
draft: false
sources:
  - title: "Page title"
    url: "https://..."
---

Post body in MDX.
```

`content/posts/component-lab.mdx` documents every block a post can use (code, callouts, terminal replay, compare slider, flow diagram, section breaks).

## Writing posts

There is no scheduler. Open Claude Code in this repo and ask for a post (`/write-post`, optionally with a lane or topic). It researches, writes, validates and builds the post, shows it to you with its sources, and publishes (commit, push, deploy) only after you approve. Details: [pipeline/README.md](pipeline/README.md).

## Layout

```
content/posts/   MDX posts
src/app/         routes (home, posts, tags, rss.xml, sitemap, OG images)
src/components/  UI, collage covers, motion, MDX components
src/lib/         content loader, collage generator, site config
pipeline/        post workflow: voice rules, validator, lane picker, IndexNow ping
PRODUCT.md       product context
DESIGN.md        design system as built
```
