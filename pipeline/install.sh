#!/usr/bin/env bash
# Install (or update) the Offcuts writer timer for the current user. Safe to re-run.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UNIT_DIR="$HOME/.config/systemd/user"
mkdir -p "$UNIT_DIR"

for tool in claude node npm git; do
  command -v "$tool" >/dev/null || { echo "missing: $tool (install it first)"; exit 1; }
done
command -v gh >/dev/null || echo "note: gh (GitHub CLI) is not installed. Posts will be committed to a local branch until it is."

# systemd user units do not see your shell PATH, so bake in the directories that hold the tools
DIRS=""
for tool in claude node npm git gh; do
  p="$(command -v "$tool" 2>/dev/null || true)"
  [ -n "$p" ] && DIRS="$DIRS:$(dirname "$(readlink -f "$p")"):$(dirname "$p")"
done
PATHVAL="$(printf '%s' "$DIRS:/usr/local/bin:/usr/bin:/bin" | sed 's/^://' | tr ':' '\n' | awk '!s[$0]++' | paste -sd:)"

sed "s|@REPO@|$REPO|g; s|@PATH@|$PATHVAL|g" "$REPO/pipeline/systemd/offcuts-writer.service.in" > "$UNIT_DIR/offcuts-writer.service"
cp "$REPO/pipeline/systemd/offcuts-writer.timer" "$UNIT_DIR/offcuts-writer.timer"
chmod +x "$REPO/pipeline/run.sh"

systemctl --user daemon-reload
systemctl --user enable --now offcuts-writer.timer
echo
systemctl --user list-timers offcuts-writer.timer --no-pager
echo
echo "Installed. Logs: ~/.local/state/offcuts/logs   Run now: systemctl --user start offcuts-writer.service"
