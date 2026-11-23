#!/usr/bin/env bash
# Offcuts writer. Run by a systemd user timer (see pipeline/install.sh) or by hand.
#
# One run = one post: pick a lane, let headless Claude Code research and write it in an
# isolated git worktree, validate it, build the site, then open a pull request. Merging the
# PR is the only thing that publishes. Your working tree is never touched.
#
# Environment switches (all optional):
#   FORCE=1          ignore the battery / "a post PR is already open" guards
#   DRY_RUN=1        do everything except push and open the PR (the branch stays local)
#   CHECK_ONLY=1     run the guards and pick a lane, then stop (uses no Claude usage)
#   LANE=<name>      force a lane: notes | explainer | news | quick
#   OFFCUTS_MODEL    model alias for the writer (default: sonnet, to go easy on Pro limits)
#   OFFCUTS_EFFORT   low | medium | high (default: medium)
#   KEEP_WORKTREE=1  keep the temporary worktree after the run (for debugging)
#   OFFCUTS_REPO     path to the repo (default: the repo this script lives in)

set -Eeuo pipefail

REPO="${OFFCUTS_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}/offcuts"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$STATE_HOME/logs" "$STATE_HOME/work"
LOG="$STATE_HOME/logs/run-$STAMP.log"
exec > >(tee -a "$LOG") 2>&1

# Always run on your Claude plan login. Keys, tokens and endpoints inherited from a parent
# shell or app (ANTHROPIC_*, CLAUDE_CODE_*) would silently bill an API account or point at
# another endpoint, so they are removed. Set OFFCUTS_KEEP_ENV=1 to opt out.
if [ "${OFFCUTS_KEEP_ENV:-0}" != 1 ]; then
  for v in $(compgen -e); do
    case "$v" in
      ANTHROPIC_*|CLAUDE_CODE_*|CLAUDE_AGENT_*|CLAUDE_DESKTOP_*|CLAUDE_PREVIEW_*|CLAUDECODE|CLAUDE_PID|CLAUDE_EFFORT) unset "$v" ;;
    esac
  done
fi

FORCE="${FORCE:-0}"
DRY_RUN="${DRY_RUN:-0}"
CHECK_ONLY="${CHECK_ONLY:-0}"
MODEL="${OFFCUTS_MODEL:-sonnet}"
EFFORT="${OFFCUTS_EFFORT:-medium}"
BASE_BRANCH="main"

say() { echo "[offcuts $(date +%H:%M:%S)] $*"; }
notify() { notify-send -a Offcuts "$1" "$2" >/dev/null 2>&1 || true; say "NOTIFY: $1 - $2"; }
die() { notify "Offcuts run failed" "$1 (log: $LOG)"; exit 1; }
skip() { say "skip: $1"; exit 0; }

WT=""
BRANCH=""
PUBLISHED=0
# any unexpected failure still tells you, instead of dying silently
trap 'notify "Offcuts run failed" "unexpected error on line $LINENO (log: $LOG)"' ERR
cleanup() {
  local code=$?
  cd "$REPO" 2>/dev/null || true
  if [ -n "$WT" ] && [ -d "$WT" ] && [ "${KEEP_WORKTREE:-0}" != 1 ]; then
    git worktree remove --force "$WT" >/dev/null 2>&1 || true
  fi
  # an unfinished run leaves no stray branch behind
  if [ -n "$BRANCH" ] && [ "$PUBLISHED" != 1 ]; then
    git branch -D "$BRANCH" >/dev/null 2>&1 || true
  fi
  exit $code
}
trap cleanup EXIT

# ── single instance ─────────────────────────────────────────────────────────
exec 9>"$STATE_HOME/lock"
flock -n 9 || skip "another run is already in progress"

say "repo: $REPO  model: $MODEL  effort: $EFFORT  force=$FORCE dry_run=$DRY_RUN"

# ── guards ──────────────────────────────────────────────────────────────────
command -v claude >/dev/null || die "claude CLI not found on PATH"
command -v node >/dev/null || die "node not found on PATH"
if [ -z "${OFFCUTS_TEST_WRITER:-}" ]; then
  claude auth status 2>/dev/null | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.exit(JSON.parse(d).loggedIn?0:1)}catch{process.exit(1)}})' \
    || die "the claude CLI is not signed in. Run 'claude auth login' in a terminal once (the desktop app's login is separate)"
fi
git -C "$REPO" rev-parse --verify -q "$BASE_BRANCH" >/dev/null \
  || die "branch '$BASE_BRANCH' has no commits yet. Make a baseline commit first (see pipeline/README.md)"

