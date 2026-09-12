#!/bin/bash
# autobdd-base-test — no-browser conformance suite for xyteam/autobdd-base (L0 + L0d + L1).
#
# Validates the desktop substrate and the FROZEN screen-engine CLI seam
# (docs/CONTRACT.md) with NO browser, NO wdio, NO cucumber. This is the CI gate for
# the base image: anything built FROM autobdd-base may rely on these behaviours.
#
# Usage:  base-test/run.sh           (run.sh is invoked by `make base-test`)
# Env:    DISPLAY, RESOLUTION        (display to own; default :1, 1920x1200x24)
set -u

DISPLAY="${DISPLAY:-:1}"; export DISPLAY
export OMP_THREAD_LIMIT="${OMP_THREAD_LIMIT:-1}" LC_ALL="${LC_ALL:-C}" LC_CTYPE="${LC_CTYPE:-C}"

RES="${RESOLUTION:-1920x1200x24}"
W="${RES%%x*}"; H="$(echo "$RES" | cut -dx -f2)"
WORK="$(mktemp -d /tmp/base-test.XXXXXX)"
XVFB_PID=""; WM_PID=""; VNC_PID=""

PASS=0; FAIL=0; FAILED=()
_ok(){ PASS=$((PASS+1)); printf '  \033[32m✓\033[0m %s\n' "$1"; }
_no(){ FAIL=$((FAIL+1)); FAILED+=("$1"); printf '  \033[31m✗\033[0m %s\n' "$1"; }
section(){ printf '\n\033[1m== %s ==\033[0m\n' "$1"; }
check(){ local n="$1"; shift; if "$@" >/dev/null 2>&1; then _ok "$n"; else _no "$n"; fi; }
check_eq(){ local n="$1" a="$2" b="$3"; [ "$a" = "$b" ] && _ok "$n" || _no "$n (got '$a', want '$b')"; }
check_has(){ local n="$1" hay="$2" needle="$3"; [[ "$hay" == *"$needle"* ]] && _ok "$n" || _no "$n (missing '$needle' in: $hay)"; }

# seam <args...> -> the JSON array (stdout from the first '[')
seam(){ findTargetImage "$@" 2>/dev/null | sed -n 's/^target_result: //p'; }
jq1(){ printf '%s' "$1" | jq -r "$2" 2>/dev/null; }

cleanup(){ [ -n "$VNC_PID" ] && kill "$VNC_PID" 2>/dev/null; [ -n "$WM_PID" ] && kill "$WM_PID" 2>/dev/null; [ -n "$XVFB_PID" ] && kill "$XVFB_PID" 2>/dev/null; rm -rf "$WORK"; }
trap cleanup EXIT

# ---------------------------------------------------------------------------
section "L0 — OS + essentials"
# ---------------------------------------------------------------------------
for t in Xvfb openbox x11vnc sshd java node python3 convert import ffmpeg aosd_cat xdotool wmctrl jq findTargetImage; do
  check "present: $t" command -v "$t"
done
check_has "java is the 17 series" "$(java -version 2>&1 | head -1)" '"17'
check "natives baked (>=3 libs)" test "$(ls /opt/oculix-natives 2>/dev/null | wc -l)" -ge 3
check_has "natives wired into ld.so" "$(ldconfig -p 2>/dev/null | grep -o '/opt/oculix-natives' | head -1)" "/opt/oculix-natives"
check "no wdio in the base" bash -c '! ls /root/Projects/AutoBDD/node_modules/@wdio >/dev/null 2>&1'

# ---------------------------------------------------------------------------
section "L0d — X display + desktop"
# ---------------------------------------------------------------------------
Xvfb "$DISPLAY" -screen 0 "$RES" >/dev/null 2>&1 & XVFB_PID=$!
for _ in $(seq 1 20); do xdpyinfo -display "$DISPLAY" >/dev/null 2>&1 && break; sleep 0.3; done
check "Xvfb serving $DISPLAY" xdpyinfo -display "$DISPLAY"
check_eq "display geometry ${W}x${H}" "$(xdotool getdisplaygeometry 2>/dev/null | tr ' ' 'x')" "${W}x${H}"

