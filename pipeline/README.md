# Offcuts writer pipeline

A systemd user timer on your laptop runs headless Claude Code (`claude -p`, signed in with your Claude plan, no API key). It researches and writes one post, checks it, builds the site, and opens a pull request. **Merging the PR is the only thing that publishes.**

```
timer (Mon, Wed, Fri 09:00) -> run.sh -> guards -> worktree -> claude writes post
   -> validate (+1 repair) -> npm run build (+1 repair) -> commit -> push -> PR
   -> you read it, check the links, merge -> Vercel publishes
```

## One-time setup

The repo is `VNalbalwar/viraj-nalbalwar-blogs` and `main` is pushed, so the baseline commit and the remote are already done.

1. **Sign the Claude CLI in** with your Pro account. The desktop app's login is separate, and the timer cannot run until the CLI is signed in:
   ```bash
   claude auth login
   claude auth status      # should say loggedIn: true
   ```
2. **Install the GitHub CLI and log in** (needed to open PRs):
   ```bash
   sudo pacman -S github-cli
   gh auth login
   ```
3. **Connect Vercel** to the repo (Import Project, production branch `main`), then set `NEXT_PUBLIC_SITE_URL` to your site URL. Preview deployments of PR branches give you the review link.
4. **Test without publishing anything**:
   ```bash
   CHECK_ONLY=1 ./pipeline/run.sh           # guards and lane pick, uses no Claude usage
   DRY_RUN=1 FORCE=1 LANE=quick ./pipeline/run.sh   # real run, short post, nothing pushed
   ```
5. **Turn on the schedule**:
   ```bash
   ./pipeline/install.sh
   ```

Without step 2 the runner still works: it commits the post to a local `post/<slug>` branch and sends a desktop notification.

## What it will and will not do

| Guard | Behaviour |
| --- | --- |
| Laptop was off at 09:00 | `Persistent=true`: runs once shortly after the next login |
| On battery | Skips (use `FORCE=1` to override) |
| No network | Skips |
| A `post/*` PR is still open | Skips, so unreviewed posts never pile up |
| Claude plan limit reached or login expired | Fails with a desktop notification, retries at the next slot |
| Another run in progress | Skips |
| CLI not signed in | Stops with a notification (checked for free before any model call) |

The runner removes `ANTHROPIC_*` and `CLAUDE_CODE_*` variables from its environment, so it always runs on your plan login and can never bill an API key or use a different endpoint by accident. Set `OFFCUTS_KEEP_ENV=1` to opt out.

The writer can use web search, web fetch and file edits inside a throwaway git worktree. It has no shell, and your working tree is never touched.

## Lanes

Posts rotate through `notes, explainer, news, explainer, news, quick` (see `lanes.json`).

- **notes**: a hands-on post written only from a note you left in `pipeline/notes/` with `status: ready`. With no ready notes this slot becomes an explainer. This is the only lane allowed to say "I ran...", because it is the only one with real material.
- **explainer**: how something works, built from official docs and papers.
- **news**: something from the last 10 days in AI/ML, Linux, cloud or tooling, with a primary source.
- **quick**: a short take, under 550 words.

## What the validator checks (`validate.mjs`)

Required frontmatter, minimum sources and distinct domains, every link resolving (404s fail, bot walls only warn), every body link listed in `sources`, word counts per lane, a list of machine-sounding phrases, em-dash and emoji limits, no invented first-person experience outside the notes lane, no invented terminal output, no conclusion section, and one callout at most.

It cannot judge whether a post is true or good. That is your review, and the PR description lists every claim with its source URL, every opinion, and anything the writer could not confirm.

## Operating it

```bash
systemctl --user list-timers offcuts-writer.timer      # next run
systemctl --user start offcuts-writer.service           # run now
journalctl --user -u offcuts-writer.service -n 80       # service output
ls ~/.local/state/offcuts/logs                          # per-run logs, review text, Claude output
./pipeline/uninstall.sh                                 # remove the timer
```

Change the schedule in `systemd/offcuts-writer.timer`, then re-run `./pipeline/install.sh`. Change the model with `OFFCUTS_MODEL` (default `sonnet`, to go easy on Pro limits).

## Testing the pipeline without Claude

`OFFCUTS_TEST_WRITER=/path/to/script` swaps the model for a script that writes a post into the worktree. Everything after the writer (validation, repair pass, build, commit, branch, PR text) then runs for real and uses no Claude usage:

```bash
OFFCUTS_TEST_WRITER=./my-stub.sh DRY_RUN=1 FORCE=1 LANE=quick ./pipeline/run.sh
```

## Improving the writing

Edit `VOICE.md` (rules and banned phrases), `PROMPT.md` (the task), `topics.md` (ideas), or `lanes.json` (lengths and sourcing). When a PR needs the same fix twice, put that fix in `VOICE.md` and, if it can be checked mechanically, in `validate.mjs`.

## Not included yet

Cross-posting to dev.to with a canonical URL, and Remotion video clips for posts.
