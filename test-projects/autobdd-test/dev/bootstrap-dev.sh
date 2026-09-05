#!/bin/bash
# Dev-loop bootstrap for autobdd-test against the mounted working-tree AutoBDD.
# Run AFTER any `npm install` in AutoBDD, which wipes native build artifacts
# (fibers) and selenium-standalone drivers. Safe to re-run idempotently.
#
# Usage:  AutoBDD_DEV_ROOT=/abs/path/to/AutoBDD bash dev/bootstrap-dev.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -n "${AutoBDD_DEV_ROOT:-}" ]; then
  ABDD="$AutoBDD_DEV_ROOT"
else
  # dev/ is at autobdd-test/dev/; AutoBDD is the sibling repo next to autobdd-test
  ABDD="$(cd "$SCRIPT_DIR/../../AutoBDD" 2>/dev/null && pwd)"
fi
AUTODIR="$(cd "$ABDD" && pwd)"
echo "AutoBDD working tree: $AUTODIR"

# 1. Rebuild fibers (needed by @wdio/sync on Node 12; no prebuilt binary).
#    Only inside the container (Node 12) — host Node 22 would produce a wrong ABI.
if [ -d "$AUTODIR/node_modules/fibers" ] && [ "${AUTOBDD_DEV_MOUNT:-}" = "1" ]; then
  echo "* rebuilding fibers for Node $(node -v)..."
  (cd "$AUTODIR/node_modules/fibers" && node-gyp rebuild >/dev/null 2>&1)
  node -e "require('$AUTODIR/node_modules/fibers')" && echo "  fibers OK"
fi

# 2. Ensure selenium-standalone drivers exist (npm install wipes .selenium/)
DRIVER_VERSION="${CHROME_DRIVER_VERSION:-96.0.4664.45}"
if [ ! -f "$AUTODIR/node_modules/selenium-standalone/.selenium/chromedriver/${DRIVER_VERSION}-x64/chromedriver" ]; then
  echo "* installing selenium-standalone drivers (chrome $DRIVER_VERSION, geckodriver 0.26.0)..."
  (cd "$AUTODIR" && node -e "
    const ss = require('selenium-standalone');
    ss.install({
      drivers: {
        chrome:  { version: '$DRIVER_VERSION', arch: process.arch, baseURL: 'https://chromedriver.storage.googleapis.com' },
        firefox: { version: '0.26.0',         arch: process.arch, baseURL: 'https://github.com/mozilla/geckodriver/releases/download' }
      }
    }).then(() => console.log('  drivers OK')).catch(e => { console.error(e.message); process.exit(1); });
  ")
else
  echo "* selenium drivers already present (chrome $DRIVER_VERSION)"
fi

echo "dev bootstrap complete."