openbox >/dev/null 2>&1 & WM_PID=$!
sleep 1
check "window manager (openbox) running" test -d "/proc/$WM_PID"

x11vnc -display "$DISPLAY" -nopw -forever -shared -bg -rfbport 5900 -o "$WORK/x11vnc.log" >/dev/null 2>&1
VNC_PID="$(pgrep -f 'x11vnc .*rfbport 5900' | head -1)"
sleep 2
check "x11vnc listening on :5900" bash -c "netstat -ltn 2>/dev/null | grep -q ':5900 '"

# ---------------------------------------------------------------------------
section "L1 — screen-engine CLI seam (docs/CONTRACT.md)"
# ---------------------------------------------------------------------------
# Screen OCR mode: no target image, whole screen.
JSON="$(seam --imagePath=Screen)"
check_eq "screen mode -> name=Screen"      "$(jq1 "$JSON" '.[0].name')"      "Screen"
check_eq "screen mode -> score is null"    "$(jq1 "$JSON" '.[0].score')"     "null"
check_eq "screen mode -> center is a point" "$(jq1 "$JSON" '.[0].center.x|type')" "number"

# Render a known image onto the root window, then find it by image and by OCR.
convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "HELLO WORLD" "$WORK/hello.png"
display -window root "$WORK/hello.png" >/dev/null 2>&1 &
sleep 2
JSON="$(seam --imagePath=$WORK/hello.png)"
check_eq "image match -> name"        "$(jq1 "$JSON" '.[0].name')"            "hello.png"
check_eq "image match -> score == 1"  "$(jq1 "$JSON" '.[0].score')"           "1"
check_eq "image match -> OCR text"    "$(jq1 "$JSON" '.[0].text[0]')"         "HELLO WORLD"
check_eq "image match -> center point" "$(jq1 "$JSON" '.[0].center.x|type')"  "number"
check_eq "contract: all keys present" \
  "$(jq1 "$JSON" '.[0] | has("name") and has("score") and has("text") and has("location") and has("dimension") and has("center") and has("clicked")')" "true"

# textHint gates the match on the region's OCR text.
check_eq "textHint match"              "$(jq1 "$(seam --imagePath=$WORK/hello.png --textHint=HELLO)" '.[0].name')"   "hello.png"
check_eq "textHint mismatch -> notFound" "$(jq1 "$(seam --imagePath=$WORK/hello.png --textHint=NOPE)" '.[0].status')" "notFound"

# maxSim (ceiling) rejects even a perfect match.
check_eq "maxSim ceiling -> notFound"  "$(jq1 "$(seam --imagePath=$WORK/hello.png --maxSim=0.5)" '.[0].status')"     "notFound"

# A missing target is a status object, not an error.
check_eq "missing target -> notFound"  "$(jq1 "$(seam --imagePath=$WORK/nope.png)" '.[0].status')"                   "notFound"

# An action records the clicked point (== the match center).
JSON="$(seam --imagePath=$WORK/hello.png --imageAction=click)"
check_eq "imageAction click -> clicked point" "$(jq1 "$JSON" '.[0].clicked|type')"   "object"
check_eq "click lands on match center"        "$(jq1 "$JSON" '.[0].clicked.x')"      "$(jq1 "$JSON" '.[0].center.x')"

# ---------------------------------------------------------------------------
section "L1 — keyboard/mouse substrate"
# ---------------------------------------------------------------------------
xdotool mousemove 500 400; sleep 0.3
check_eq "xdotool moves the pointer (x)" "$(xdotool getmouselocation --shell | sed -n 's/^X=//p')" "500"
check_eq "xdotool moves the pointer (y)" "$(xdotool getmouselocation --shell | sed -n 's/^Y=//p')" "400"

# ---------------------------------------------------------------------------
printf '\n\033[1m%s\033[0m\n' "========================================="
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32mbase-test: %d passed, 0 failed\033[0m\n' "$PASS"
  exit 0
else
  printf '\033[31mbase-test: %d passed, %d FAILED\033[0m\n' "$PASS" "$FAIL"
  printf 'failed: %s\n' "${FAILED[*]}"
  exit 1
fi
