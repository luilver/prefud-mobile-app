#!/usr/bin/env bash
# Start Metro (dev-client) in the foreground. Ctrl-C to stop.
set -euo pipefail

case "${1:-}" in
  -h|--help|help)
    cat <<EOF
Usage: ./run.sh [options]

Starts Metro (dev-client) in the foreground on :8081. Open the app with
./dev.sh (or press "i" in Metro) — JS changes hot-reload via Fast Refresh.

Options:
  -h, --help    Show this help and exit 0
EOF
    exit 0
    ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac

exec npx expo start --dev-client