on_battery() {
  local ac=0 discharging=0 p
  for p in /sys/class/power_supply/*; do
    [ -r "$p/type" ] || continue
    case "$(cat "$p/type")" in
      Mains) [ "$(cat "$p/online" 2>/dev/null || echo 0)" = 1 ] && ac=1 ;;
      Battery) [ "$(cat "$p/status" 2>/dev/null)" = "Discharging" ] && discharging=1 ;;
    esac
  done
  [ "$ac" = 0 ] && [ "$discharging" = 1 ]
}
if [ "$FORCE" != 1 ] && on_battery; then
  skip "on battery power (a research and build run is heavy). Plug in or run with FORCE=1"
fi

curl -fsS --max-time 8 -o /dev/null https://api.github.com 2>/dev/null \
  || skip "no network"

HAS_ORIGIN=0
git -C "$REPO" remote get-url origin >/dev/null 2>&1 && HAS_ORIGIN=1
HAS_GH=0
command -v gh >/dev/null && gh auth status >/dev/null 2>&1 && HAS_GH=1

if [ "$HAS_ORIGIN" = 1 ]; then
  git -C "$REPO" fetch -q origin "$BASE_BRANCH" || say "warn: could not fetch origin"
  BASE="origin/$BASE_BRANCH"
  git -C "$REPO" rev-parse --verify -q "$BASE" >/dev/null || BASE="$BASE_BRANCH"
else
  BASE="$BASE_BRANCH"
fi

# one unreviewed post at a time
if [ "$FORCE" != 1 ]; then
  if [ "$HAS_GH" = 1 ] && [ "$HAS_ORIGIN" = 1 ]; then
    OPEN="$(cd "$REPO" && gh pr list --state open --json headRefName -q '.[] | select(.headRefName | startswith("post/")) | .headRefName' 2>/dev/null | head -3 || true)"
    [ -z "$OPEN" ] || skip "a post PR is still open ($OPEN). Merge or close it first"
  else
    LOCAL="$(git -C "$REPO" branch --list 'post/*' --no-merged "$BASE_BRANCH" | tr -d ' *' | head -3 || true)"
    [ -z "$LOCAL" ] || skip "an unmerged post branch exists ($LOCAL). Merge or delete it first"
  fi
fi

# ── isolated worktree ───────────────────────────────────────────────────────
if [ "$CHECK_ONLY" != 1 ]; then
  BRANCH="post/pending-$STAMP"
  WT="$STATE_HOME/work/$STAMP"
  git -C "$REPO" worktree add -q -b "$BRANCH" "$WT" "$BASE"
  cd "$WT"
  say "installing dependencies in the worktree"
  npm ci --prefer-offline --no-audit --no-fund --silent || die "npm ci failed"
else
  # check-only still needs the pipeline files to pick a lane; use the repo as it is
  cd "$REPO"
fi

# ── lane and prompt ─────────────────────────────────────────────────────────
PICK="$(node pipeline/pipeline.mjs pick ${LANE:+--lane "$LANE"})"
jget() { printf '%s' "$PICK" | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));process.stdout.write(String(j[process.argv[1]]??""))' "$1"; }
POST_LANE="$(jget lane)"
NOTES_FILE="$(jget notesFile)"
say "lane: $POST_LANE${NOTES_FILE:+  notes: $NOTES_FILE}"

if [ "$CHECK_ONLY" = 1 ]; then
  say "check-only: guards passed. Would write a '$POST_LANE' post using model '$MODEL'. Stopping."
  exit 0
fi

PROMPT="$(DATE="$(date +%Y-%m-%d)" LANE_NAME="$POST_LANE" BRIEF="$(jget brief)" EXISTING="$(node pipeline/pipeline.mjs existing)" node -e '
  const fs = require("fs");
  let t = fs.readFileSync("pipeline/PROMPT.md", "utf8");
  t = t.replaceAll("{{DATE}}", process.env.DATE).replaceAll("{{LANE}}", process.env.LANE_NAME)
       .replaceAll("{{LANE_BRIEF}}", process.env.BRIEF).replaceAll("{{EXISTING}}", process.env.EXISTING);
  process.stdout.write(t);
')"

# ── writer ──────────────────────────────────────────────────────────────────
claude_run() {
  # $1 = prompt, remaining args = extra claude flags (e.g. --continue)
  local prompt="$1"; shift
  # test seam: a script that plays the writer, so the steps after the model can be tested for free
  if [ -n "${OFFCUTS_TEST_WRITER:-}" ]; then
    say "TEST WRITER: $OFFCUTS_TEST_WRITER"
    "$OFFCUTS_TEST_WRITER" "$prompt"
    return
  fi
  local out="$STATE_HOME/logs/claude-$STAMP-$RANDOM.json" rc=0
  # dontAsk + an explicit allow-list: web research and file edits in this worktree, no shell.
  timeout --signal=TERM 40m claude -p "$prompt" "$@" \
    --model "$MODEL" --effort "$EFFORT" \
    --permission-mode dontAsk \
    --allowedTools "Read,Write,Edit,Glob,Grep,WebSearch,WebFetch" \
    --disallowedTools "Bash" \
    --append-system-prompt "$(cat pipeline/VOICE.md)" \
    --output-format json > "$out" 2> "$out.err" || rc=$?
  local msg iserr
  msg="$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(String(j.result||""))}catch{}' "$out")"
  [ -n "$msg" ] || msg="$(head -c 300 "$out.err" 2>/dev/null || true)"
  iserr="$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(j.is_error?"1":"0")}catch{process.stdout.write("1")}' "$out")"
  if [ "$rc" != 0 ] || [ "$iserr" = 1 ]; then
    say "claude failed (exit $rc): $msg"
    case "$msg" in
      *[Nn]ot\ logged\ in*|*/login*) die "Claude is not signed in. Run 'claude auth login' in a terminal" ;;
      *[Ll]imit*|*[Uu]sage*|*[Qq]uota*|*[Rr]ate*|*[Oo]verloaded*) die "Claude plan limit or capacity reached. The next timer slot will try again" ;;
      *) die "claude run failed: ${msg:0:160}" ;;
    esac
  fi
  say "claude done"
}

