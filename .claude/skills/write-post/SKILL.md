---
name: write-post
description: Research, write and publish one Offcuts blog post in this session, with the author's approval before anything goes live. Use when the author asks for a blog post, says "write a post", "do the blog", "post for today", or names a topic or lane (notes, explainer, news, quick).
---

# Write one Offcuts post

One invocation produces one post, published only after the author says yes. Do not schedule anything and do not publish without approval.

Arguments (all optional): a lane (`notes`, `explainer`, `news`, `quick`) and/or a topic. With no lane, rotate as below. With no topic, choose one.

## Rules that never bend

Read `pipeline/VOICE.md` first and follow it exactly. In particular:
- every factual claim, including "how it works" explanations, comes from a page you fetched in this run, and is listed in `sources`;
- no invented experience, quotes or terminal output; the byline is Viraj's;
- never mention that the post was written or assisted by an AI tool, a model, Claude or a pipeline;
- keep the source's strength ("people are expecting" is not "widely expected"), and label every concluding opinion;
- every post, in every lane and on any topic, carries meaningful visuals (see below), with real pictures preferred and every picture credited.

## Images and motion graphics (every post)

The goal is a post that is lively to read and shows things instead of only describing them.

**How many.** Use as many visuals as the content can justify, within the lane's `visuals` range in `pipeline/lanes.json` (the minimum and maximum). Look at each section and ask what the reader would want to see there. Spread the visuals through the post. Never add one just to reach a number.

**Pictures first.** For anything that can be photographed or captured, look for a real image before drawing a graphic: the people, products, hardware, places, events, documents, interfaces or published charts the post is about. Aim for at least one real image in every post. Use the motion graphics (`Diagram`, `Stack`, `Bars`, `Timeline`, `Compare`, `Flow`) for what a picture cannot show, such as flows, structures, numbers and sequences, and alongside the pictures. If no usable image exists, use motion graphics and tell the author what you searched and why each candidate was rejected.

**Meaningful** means the picture shows what that section is about. No stock filler, decoration or loosely related photos. A caption must never let an older or unrelated photo pass as the event in the post: say who or what is shown, and when and where if the source page says so.

**What may be used.** A credit alone is not permission. An image needs one of these:
- public domain or CC0;
- CC BY or CC BY-SA;
- an official press kit, media library or newsroom image whose published terms allow this use;
- a photo or screenshot the author supplies and has the right to publish.

Do not use news-site or agency photos (Reuters, AP, Getty and the like), social media posts, image search results with no stated licence, NonCommercial or NoDerivatives licences, or anything whose terms you could not read. Read the licence on the image's own page or the publisher's terms page, fetched in this run, not from a search result. If unsure, leave it out. No photorealistic generated images; the generated-illustration rule is in `pipeline/VOICE.md`.

**Ask before downloading.** List every image you want with its filename, source page, creator, licence and file size, and ask the author once with the question tool. Download only the ones they approve. Approval from an earlier post does not carry over.

**Credit and storage.** Save files in `public/posts/<slug>/` (webp or jpg, at most 1400px wide), never hotlink, and use `<Figure>` with:
- `alt`: what the picture shows;
- `caption`: why it is here, plus any change you made (cropped, resized, converted);
- `credit`: creator and where it came from;
- `creditHref`: the image's own page. Also list that page in `sources`;
- the permission: for Creative Commons, `license` (the name, such as "CC BY 4.0") and `licenseHref` (the licence's page); otherwise name the public domain status or terms in `credit`;
- `narrow` for portraits and other tall or square pictures, so they do not fill the screen.

Follow any extra attribution wording the licence or press terms ask for.

## Steps

1. **Pick the lane.** Run `node pipeline/pipeline.mjs pick` (add `--lane <name>` if the author named one). The `notes` lane only runs when a ready note exists in `pipeline/notes/`; otherwise it becomes an explainer. Read the lane's brief and limits from the JSON.
2. **Choose the topic.** See `pipeline/topics.md`, `node pipeline/pipeline.mjs existing`, and the topics already in `pipeline/state.json`. For news, WebSearch for items from the last 10 days and prefer primary sources. Pick something a developer would search for. Tell the author the topic and lane in one line, then continue (do not wait).
3. **Research.** WebSearch, then WebFetch and read every page you will rely on. Note exact numbers, names, versions and dates as the pages state them. Prefer the primary source; say so if you could only reach a secondary report.
4. **Write** `content/posts/<slug>.mdx` using the frontmatter in `content/posts/component-lab.mdx` (title, description 90 to 160 chars, today's date, 2 to 4 lowercase tags, `accent`, optionally `motif`, `draft: false`, `sources`). Look at that post for the MDX components. Search-friendly basics, see below.
5. **Find the images and design the visuals.** Follow "Images and motion graphics" above and the Visuals section of `pipeline/VOICE.md`. Go through the post section by section. First search for usable real images and ask before downloading them, then build the motion graphics (Diagram, Stack, Bars, Timeline, Compare, Flow) from this post's own content. Give the post its own accent and scene, and caption every visual. Every lane needs visuals, quick takes included.
6. **Validate.** Run `node pipeline/validate.mjs content/posts/<slug>.mdx --lane <lane>`. Fix every ERROR by rewriting the sentences naturally (not by swapping words). At most two rounds; if it still fails, say what is wrong and stop.
7. **Re-check against the sources.** Reread the post once against your notes: numbers, qualifiers, quotes verbatim, every link. Remove anything you cannot support.
8. **Build.** `npm run build` must pass.
9. **Show the author the draft for review.** Give them, in chat:
   - the title, description, slug and word count;
   - a short summary of what the post says;
   - **Claims to verify**: every factual statement with the source URL it came from, including every number, label and relationship in a figure;
   - **Images**: each picture used, with its creator, licence or terms and page link; then what else you searched or rejected, and why (required when the post has no real image);
   - **Background knowledge used**: anything not supported by a fetched page (aim for none);
   - **Opinions**: every concluding or judgement sentence (or "None");
   - **Could not confirm**.
   Offer a preview: start the dev server (`preview_start` offcuts-dev) and open `/posts/<slug>` if the author wants to see it rendered.
10. **Ask for approval** with the question tool: Publish, Revise (the author says what to change, then repeat from step 5), or Discard (delete the file).
11. **On Publish only:**
    - `node pipeline/pipeline.mjs record <slug> <lane> [notes-file]`
    - `git add content/posts/<slug>.mdx pipeline/state.json public/posts/<slug>/ [notes-file] [any pipeline or site file you had to fix]` and commit as `post: <title>`
    - `git push origin main` (the push deploys the site automatically)
    - once the deployment is ready, check that `https://viraj-offcuts.vercel.app/posts/<slug>` returns 200 (replace the host if `NEXT_PUBLIC_SITE_URL` changed), then run `node pipeline/indexnow.mjs /posts/<slug> /` to notify Bing and other IndexNow engines
    - tell the author the live URL, and that Google picks the post up through the sitemap (and faster if they request indexing in Search Console).

## Search-friendly basics

- One post answers one search intent. Put the main phrase in the title near the front, in the slug, and in the first paragraph, naturally. Titles under about 60 characters when possible.
- The description is a real answer-in-one-sentence, 120 to 160 characters, not a teaser.
- The first two sentences state the answer or the point, then the post earns it.
- Headings say what the section says. Link to older Offcuts posts when relevant (`/posts/<slug>`); tags should be specific topics.
- Never pad for length. Thin or repeated content hurts more than a short, complete post.
