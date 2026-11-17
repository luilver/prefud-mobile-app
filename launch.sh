#!/usr/bin/env bash
# Boot the simulator (if needed) and launch the installed app. Thin alias for dev.sh.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/dev.sh" "$@"
