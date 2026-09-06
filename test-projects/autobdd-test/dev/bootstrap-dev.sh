#!/bin/bash
# Dev-loop bootstrap for autobdd-test against the mounted working-tree AutoBDD.
# Run AFTER any `npm install` in AutoBDD, which wipes native build artifacts
# (selenium-standalone drivers). Safe to re-run idempotently.
#
# Usage:  AutoBDD_DEV_ROOT=/abs/path/to/AutoBDD bash dev/bootstrap-dev.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -n "${AutoBDD_DEV_ROOT:-}" ]; then
  ABDD="$AutoBDD_DEV_ROOT"
else
  # Monorepo layout: dev/ is at <AutoBDD>/test-projects/autobdd-test/dev/, so the
  # AutoBDD root is three levels up.
  ABDD="$(cd "$SCRIPT_DIR/../../.." 2>/dev/null && pwd)"
fi
AUTODIR="$(cd "$ABDD" && pwd)"
echo "AutoBDD working tree: $AUTODIR"

# 1. (removed) @wdio/sync + fibers no longer used (async conversion, Phase 3).

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