say "writing the post (this can take 10 to 25 minutes)"
claude_run "$PROMPT"

find_post() {
  git ls-files --others --exclude-standard content/posts | grep -E '\.mdx$' || true
}
NEW_POSTS="$(find_post)"
[ -n "$NEW_POSTS" ] || die "the writer did not create a post"
[ "$(printf '%s\n' "$NEW_POSTS" | wc -l)" = 1 ] || die "the writer created more than one post: $NEW_POSTS"
POST_FILE="$NEW_POSTS"
SLUG="$(basename "$POST_FILE" .mdx)"
say "post: $POST_FILE"
[ -f REVIEW.md ] || say "warn: no REVIEW.md written; the PR will have a generic description"

# ── validate (one repair pass) ──────────────────────────────────────────────
validate() { node pipeline/validate.mjs "$POST_FILE" --lane "$POST_LANE" --review REVIEW.md 2>&1; }
if ! VOUT="$(validate)"; then
  say "validator found problems:"; echo "$VOUT"
  claude_run "The validator rejected the post you just wrote. Fix every ERROR below in $POST_FILE (rewrite the offending sentences naturally; do not just swap words). Do not add claims you cannot source. Keep REVIEW.md accurate. Validator output:

$VOUT

Reply with one line when done." --continue
  VOUT="$(validate)" || { echo "$VOUT"; die "post still fails validation after one repair pass"; }
fi
echo "$VOUT" | tail -3

# ── build ───────────────────────────────────────────────────────────────────
if ! BOUT="$(npm run build 2>&1)"; then
  say "build failed:"; echo "$BOUT" | tail -30
  claude_run "The site build failed with this output. Fix $POST_FILE (most likely an MDX or frontmatter syntax problem; escape stray < and { characters in prose). Build output:

$(echo "$BOUT" | tail -40)

Reply with one line when done." --continue
  BOUT="$(npm run build 2>&1)" || { echo "$BOUT" | tail -30; die "build still fails after one repair pass"; }
fi
say "build ok"

# ── commit ──────────────────────────────────────────────────────────────────
TITLE="$(node -e 'const m=require("gray-matter");process.stdout.write(m(require("fs").readFileSync(process.argv[1],"utf8")).data.title)' "$POST_FILE")"
node pipeline/pipeline.mjs record "$SLUG" "$POST_LANE" "$NOTES_FILE"
git add "$POST_FILE" pipeline/state.json ${NOTES_FILE:+"$NOTES_FILE"}
git commit -q -m "post: $TITLE" -m "Lane: $POST_LANE. Drafted by the Offcuts writer pipeline; reviewed in the pull request before merge."
# never collide with an existing branch of the same name (a leftover dry run, say)
FINAL="post/$SLUG"
if git show-ref --verify -q "refs/heads/$FINAL" || git ls-remote --exit-code --heads origin "$FINAL" >/dev/null 2>&1; then
  FINAL="post/$SLUG-$(date +%m%d%H%M)"
  say "branch post/$SLUG already exists; using $FINAL"
fi
git branch -m "$BRANCH" "$FINAL"
BRANCH="$FINAL"
PUBLISHED=1

BODY="$STATE_HOME/logs/pr-body-$SLUG.md"
{
  if [ -f REVIEW.md ]; then cat REVIEW.md; else echo "(The writer did not produce a REVIEW.md.)"; fi
  printf '\n---\n\n### Before you merge\n\n'
  printf -- '- [ ] I read the whole post and it sounds like me\n'
  printf -- '- [ ] I opened each link under "Claims to verify" and it says what the post says\n'
  printf -- '- [ ] Every opinion listed above is one I hold\n'
  printf -- '- [ ] The Vercel preview looks right\n\n'
  printf 'Lane: `%s`. Merging this pull request publishes the post.\n' "$POST_LANE"
} > "$BODY"

# ── publish for review ──────────────────────────────────────────────────────
if [ "$DRY_RUN" = 1 ]; then
  notify "Offcuts dry run done" "Branch $BRANCH is committed locally; nothing was pushed."
  say "dry run: review body saved at $BODY"
elif [ "$HAS_ORIGIN" = 1 ] && [ "$HAS_GH" = 1 ]; then
  git push -q -u origin "$BRANCH"
  PR_URL="$(gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "Post: $TITLE" --body-file "$BODY")"
  notify "New draft post ready for review" "$TITLE - $PR_URL"
else
  notify "Post written, but no PR opened" "Branch $BRANCH is committed locally. Install and log in to gh (see pipeline/README.md). Review text: $BODY"
fi
say "done"
