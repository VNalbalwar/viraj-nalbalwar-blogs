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
- keep the source's strength ("people are expecting" is not "widely expected"), and label every concluding opinion.

## Steps

1. **Pick the lane.** Run `node pipeline/pipeline.mjs pick` (add `--lane <name>` if the author named one). The `notes` lane only runs when a ready note exists in `pipeline/notes/`; otherwise it becomes an explainer. Read the lane's brief and limits from the JSON.
2. **Choose the topic.** See `pipeline/topics.md`, `node pipeline/pipeline.mjs existing`, and the topics already in `pipeline/state.json`. For news, WebSearch for items from the last 10 days and prefer primary sources. Pick something a developer would search for. Tell the author the topic and lane in one line, then continue (do not wait).
3. **Research.** WebSearch, then WebFetch and read every page you will rely on. Note exact numbers, names, versions and dates as the pages state them. Prefer the primary source; say so if you could only reach a secondary report.
4. **Write** `content/posts/<slug>.mdx` using the frontmatter in `content/posts/component-lab.mdx` (title, description 90 to 160 chars, today's date, 2 to 4 lowercase tags, `draft: false`, `sources`). Look at that post for the MDX components. Search-friendly basics, see below.
5. **Validate.** Run `node pipeline/validate.mjs content/posts/<slug>.mdx --lane <lane>`. Fix every ERROR by rewriting the sentences naturally (not by swapping words). At most two rounds; if it still fails, say what is wrong and stop.
6. **Re-check against the sources.** Reread the post once against your notes: numbers, qualifiers, quotes verbatim, every link. Remove anything you cannot support.
7. **Build.** `npm run build` must pass.
8. **Show the author the draft for review.** Give them, in chat:
   - the title, description, slug and word count;
   - a short summary of what the post says;
   - **Claims to verify**: every factual statement with the source URL it came from;
   - **Background knowledge used**: anything not supported by a fetched page (aim for none);
   - **Opinions**: every concluding or judgement sentence (or "None");
   - **Could not confirm**.
   Offer a preview: start the dev server (`preview_start` offcuts-dev) and open `/posts/<slug>` if the author wants to see it rendered.
9. **Ask for approval** with the question tool: Publish, Revise (the author says what to change, then repeat from step 5), or Discard (delete the file).
10. **On Publish only:**
    - `node pipeline/pipeline.mjs record <slug> <lane> [notes-file]`
    - `git add content/posts/<slug>.mdx pipeline/state.json [notes-file]` and commit as `post: <title>`
    - `git push origin main` (the push deploys the site automatically)
    - once the deployment is ready, check that `https://viraj-offcuts.vercel.app/posts/<slug>` returns 200 (replace the host if `NEXT_PUBLIC_SITE_URL` changed), then run `node pipeline/indexnow.mjs /posts/<slug> /` to notify Bing and other IndexNow engines
    - tell the author the live URL, and that Google picks the post up through the sitemap (and faster if they request indexing in Search Console).

## Search-friendly basics

- One post answers one search intent. Put the main phrase in the title near the front, in the slug, and in the first paragraph, naturally. Titles under about 60 characters when possible.
- The description is a real answer-in-one-sentence, 120 to 160 characters, not a teaser.
- The first two sentences state the answer or the point, then the post earns it.
- Headings say what the section says. Link to older Offcuts posts when relevant (`/posts/<slug>`); tags should be specific topics.
- Never pad for length. Thin or repeated content hurts more than a short, complete post.
