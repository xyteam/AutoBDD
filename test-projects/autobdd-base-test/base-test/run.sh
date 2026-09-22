#!/bin/bash
# run.sh — full feature-conformance run for xyteam/autobdd-base.
#
# Exercises every feature the base image offers, grouped so the output reads as a
# feature list rather than a wall of assertions. Each feature prints the single
# command that reproduces it on its own:
#
#     base-test/one.sh <feature>            # inside the image
#     make one FEATURE=<feature>            # from the repo (host)
#
# The catalogue lives in features.sh, so this driver and one.sh can never disagree.
#
# Usage:  base-test/run.sh          (run inside the image: `make docker-run jobs="base-test"`)
# Env:    DISPLAY, RESOLUTION       (default :1, 1920x1200x24)
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
DISPLAY="${DISPLAY:-:1}"; export DISPLAY
export OMP_THREAD_LIMIT="${OMP_THREAD_LIMIT:-1}" LC_ALL="${LC_ALL:-C}" LC_CTYPE="${LC_CTYPE:-C}"

WORK="$(mktemp -d /tmp/base-test.XXXXXX)"
VNC_PID=""
# shellcheck source=features.sh
. "$HERE/features.sh"

cleanup(){ [ -n "$VNC_PID" ] && kill "$VNC_PID" 2>/dev/null; x_stop; rm -rf "$WORK"; }
trap cleanup EXIT

# The image's own build stamp is the honest identity here: AutoBDD_Ver is not exported
# into the container, and a placeholder version would misreport which image ran.
IMG="${AutoBDD_Image:-xyteam/autobdd-base}"
STAMP="$(sed -n 's/^built=//p' /etc/autobdd-versions 2>/dev/null)"; STAMP="${STAMP:-unknown}"

printf '\033[1m'
cat <<BANNER
════════════════════════════════════════════════════════════════════════════
 AutoBDD base image — feature conformance
   image   : ${IMG}  (built ${STAMP})
   display : ${DISPLAY}  ${RESOLUTION:-1920x1200x24}
   surface : ${TARGET_BIN}
   catalogue: $(feature_ids | wc -l) features — see base-test/features.sh

 reproduce ALL features (inside the image):
   AutoBDD_Ver=<v> make docker-run jobs="base-test"
 reproduce ONE feature:
   AutoBDD_Ver=<v> make one FEATURE=image-match
 list the catalogue:
   AutoBDD_Ver=<v> make docker-run jobs="base-test/one.sh --list"
════════════════════════════════════════════════════════════════════════════
BANNER
printf '\033[0m'

# The suite drives the interface *inside* the image. Run from a bare host it would fail
# once per assertion with missing-tool noise, which is how a first-time user gets lost.
if ! command -v "$TARGET_BIN" >/dev/null 2>&1; then
  printf '\033[31m%s is not on PATH — this suite runs inside the image, not on the host.\033[0m\n' "$TARGET_BIN" >&2
  printf 'Run it as:\n  AutoBDD_Ver=<v> make docker-run jobs="base-test"\nor:\n  AutoBDD_Ver=<v> docker compose run --rm autobdd-base-test make base-test\n' >&2
  exit 2
fi

x_start

CUR_GROUP=""
while IFS='|' read -r grp id desc; do
  [ "$grp" = "$CUR_GROUP" ] || { group "$grp"; CUR_GROUP="$grp"; }
  run_feature "$id"
done < <(printf '%s\n' "${FEATURES[@]}")

printf '\n\033[1m════════════════════════════════════════════════════════════════════════════\033[0m\n'
printf '\033[1mfeature conformance: %d passed, %d failed\033[0m\n' "$PASS" "$FAIL"
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m%s\033[0m\n' "ALL FEATURES OK"
  printf '\033[2mreproduce the full matrix:  AutoBDD_Ver=<v> make docker-run jobs="base-test"\n'
  printf 'single feature:              AutoBDD_Ver=<v> make one FEATURE=<feature>\033[0m\n'
else
  printf '\033[31mfailed checks:\033[0m\n'
  for f in "${FAILED[@]}"; do printf '  - %s\n' "$f"; done
fi
printf '\033[1m════════════════════════════════════════════════════════════════════════════\033[0m\n'
[ "$FAIL" -eq 0 ]
