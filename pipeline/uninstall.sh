#!/usr/bin/env bash
set -euo pipefail
systemctl --user disable --now offcuts-writer.timer 2>/dev/null || true
rm -f "$HOME/.config/systemd/user/offcuts-writer.service" "$HOME/.config/systemd/user/offcuts-writer.timer"
systemctl --user daemon-reload
echo "Offcuts writer timer removed. Logs and state in ~/.local/state/offcuts are kept."
