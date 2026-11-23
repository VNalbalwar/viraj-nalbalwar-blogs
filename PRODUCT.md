# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) with TypeScript, Tailwind, MDX posts stored in the repo, deployed on Vercel. Motion graphics rendered with Remotion where a post needs video; in-page motion built as React components. Confirmed by Viraj in the handoff and in chat (Nov 2026).

## Users

Inferred, not yet confirmed by Viraj: engineers, students and hiring managers who land on a post from a search, dev.to, LinkedIn or a link from viraj-verse, mostly skimming on a phone first and reading on a laptop. Open decision: whether the blog also targets an audience beyond people who already know Viraj.

## Product Purpose

Viraj Nalbalwar's own technical blog. It gives his hands-on work a home he controls: Linux and systems experiments, GPU and cloud work, and recent AI/ML news seen through something he actually ran. Success: a reader finishes a post believing a real person tried the thing, learns something concrete, and remembers the site. The blog also feeds the Writing section of viraj-verse.

## Positioning

Most daily AI-news blogs summarise other people's articles. This one is written from running things himself (for example a new model on an RTX 4060, a deliberately broken Arch install, a cgroup or SELinux problem), with every outside claim linked to a live source.

## Operating Context

- Lives at its own free vercel.app URL for now (custom domain is a later one-line switch via a single env var for canonical URLs, RSS and OG images). Must stay on free tiers everywhere.
- Repo: VNalbalwar/viraj-nalbalwar-blogs on GitHub, public.
- Publishing workflow: on demand, in Claude Code. Viraj asks for a post (`/write-post`); it researches with live web search, writes an MDX post, validates and builds it, and shows it with its sources and any unsourced statements. Nothing publishes until he approves; on approval it commits and pushes to `main`, and Vercel deploys. No scheduler or cron job. Deployed at https://viraj-offcuts.vercel.app (Vercel project `viraj-offcuts`, linked to the GitHub repo).
- Cadence: whenever Viraj asks, daily or occasionally; quality over volume. Cross-posting to dev.to with a canonical URL back to this site comes after launch (Hashnode not used: its agent write access needs a paid plan).
- viraj-verse's Writing section currently syncs from the Hashnode RSS feed (9 posts); the new blog should become a source there.

## Capabilities and Constraints

- Two content lanes, both first-person: Linux and systems (about 60%: Arch, Hyprland, Quickshell, systemd, cgroups, SELinux, kernel and driver topics, OpenStack homelab, GPU/CUDA) and AI/ML and tech news (about 30%, plus about 10% quick takes).
- News posts must come from live web search with every source linked; never from model memory. No invented quotes, numbers or CEO statements under his name.
- Post frontmatter: title, description, date, tags, cover, draft, sources.
- Needed features: light and dark themes, syntax-highlighted code with copy button, table of contents, reading time, tag pages, search, RSS, sitemap, canonical URLs, generated OG images, custom MDX components (callouts, terminal blocks, diagrams, embedded motion demos).
- Posts are rendered from the repo; no database, no accounts, no comments at launch.
- Secrets (GitHub token, any tokens) live in env vars or GitHub/Vercel secrets, never in the repo or in chat.
- Undecided: custom domain, search implementation, whether tag pages launch with the first release.

## Brand Commitments

- Author: Viraj Nalbalwar. Voice: casual, a little Gen Z, self-aware and funny, honest about what broke; informal, concise, direct. Titles should hook and be specific. Posts must read like a person wrote them, not like generated copy.
- Viraj's explicit requests (Nov 2026): the blog gets its own distinct skin rather than reusing viraj-verse's look; no generic AI-looking design or copy; much more creative motion graphics than a typical blog; typos and slop checked with the Impeccable and frontend-design skills.
- Binding (Viraj, Nov 2026): the blog's design language must contain nothing derived from Viraj himself or his projects, research, tools, machines or LinkedIn lines. No GPU, thermal, kernel, terminal, Arch or "systems under pressure" motifs in the name, palette, motion or imagery. It is carved fresh and stands on its own. This does not restrict post content, which is about his real work.
- viraj-verse's rejection of forced personal-fact themes (cube theme, thermal theme) is the same preference seen earlier.

## Evidence on Hand

- Viraj's facts, experience and research list are in ~/viraj-portfolio/PRODUCT.md and src/content/profile: Mastercard intern (May to Jul 2026), Jio cloud intern (Jun to Jul 2025), RHCSA (Aug 2026), IEEE HiPC 2026 Student Research Symposium paper (Bengaluru, Dec 16 to 19, 2026), thermal-aware Kubernetes scheduling paper at EESP/ISC 2026, Arch + Hyprland on an i7-13700HX and RTX 4060.
- Seed material for first posts: the two research papers, his Arch/Hyprland/Quickshell rice, the Linux series on Hashnode (viraj-verse.hashnode.dev).
- No posts, no readers' analytics, no testimonials yet; do not fabricate any.

## Product Principles

1. A real person ran it: first-hand evidence outranks summary.
2. Every outside claim has a link; if it cannot be sourced it does not ship.
3. Nothing publishes without Viraj's merge.
4. Motion explains the post (a scheduler, a cgroup tree, a latency curve), it is not decoration.
5. Free forever, and fast and readable on a phone first.

## Accessibility & Inclusion

Motion must respect prefers-reduced-motion with a still equivalent that carries the same information. Visible keyboard focus and sufficient contrast in both themes.
