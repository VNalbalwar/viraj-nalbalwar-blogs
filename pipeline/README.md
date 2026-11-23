# Writing posts

There is no timer and no background job. When you want a post, open Claude Code in this repo and ask for one:

```
/write-post
/write-post news
/write-post explainer why systemd timers skip runs when a laptop sleeps
```

One request produces one post. Ask again for another, as often as you like. The `write-post` skill (`.claude/skills/write-post/SKILL.md`) does the whole job:

1. picks a lane and a topic (or uses yours),
2. researches with live web search and reads the pages it relies on,
3. writes `content/posts/<slug>.mdx`,
4. runs the validator and a site build,
5. shows you the post with every claim and its source, anything not backed by a source, and every opinion,
6. **waits for your approval**. Publish, Revise, or Discard.

On Publish it records the topic, commits, pushes to `main`, and Vercel deploys the site. It then pings IndexNow (Bing and other engines) about the new URL. Nothing is published without your yes.

## Lanes

`lanes.json` sets the rotation: `notes, explainer, news, explainer, news, quick`.

- **notes**: a hands-on post written only from a note you left in `pipeline/notes/` with `status: ready`. With no ready notes this becomes an explainer. It is the only lane allowed to say "I ran...", because it is the only one with real material.
- **explainer**: how something works, built from official docs and papers.
- **news**: something from the last 10 days in AI/ML, Linux, cloud or tooling, with a primary source.
- **quick**: a short take, under 550 words.

Name a lane or a topic in the request to override the rotation.

## The checks (`validate.mjs`)

Required frontmatter, minimum sources from distinct domains, every link resolving (404s fail), every body link listed in `sources`, word counts per lane, machine-sounding phrases, em-dash and emoji limits, no invented first-person experience outside the notes lane, no invented terminal output, no conclusion section, one callout at most, no source linked more than twice, at most two direct quotes.

It cannot judge whether a post is true or sounds like you. That is your review in step 6.

## Other files

- `VOICE.md`: the truth, byline and voice rules every post follows (edit this to change how posts read).
- `topics.md`: the topic bank. Add ideas at the bottom.
- `notes/`: your hands-on notes (see `notes/README.md`).
- `state.json`: which lane is next and which topics are covered.
- `pipeline.mjs`: lane picking and state recording. `indexnow.mjs`: pings IndexNow.
