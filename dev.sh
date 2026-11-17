#!/usr/bin/env bash
# Start the iOS simulator + Metro (dev-client) and launch the installed dev build.
# Use this for normal JS/JSX work: edit a file, save, and Fast Refresh applies it.
set -euo pipefail

BUNDLE_ID="${BUNDLE_ID:-com.luilver-go.pantry-app}"
DEVICE_UDID="${DEVICE_UDID:-68E02AFC-0BB5-43DD-8E19-6B26B91B9156}"
DEVICE_NAME="${DEVICE_NAME:-iPhone 17 Pro}"
METRO_PORT="${METRO_PORT:-8081}"
LOG_DIR="${TMPDIR:-/tmp}/pantry"
METRO_LOG="$LOG_DIR/metro.log"

usage() {
  cat <<EOF
Usage: ./dev.sh [options]

Boots the simulator if needed, starts Metro (dev-client) if needed, then
launches the installed app. No native rebuild.

Options:
  -h, --help    Show this help and exit 0

Environment:
  DEVICE_UDID   Simulator UDID (default: $DEVICE_UDID)
  DEVICE_NAME   Simulator name for logs (default: $DEVICE_NAME)
  BUNDLE_ID     App bundle id (default: $BUNDLE_ID)
  METRO_PORT    Metro port (default: $METRO_PORT)
EOF
}

case "${1:-}" in
  -h|--help|help) usage; exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
esac

mkdir -p "$LOG_DIR"

boot_simulator() {
  if xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
    echo "Simulator already booted."
    return
  fi
  echo "Booting $DEVICE_NAME ($DEVICE_UDID)…"
  xcrun simctl boot "$DEVICE_UDID" 2>/dev/null || true
  open -a Simulator
  xcrun simctl bootstatus "$DEVICE_UDID" -b >/dev/null
}

ensure_metro() {
  if lsof -nP -iTCP:"$METRO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Metro already listening on :$METRO_PORT."
    return
  fi
  echo "Starting Metro (dev-client) on :$METRO_PORT → $METRO_LOG"
  nohup npx expo start --dev-client --port "$METRO_PORT" >>"$METRO_LOG" 2>&1 &
  for _ in $(seq 1 60); do
    if lsof -nP -iTCP:"$METRO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "Metro is up."
      return
    fi
    sleep 1
  done
  echo "Metro did not start; see $METRO_LOG" >&2
  exit 1
}

launch_app() {
  if ! xcrun simctl get_app_container booted "$BUNDLE_ID" >/dev/null 2>&1; then
    echo "App $BUNDLE_ID is not installed on the simulator." >&2
    echo "Run ./rebuild.sh once to build and install it." >&2
    exit 1
  fi
  xcrun simctl terminate booted "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl launch booted "$BUNDLE_ID"
}

boot_simulator
ensure_metro
launch_app
echo "Done. Edit JS and save — Fast Refresh applies automatically."
