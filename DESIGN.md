# Design: Offcuts

A cut-paper collage world. Every cover is a collage of scissor-cut shapes generated from the post slug, and everything that moves on its own moves in stepped, stop-motion frames. Nothing in the design language is derived from the author or his projects (a binding rule in PRODUCT.md).

Source of truth: `src/app/globals.css` (tokens and components), `src/lib/collage.ts` (collage generator).

## Themes

| Token | Light (paper) | Dark (card stock) |
| --- | --- | --- |
| `--paper` | `#faf9f7` | `#141413` |
| `--paper-2` | `#efedea` | `#1f1e1c` |
| `--ink` | `#181716` | `#f4f2ee` |
| `--ink-2` (muted text) | `#53504b` | `#b5b1a9` |
| `--action` (text accents) | `#c2331a` | `#ff7f63` |

Paper colours are used for shapes only, never for text: persimmon `#ff4f2e`, sun `#ffc21a`, leaf `#2ba36b`, blush `#ffb3c7`, pine `#0f4c44`. Text on them is ink `#181716`, except pine, which takes paper `#faf9f7`.

## Type

- Display and UI: Bricolage Grotesque (variable: opsz, wdth, wght). Titles use `wdth 88` and weight 700; wordmark tiles use weight 800 and narrow to `wdth 78` on hover.
- Reading: Nunito (rounded stroke endings, soft curves) at about 18px, line height 1.72, measure 66ch.
- Code only: JetBrains Mono. Mono is never used for headings or running text.

## Shape and depth

- Shapes are straight-edged polygons (scissor facets). "Hand-cut circles" are 10-gons with 10% irregularity.
- Paper depth is a soft offset shadow (`--shadow-paper`). UI surfaces are flat with 1px ink rules; there are no cards.
- Callouts have one snipped corner (clip-path) and a small paper tab, never a coloured side border.

## Motion

- Idle: pieces and tiles "boil" in held frames (`steps(1)` between keyframes) at roughly 1s loops with per-piece offsets.
- Hover: a post row or feature re-cuts its collage (`.cut-group` ancestor, `transition: transform .32s steps(4)`). Pointer proximity flips wordmark tiles; a click re-colours one.
- Replays: terminal blocks type two characters every 60ms. The scissors in section breaks travel in 14 steps.
- Reduced motion: all idle animation stops, transitions are removed, terminals show the full transcript, section breaks render already cut.

## Author presence

The author's photo (`public/viraj-nalbalwar.jpg`) is shown cut out with scissors on four paper pieces (`Portrait`). Large on `/about`, small (with one offset persimmon piece) in `AuthorBio`, which closes every post and the home page. The footer names the author and links profiles. Facts live in `src/content/author.ts`, mirrored from the author's portfolio.

## Layout

Left aligned. Page width 78rem with fluid gutters. Home is the wordmark, one sentence, the newest post as a wide feature, then ruled rows (collage thumbnail, title and description, date). Posts use a sticky contents rail (desktop) beside a 66ch column. No kickers, no stat rows, no identical-card grids.

## Post identity and figures

Every post wears one paper colour (`accent` in frontmatter, else the colour its slug lays down first): it is the cover's ground piece, the reading bar, the contents marker and the social image. The cover's topic scene comes from the tags or a pinned `motif` (terminal, cloud, chip, nodes, lock, doc, database, container, clock, branch, chart, globe).

Figures are designed per post from its own content, never from a template: `Diagram` (paper nodes, arrows, packets hopping along flow edges in stepped frames, hover to follow a node, auto-written screen-reader description), `Stack` (layers), `Bars` (numbers from a cited source), `Timeline`, `Compare`, `Flow`, and `Figure` (a framed image with alt text and a credit). One to three per post, each with a caption. On phones a diagram scrolls sideways inside its frame with a fade and a hint.

## Writing components (MDX)

`<Callout type="note|tip|warn" title?>`, `<Terminal title lines={[{cmd}|{out}]}/>`, `<Compare before after beforeLabel afterLabel caption/>`, `<Collage seed title/>`, fenced code with `title="…"` and `{2,4-6}` line highlights, `---` for a scissor-cut section break.

## Not yet done

The independent finish review and `.impeccable/design.json` sidecar were not produced; this file was written by the builder from the shipped CSS.
