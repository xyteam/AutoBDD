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
# Usage:  base-test/run.sh          (invoked by `make base-test`)
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

IMG="${AutoBDD_Image:-xyteam/autobdd-base}"; VER="${AutoBDD_Ver:-<ver>}"

printf '\033[1m'
cat <<BANNER
════════════════════════════════════════════════════════════════════════════
 AutoBDD base image — feature conformance
   image   : ${IMG}:${VER}
   display : ${DISPLAY}  ${RESOLUTION:-1920x1200x24}
   catalogue: $(feature_ids | wc -l) features — see base-test/features.sh

 reproduce ALL features:
   AutoBDD_Ver=test make base-test
 reproduce ONE feature:
   AutoBDD_Ver=test make one FEATURE=image-match
════════════════════════════════════════════════════════════════════════════
BANNER
printf '\033[0m'

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
  printf '\033[2mreproduce the full matrix:  AutoBDD_Ver=test make base-test\n'
  printf 'single feature:              AutoBDD_Ver=test make one FEATURE=<feature>\033[0m\n'
else
  printf '\033[31mfailed checks:\033[0m\n'
  for f in "${FAILED[@]}"; do printf '  - %s\n' "$f"; done
fi
printf '\033[1m════════════════════════════════════════════════════════════════════════════\033[0m\n'
[ "$FAIL" -eq 0 ]
