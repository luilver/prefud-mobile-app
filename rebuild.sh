#!/usr/bin/env bash
# Native rebuild + install. Only needed when native code changes:
# new native dependency, app.json plugins/permissions, or ios/ project edits.
set -euo pipefail

BUNDLE_ID="${BUNDLE_ID:-com.luilver-go.pantry-app}"
DEVICE_UDID="${DEVICE_UDID:-68E02AFC-0BB5-43DD-8E19-6B26B91B9156}"
DEVICE_NAME="${DEVICE_NAME:-iPhone 17 Pro}"
LOG_DIR="${TMPDIR:-/tmp}/pantry"
LOG="$LOG_DIR/xcodebuild-$(date +%Y%m%d-%H%M%S).log"
APP="ios/build/Build/Products/Debug-iphonesimulator/pantryapp.app"

usage() {
  cat <<EOF
Usage: ./rebuild.sh [options]

Runs a native Debug build, installs it on the simulator, and launches it.
For JS-only changes use ./dev.sh instead (Fast Refresh, no build).

Options:
  -h, --help    Show this help and exit 0

Environment:
  DEVICE_UDID   Simulator UDID (default: $DEVICE_UDID)
  BUNDLE_ID     App bundle id (default: $BUNDLE_ID)
EOF
}

case "${1:-}" in
  -h|--help|help) usage; exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
esac

mkdir -p "$LOG_DIR"

echo "Building… log: $LOG"
xcodebuild \
  -workspace ios/pantryapp.xcworkspace \
  -scheme pantryapp \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination "id=$DEVICE_UDID" \
  -derivedDataPath ios/build \
  build \
  SWIFT_STRICT_CONCURRENCY=minimal 2>&1 | tee -a "$LOG"

if [ ! -d "$APP" ]; then
  echo "Build finished but $APP is missing; see $LOG" >&2
  exit 1
fi

if ! xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
  echo "Booting $DEVICE_NAME ($DEVICE_UDID)…"
  xcrun simctl boot "$DEVICE_UDID" 2>/dev/null || true
  open -a Simulator
  xcrun simctl bootstatus "$DEVICE_UDID" -b >/dev/null
fi

xcrun simctl install booted "$APP"
xcrun simctl terminate booted "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl launch booted "$BUNDLE_ID"
echo "Rebuilt, installed, and launched."
