#!/bin/bash
# one.sh — reproduce ONE base-image feature, or one whole group.
#
#     base-test/one.sh <feature>      e.g. base-test/one.sh image-maxcount
#     base-test/one.sh <group>        e.g. base-test/one.sh D    (every D-group feature)
#     base-test/one.sh --list         list the catalogue
#
# It runs exactly the checks the full suite runs for that feature (same code path in
# features.sh), so a green single run and a green full run mean the same thing.
#
# Usage:  base-test/one.sh <feature|group|--list>
# Env:    DISPLAY, RESOLUTION       (default :1, 1920x1200x24)
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
DISPLAY="${DISPLAY:-:1}"; export DISPLAY
export OMP_THREAD_LIMIT="${OMP_THREAD_LIMIT:-1}" LC_ALL="${LC_ALL:-C}" LC_CTYPE="${LC_CTYPE:-C}"

WORK="$(mktemp -d /tmp/base-one.XXXXXX)"
# shellcheck source=features.sh
. "$HERE/features.sh"

cleanup(){ x_stop; rm -rf "$WORK"; }
trap cleanup EXIT

usage(){
  cat <<USAGE
usage: base-test/one.sh <feature|group|--list>

  <feature>  run one feature (e.g. image-match, action-hover, ocr-detect)
  <group>    run a whole group by letter (A..H — see --list)
  --list     print the catalogue

from the repo (host):
  AutoBDD_Ver=test make one FEATURE=image-match
USAGE
}

if [ $# -ne 1 ]; then usage; exit 2; fi

if [ "$1" = "--list" ] || [ "$1" = "-l" ]; then
  width="$(feature_ids | awk '{ if (length($0) > m) m = length($0) } END { print m }')"
  printf '\033[1m%-*s  %s\033[0m\n' "$width" "feature" "what it checks"
  prev=""
  while IFS='|' read -r grp id desc; do
    [ "$grp" = "$prev" ] || { printf '\n\033[1m%s\033[0m\n' "$grp"; prev="$grp"; }
    printf '  %-*s  %s\n' "$width" "$id" "$desc"
  done < <(printf '%s\n' "${FEATURES[@]}")
  exit 0
fi

WANT="$1"
# a single group letter (A..H) selects every feature in that group
SEL="$(printf '%s\n' "${FEATURES[@]}" | awk -F'|' -v g="$WANT" 'index($1, g " —") == 1 {print $2}')"
if [ -z "$SEL" ]; then
  if printf '%s\n' "${FEATURES[@]}" | awk -F'|' -v id="$WANT" '$2==id {found=1} END {exit !found}'; then
    SEL="$WANT"
  else
    echo "one.sh: unknown feature or group '$WANT'" >&2; usage; exit 2
  fi
fi

printf '\033[1mbase-test/one.sh %s\033[0m  (display %s%s)\n' "$WANT" "$DISPLAY" "${RESOLUTION:+, ${RESOLUTION}}"
x_start

while read -r id; do [ -n "$id" ] && run_feature "$id"; done < <(printf '%s\n' "$SEL")

printf '\n\033[1mone.sh %s: %d passed, %d failed\033[0m\n' "$WANT" "$PASS" "$FAIL"
if [ "$FAIL" -ne 0 ]; then for f in "${FAILED[@]}"; do printf '  - %s\n' "$f"; done; fi
[ "$FAIL" -eq 0 ]
