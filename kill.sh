#!/usr/bin/env bash
# Stop Metro / Expo dev servers.
set -euo pipefail

case "${1:-}" in
  -h|--help|help)
    cat <<EOF
Usage: ./kill.sh

Stops any running Metro/Expo dev servers (port 8081).
EOF
    exit 0
    ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac

pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2
if pgrep -f "expo start|metro" >/dev/null 2>&1; then
  echo "Some Metro/Expo processes are still running:" >&2
  pgrep -fl "expo start|metro" >&2 || true
  exit 1
fi
echo "No expo/metro processes running."
