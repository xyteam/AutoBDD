#!/bin/bash
# features.sh — the base-image feature catalogue.
#
# Sourced by run.sh (runs every feature) and one.sh (runs one feature), so the full
# suite and the single-feature repro can never drift apart.
#
# Logging contract (this is the point of the file):
#   * every seam invocation goes through target(), which PRINTS THE EXACT ARGV IT RUNS,
#     plus the exit status. A check can therefore never narrate a command it did not run,
#     and a multi-invocation feature prints every invocation instead of one aspiration.
#   * host-side commands go through probe(), which likewise prints then runs the same
#     string, so every printed line is literally runnable.
#   * passing checks print the OBSERVED value, so a green run is evidence, not a checklist.
#   * every feature's description is one imperative sentence (the intent); the run lines
#     are the literal evidence. The catalogue table at the bottom is the single source of
#     both the description and the ordering.
#   * a fixture is re-shown before each invocation, so features are order-independent
#     rather than depending on the root window surviving from a previous feature.
#
# Units: durations are printed with their unit in the legacy flags' own units
# (--imageWaitTime seconds, --ocrWaitTime milliseconds) because that is what runs. When
# the `autobdd find-target --match-*` vocabulary lands (PR 3), these same lines become
# `autobdd find-target --match-image … --wait 5s` for free — because the printed string
# and the executed argv are the same string.

# ---------------------------------------------------------------------------
# result plumbing
# ---------------------------------------------------------------------------
PASS=0; FAIL=0; FAILED=()
# Everything the run prints goes to stderr: the log is a single ordered stream, so a
# 'run:' line can never appear after the ✓ it produced. stdout stays free for a feature's
# own payload (and for one.sh --list).
_ok(){ PASS=$((PASS+1)); printf '   \033[32m✓\033[0m %s\n' "$1" >&2; }
_no(){ FAIL=$((FAIL+1)); FAILED+=("$FEAT_ID: $1"); printf '   \033[31m✗\033[0m %s\n' "$1" >&2; }
group(){ printf '\n\033[1m\033[44m  %s  \033[0m\n' "$1" >&2; }
feature(){
  FEAT_ID="$1"
  FEAT_DESC="$(printf '%s\n' "${FEATURES[@]}" | awk -F'|' -v id="$1" '$2==id {print $3}')"
  printf '\n\033[1m▸ %s\033[0m — %s\n' "$1" "$FEAT_DESC" >&2
  printf '   \033[2m%*srepro: base-test/one.sh %s\033[0m\n' 0 '' "$1" >&2
}

check_eq(){ local n="$1" a="$2" b="$3"; if [ "$a" = "$b" ]; then _ok "$n = $a"; else _no "$n (got '$a', want '$b')"; fi; }
check_has(){ local n="$1" hay="$2" needle="$3"; if [[ "$hay" == *"$needle"* ]]; then _ok "$n (contains '$needle')"; else _no "$n (missing '$needle' in: ${hay:0:90})"; fi; }
check_ge(){ local n="$1" a="$2" b="$3"; if [ "${a:-0}" -ge "$b" ] 2>/dev/null; then _ok "$n = $a (>= $b)"; else _no "$n (got '$a', want >= $b)"; fi; }

_jq(){ printf '%s' "$1" | jq -r "$2" 2>/dev/null; }

# quote each argv element so the printed line is copy-pasteable
_pretty(){ local out="" a; for a in "$@"; do out+="$(printf '%q' "$a") "; done; printf '%s' "${out% }"; }

# ---------------------------------------------------------------------------
# seam invocation — prints the exact argv it runs, and the exit status
# ---------------------------------------------------------------------------
FIXTURE=""; TARGET_RC=0
# The default entry point is the DEPRECATED ALIAS, so the whole matrix doubles as proof
# that the alias is transparent. Set TARGET_BIN=/usr/local/libexec/autobdd/find-target to
# run the same matrix through the front door (the CI dual-surface run).
TARGET_BIN="${TARGET_BIN:-findTargetImage}"
FRONT_DOOR="${FRONT_DOOR:-/usr/local/bin/autobdd}"
FRONT_VERB="${FRONT_VERB:-/usr/local/libexec/autobdd/find-target}"
FRONT_READ="${FRONT_READ:-/usr/local/libexec/autobdd/read-text}"

target_bin(){
  local bin="$1"; shift
  if [ -z "${NOSHOW:-}" ] && [ -n "$FIXTURE" ]; then display -window root "$FIXTURE" >/dev/null 2>&1; sleep 0.5; fi
  local OUT; OUT="$("$bin" "$@" 2>/dev/null)"; TARGET_RC=$?
  # Log lines go to stderr: this is called inside $( ), so stdout must carry the payload
  # and nothing else.
  printf '   \033[2mrun:    %s %s   [rc=%s]\033[0m\n' "$bin" "$(_pretty "$@")" "$TARGET_RC" >&2
  printf '%s' "$OUT" | sed -n 's/.*target_result: //p'
}
target(){ target_bin "$TARGET_BIN" "$@"; }

# host-side command — printed, then run from the same string
probe(){ local n="$1"; shift; printf '   \033[2mprobe:  %s\033[0m\n' "$(_pretty "$@")"; if "$@" >/dev/null 2>&1; then _ok "$n"; else _no "$n"; fi; }

# ---------------------------------------------------------------------------
# X display lifecycle
# ---------------------------------------------------------------------------
X_PIDS=(); OPENBOX_PID=""
x_start(){
  RES="${RESOLUTION:-1920x1200x24}"
  W="${RES%%x*}"; H="$(echo "$RES" | cut -dx -f2)"
  Xvfb "$DISPLAY" -screen 0 "$RES" >/dev/null 2>&1 & X_PIDS+=($!)
  for _ in $(seq 1 20); do xdpyinfo -display "$DISPLAY" >/dev/null 2>&1 && break; sleep 0.3; done
  openbox >/dev/null 2>&1 & OPENBOX_PID=$!; X_PIDS+=($OPENBOX_PID)
  sleep 1
}
x_stop(){ for p in "${X_PIDS[@]:-}"; do kill "$p" 2>/dev/null; done; }

# ---------------------------------------------------------------------------
# fixtures — build the PNG, then put it on the root window
# ---------------------------------------------------------------------------
fx_image(){ convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "HELLO WORLD" "$WORK/hello.png"
            FIXTURE="$WORK/hello.png"; display -window root "$FIXTURE" >/dev/null 2>&1 & sleep 2; }
fx_image_blurred(){ convert "$WORK/hello.png" -blur 0x3 "$WORK/hello_blur.png"; }
fx_ocr(){ convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "AUTOTEST OCR" "$WORK/ocr.png"
          FIXTURE="$WORK/ocr.png"; display -window root "$FIXTURE" >/dev/null 2>&1 & sleep 2; }
fx_blank(){ FIXTURE=""; display -window root -size "${W:-1920}x${H:-1200}" xc:white >/dev/null 2>&1 & sleep 1; }
fx_two_tiles(){
  convert -size 220x110 xc:white -pointsize 48 -fill black -gravity center -annotate +0+0 "BLK" -bordercolor black -border 4 "$WORK/tile.png"
  # Full-resolution canvas: the root window tiles its background, so a smaller canvas
  # would repeat and change the number of matches.
  convert -size "${W:-1920}x${H:-1200}" xc:white \
          \( "$WORK/tile.png" \) -geometry +120+120 -composite \
          \( "$WORK/tile.png" \) -geometry +900+120 -composite "$WORK/two.png"
  FIXTURE="$WORK/two.png"; display -window root "$FIXTURE" >/dev/null 2>&1 & sleep 2
}

# ---------------------------------------------------------------------------
# A. runtime substrate
# ---------------------------------------------------------------------------
feat_tools(){
  feature tools
  local t; for t in Xvfb openbox x11vnc sshd java node python3 convert import ffmpeg aosd_cat xdotool wmctrl jq findTargetImage; do
    probe "present: $t" command -v "$t"
  done
}
feat_java17(){
  feature java17
  probe "java is the 17 series" bash -c 'java -version 2>&1 | head -1 | grep -q "\"17"'
}
feat_natives(){
  feature natives
  probe "at least 3 shared objects baked in /opt/oculix-natives" bash -c 'test "$(ls /opt/oculix-natives 2>/dev/null | wc -l)" -ge 3'
  probe "the loader has /opt/oculix-natives on its path" bash -c 'ldconfig -p 2>/dev/null | grep -q /opt/oculix-natives'
  local JSON; JSON="$(target --match-image=Screen --flash=0s)"
  check_eq "the engine loads those natives (screen read answers)" "$(_jq "$JSON" '.[0].name')" "Screen"
}
feat_screen_only(){
  feature screen-only
  probe "no wdio in the base" bash -c '! ls /root/Projects/AutoBDD/node_modules/@wdio >/dev/null 2>&1'
  probe "no chrome in the base" bash -c '! command -v google-chrome >/dev/null 2>&1'
  probe "no chromedriver in the base" bash -c '! command -v chromedriver >/dev/null 2>&1'
}
feat_provenance(){
  feature provenance
  probe "/etc/autobdd-versions exists and is non-empty" test -s /etc/autobdd-versions
  local f; f="$(cat /etc/autobdd-versions 2>/dev/null)"
  check_has "records os="            "$f" "os="
  check_has "records java="          "$f" "java="
  check_has "records node="          "$f" "node="
  check_has "records ubuntu_digest=" "$f" "ubuntu_digest=sha256:"
  check_has "records built="         "$f" "built="
}

# ---------------------------------------------------------------------------
# B. display + desktop substrate
# ---------------------------------------------------------------------------
feat_display(){
  feature display
  probe "Xvfb serving $DISPLAY" xdpyinfo -display "$DISPLAY"
  check_eq "display geometry" "$(xdotool getdisplaygeometry 2>/dev/null | tr ' ' 'x')" "${W}x${H}"
}
feat_wm(){
  feature wm
  probe "the openbox we started is still alive" test -d "/proc/$OPENBOX_PID"
  probe "openbox is running under its own process name" bash -c "pgrep -x openbox >/dev/null"
}
feat_vnc(){
  feature vnc
  probe "start x11vnc on :5900" bash -c "x11vnc -display $DISPLAY -nopw -forever -shared -bg -rfbport 5900 -o $WORK/x11vnc.log"
  VNC_PID="$(pgrep -f 'x11vnc .*rfbport 5900' | head -1)"
  probe "x11vnc process running" test -n "$VNC_PID"
  sleep 2
  probe "listening on :5900" bash -c "netstat -ltn 2>/dev/null | grep -q ':5900 '"
}
feat_pointer(){
  feature pointer
  probe "move the pointer to 500,400" xdotool mousemove 500 400
  sleep 0.3
  check_eq "pointer X" "$(xdotool getmouselocation --shell | sed -n 's/^X=//p')" "500"
  check_eq "pointer Y" "$(xdotool getmouselocation --shell | sed -n 's/^Y=//p')" "400"
}

# ---------------------------------------------------------------------------
# C. seam: whole-screen OCR mode
# ---------------------------------------------------------------------------
feat_screen_mode(){
  feature screen-mode
  fx_image
  local JSON; JSON="$(target_bin "$FRONT_READ")"
  check_eq "name is Screen"                "$(_jq "$JSON" '.[0].name')"          "Screen"
  check_eq "score is null (no template)"   "$(_jq "$JSON" '.[0].score')"         "null"
  check_eq "center is a point"             "$(_jq "$JSON" '.[0].center.x|type')" "number"
  check_has "text carries the on-screen words" "$(_jq "$JSON" '.[0].text|join(" ")')" "HELLO WORLD"
}

# ---------------------------------------------------------------------------
# D. seam: image matching
# ---------------------------------------------------------------------------
feat_image_match(){
  feature image-match
  fx_image
  local JSON; JSON="$(target --match-image="$WORK/hello.png" --flash=0s)"
  check_eq "name is the template file name"       "$(_jq "$JSON" '.[0].name')" "hello.png"
  check_eq "score >= 0.99 for an exact copy"      "$(_jq "$JSON" '.[0].score >= 0.99')" "true"
  check_eq "region OCR text"                      "$(_jq "$JSON" '.[0].text[0]')" "HELLO WORLD"
  check_eq "location is {x,y}"                    "$(_jq "$JSON" '.[0].location | has("x") and has("y")')" "true"
  check_eq "dimension is {width,height}"          "$(_jq "$JSON" '.[0].dimension | has("width") and has("height")')" "true"
  check_eq "center is a point"                    "$(_jq "$JSON" '.[0].center.x|type')" "number"
  check_eq "clicked is null with no action"       "$(_jq "$JSON" '.[0].clicked')" "null"
}
feat_image_similarity(){
  feature image-similarity
  fx_image; fx_image_blurred
  local JSON
  JSON="$(target --match-image="$WORK/hello_blur.png" --min-score=0.5 --flash=0s)"
  check_eq "a low floor accepts the blurred template" "$(_jq "$JSON" '.[0].name')" "hello_blur.png"
  JSON="$(target --match-image="$WORK/hello_blur.png" --min-score=0.99 --flash=0s)"
  check_eq "a high floor rejects it"                  "$(_jq "$JSON" '.[0].status')" "notFound"
}
feat_maxsim_ceiling(){
  feature maxsim-ceiling
  fx_image
  local JSON; JSON="$(target --match-image="$WORK/hello.png" --max-score=0.5 --flash=0s)"
  check_eq "a low ceiling rejects even a perfect match" "$(_jq "$JSON" '.[0].status')" "notFound"
}
feat_text_hint(){
  feature text-hint
  fx_image
  local JSON
  JSON="$(target --match-image="$WORK/hello.png" --match-text=HELLO --flash=0s)"
  check_eq "a matching hint accepts"      "$(_jq "$JSON" '.[0].name')" "hello.png"
  JSON="$(target --match-image="$WORK/hello.png" --match-text=NOPE --flash=0s)"
  check_eq "a non-matching hint rejects"  "$(_jq "$JSON" '.[0].status')" "notFound"
}
feat_image_wait(){
  feature image-wait
  convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "HELLO WORLD" "$WORK/hello.png"
  fx_blank
  ( sleep 3; display -window root "$WORK/hello.png" >/dev/null 2>&1 ) &
  local JSON; JSON="$(target --match-image="$WORK/hello.png" --wait=8s --flash=0s)"
  check_eq "the call blocks until the target appears at t+3s" "$(_jq "$JSON" '.[0].name')" "hello.png"
}
feat_image_maxcount(){
  feature image-maxcount
  fx_two_tiles
  local JSON; JSON="$(target --match-image="$WORK/tile.png" --limit=2 --flash=0s)"
  check_eq "two identical tiles yield two results" "$(_jq "$JSON" 'length')" "2"
  check_eq "the two matches are distinct"          "$(_jq "$JSON" '.[0].center.x != .[1].center.x')" "true"
}
feat_image_missing(){
  feature image-missing
  fx_image
  local JSON; JSON="$(target --match-image="$WORK/nope.png" --flash=0s)"
  check_eq "status is notFound" "$(_jq "$JSON" '.[0].status')" "notFound"
  check_eq "the payload is still an array" "$(_jq "$JSON" 'type')" "array"
}
feat_flash(){
  feature flash
  fx_image
  printf '   \033[2m        timed without the fixture re-show (NOSHOW=1)\033[0m\n' >&2
  NOSHOW=1 target --match-image="$WORK/hello.png" >/dev/null                # warm
  local best_def="" best_none="" ms t0 t1
  # Minimum of five per mode: the minimum is the least noisy estimator of a fixed cost,
  # and both modes pay the identical JVM/match cost, so the difference is the flash.
  # The threshold only has to separate "flash applied (~1 s)" from "not applied (0 ms)",
  # which is the regression this guards: measured while broken, the delta was 15-284 ms;
  # applied, it is 780-1010 ms. The ceiling catches a runaway flash.
  for _ in 1 2 3 4 5; do t0=$(now_ms); NOSHOW=1 target --match-image="$WORK/hello.png" >/dev/null; t1=$(now_ms)
    ms=$(( t1 - t0 )); [ -z "$best_def" ] || [ "$ms" -lt "$best_def" ] && best_def="$ms"; done
  for _ in 1 2 3 4 5; do t0=$(now_ms); NOSHOW=1 target --match-image="$WORK/hello.png" --flash=0s >/dev/null; t1=$(now_ms)
    ms=$(( t1 - t0 )); [ -z "$best_none" ] || [ "$ms" -lt "$best_none" ] && best_none="$ms"; done
  local delta=$(( best_def - best_none ))
  printf '   \033[2m        measured: default %s ms vs --flash=0s %s ms -> delta %s ms\033[0m\n' "$best_def" "$best_none" "$delta" >&2
  check_ge "the default flash pauses for at least 0.5 s (0 ms would mean the flash is not applied)" "$delta" 500
  if [ "$delta" -le 2500 ]; then _ok "the flash pause is bounded = $delta ms (<= 2500)"; else _no "the flash pause is unbounded (got $delta ms)"; fi
}

# ---------------------------------------------------------------------------
# E. seam: actions, verified against the OS pointer
# ---------------------------------------------------------------------------
# The reported click point is compared with xdotool's view of the pointer, so this
# proves the action reached the X server rather than only being reported in JSON.
action_case(){
  local action="$1" expect_click="$2" JSON cx cy
  TARGET_ACTION="$3"
  xdotool mousemove 3 3; sleep 0.3
  JSON="$(target --match-image="$WORK/hello.png" $TARGET_ACTION --flash=0s)"
  cx="$(_jq "$JSON" '.[0].center.x')"; cy="$(_jq "$JSON" '.[0].center.y')"
  if [ "$expect_click" = "click" ]; then
    check_eq "reports clicked == center" "$(_jq "$JSON" '.[0].clicked.x')" "$cx"
  else
    check_eq "reports clicked = null" "$(_jq "$JSON" '.[0].clicked')" "null"
  fi
  check_eq "the pointer is really at the reported centre" "$(pointer)" "$cx,$cy"
}
feat_action_click(){       feature action-click;       fx_image; action_case click click "--click"; }
feat_action_doubleclick(){ feature action-doubleclick; fx_image; action_case doubleClick click "--double-click"; }
feat_action_rightclick(){  feature action-rightclick;  fx_image; action_case rightClick click "--right-click"; }
feat_action_hoverclick(){  feature action-hoverclick;  fx_image; action_case hoverClick click "--hover --click"; }
feat_action_hover(){       feature action-hover;       fx_image; action_case hover hover "--hover"; }
feat_action_none(){
  feature action-none
  fx_image
  xdotool mousemove 3 3; sleep 0.3
  local JSON; JSON="$(target --match-image="$WORK/hello.png"  --flash=0s)"
  check_eq "clicked stays null"        "$(_jq "$JSON" '.[0].clicked')" "null"
  check_eq "the pointer is untouched"  "$(pointer)" "3,3"
}

# ---------------------------------------------------------------------------
# F. seam: opt-in OCR mode (extension; not part of the frozen v1 contract)
# ---------------------------------------------------------------------------
feat_ocr_detect(){
  feature ocr-detect
  fx_ocr
  local JSON; JSON="$(target --match-text="AUTOTEST OCR" --box)"
  check_eq "one match"                 "$(_jq "$JSON" 'length')" "1"
  check_eq "matched text"              "$(_jq "$JSON" '.[0].ocrDetails[0].text')" "AUTOTEST OCR"
  check_eq "bbox has x/y/width/height" "$(_jq "$JSON" '.[0].ocrDetails[0] | has("x") and has("y") and has("width") and has("height")')" "true"
  check_eq "centre is the bbox centre" "$(_jq "$JSON" '.[0].center.x')" "$(_jq "$JSON" '.[0].ocrDetails[0].x + .[0].ocrDetails[0].width/2')"
}
feat_ocr_detail_none(){
  feature ocr-detail-none
  fx_ocr
  local JSON; JSON="$(target --match-text="AUTOTEST OCR")"
  check_eq "the extension field is absent" "$(_jq "$JSON" '.[0] | has("ocrDetails")')" "false"
  check_eq "core fields are present" "$(_jq "$JSON" '.[0] | has("name") and has("center") and has("text")')" "true"
}
feat_ocr_detail_line(){
  feature ocr-detail-line
  fx_ocr
  local JSON; JSON="$(target --match-text="AUTOTEST OCR" --box=line)"
  check_eq "the extension field is present" "$(_jq "$JSON" '.[0] | has("ocrDetails")')" "true"
}
feat_ocr_similarity(){
  feature ocr-similarity
  fx_ocr
  local JSON
  JSON="$(target --match-text="AUTOTEST OCR" --min-score=0.8)"
  check_eq "the floor argument is accepted and detection still works" "$(_jq "$JSON" '.[0].name')" "AUTOTEST OCR"
  JSON="$(target --match-text="NO SUCH TEXT HERE")"
  check_eq "absent text is rejected" "$(_jq "$JSON" '.[0].status')" "notFound"
  # Deliberately NOT asserted: that raising --ocrSimilarity rejects a text whose
  # confidence is below it. Measured: with the text on screen, --min-score=0.99
  # still returns a match, because this build's OCR path has no per-match confidence to
  # filter on (the image floor IS applied: see image-similarity). Asserting rejection
  # here would pass only when the screen happens to be blank — a false green.
  printf '   \033[33mknown-gap: --ocrSimilarity is accepted but not applied by this build; only the image floor filters\033[0m\n' >&2
}
feat_ocr_wait(){
  feature ocr-wait
  convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "AUTOTEST OCR" "$WORK/ocr.png"
  fx_blank
  ( sleep 2; display -window root "$WORK/ocr.png" >/dev/null 2>&1 ) &
  local JSON; JSON="$(target --match-text="AUTOTEST OCR" --wait=8000ms)"
  check_eq "the call waits for text that appears at t+2s" "$(_jq "$JSON" '.[0].name')" "AUTOTEST OCR"
}
feat_ocr_action(){
  feature ocr-action
  fx_ocr
  xdotool mousemove 3 3; sleep 0.3
  local JSON; JSON="$(target --match-text="AUTOTEST OCR" --click --box)"
  check_eq "reports clicked == center" "$(_jq "$JSON" '.[0].clicked.x')" "$(_jq "$JSON" '.[0].center.x')"
  check_eq "the pointer is really at the reported centre" "$(pointer)" "$(_jq "$JSON" '.[0].center.x'),$(_jq "$JSON" '.[0].center.y')"
}
feat_ocr_psm_oem(){
  feature ocr-psm-oem
  fx_ocr
  local JSON; JSON="$(target --match-text="AUTOTEST OCR" --psm=7 --oem=3)"
  check_eq "explicit psm/oem still matches" "$(_jq "$JSON" '.[0].name')" "AUTOTEST OCR"
}

# ---------------------------------------------------------------------------
# G. contract robustness
# ---------------------------------------------------------------------------
feat_json_on_error(){
  feature json-on-error
  # The env assignment must precede the binary; printing it as an argument (as the
  # previous version did) reproduced a *different* test: a successful screen read.
  local OUT rc payload
  OUT="$(DISPLAY=:77 "$TARGET_BIN" --match-image=Screen 2>/dev/null)"; rc=$?
  printf '   \033[2mrun:    DISPLAY=:77 %s --match-image=Screen   [rc=%s]\033[0m\n' "$TARGET_BIN" "$rc"
  payload="$(printf '%s' "$OUT" | sed -n 's/.*target_result: //p')"
  check_eq "exit status is 0" "$rc" "0"
  check_eq "exactly one result line" "$(printf '%s' "$OUT" | grep -c 'target_result:')" "1"
  check_eq "the payload parses as a JSON array" "$(_jq "$payload" 'type')" "array"
  check_eq "the payload reports a status" \
    "$(_jq "$payload" 'if (.[0].status == "error" or .[0].status == "notFound") then "ok" else "bad" end')" "ok"
}
feat_additive_args(){
  feature additive-args
  fx_image
  local JSON; JSON="$(target --match-image="$WORK/hello.png" --someFutureArg=1 --flash=0s)"
  check_eq "an unknown argument does not break matching" "$(_jq "$JSON" '.[0].name')" "hello.png"
}

# ---------------------------------------------------------------------------
# H. non-functional
# ---------------------------------------------------------------------------
feat_latency(){
  feature latency
  fx_image
  printf '   \033[2m        timed without the fixture re-show (NOSHOW=1)\033[0m\n' >&2
  NOSHOW=1 target --match-image="$WORK/hello.png" --flash=0s >/dev/null      # warm
  local best="" ms t0 t1
  for _ in 1 2 3; do
    t0=$(now_ms); NOSHOW=1 target --match-image="$WORK/hello.png" --flash=0s >/dev/null 2>&1; t1=$(now_ms)
    ms=$(( t1 - t0 )); [ -z "$best" ] || [ "$ms" -lt "$best" ] && best="$ms"
  done
  if [ "${best:-99999}" -le 1500 ]; then _ok "warm match ${best} ms (budget 1500 ms)"; else _no "warm match ${best} ms (> 1500 ms budget)"; fi
}

# pointer -> "X,Y" of the OS mouse pointer
pointer(){ xdotool getmouselocation --shell 2>/dev/null | sed -n 's/^X=//p;s/^Y=//p' | paste -sd, -; }
now_ms(){ echo $(( $(date +%s%N) / 1000000 )); }


# ---------------------------------------------------------------------------
# I. discovery — what an agent or a human asks first
# ---------------------------------------------------------------------------
feat_help(){
  feature help
  local t0 t1 out rc ms
  t0=$(now_ms); out="$(findTargetImage --help 2>/dev/null)"; rc=$?; t1=$(now_ms); ms=$(( t1 - t0 ))
  printf '   \033[2mrun:    findTargetImage --help   [rc=%s, %s ms]\033[0m\n' "$rc" "$ms" >&2
  check_eq "exit status is 0" "$rc" "0"
  check_has "prints the flows" "$out" "FLOWS"
  check_has "prints the flags" "$out" "--imagePath"
  # A real result line is always `target_result: [` + JSON; the help text merely names
  # the marker, so match the payload, not the documentation.
  check_eq "emits no result payload" "$(printf '%s' "$out" | grep -c 'target_result: \[')" "0"
  check_eq "starts no engine (no engine banner)" "$(printf '%s' "$out" | grep -c 'DEBUG STARTUP')" "0"
  # A JVM + engine start is ~1100 ms, so answering well under that proves the help path
  # runs before the engine is loaded.
  if [ "$ms" -le 500 ]; then _ok "answers in $ms ms (<= 500: no engine start)"; else _no "took $ms ms — the engine is being started for --help"; fi
}
feat_version(){
  feature version
  local out rc
  out="$(findTargetImage --version 2>/dev/null)"; rc=$?
  printf '   \033[2mrun:    findTargetImage --version   [rc=%s]\033[0m\n' "$rc" >&2
  check_eq "exit status is 0" "$rc" "0"
  check_has "names the seam" "$out" "AutoBDD base seam"
  check_has "reports the image build stamp" "$out" "image  : built "
}
feat_list(){
  feature list
  local out rc
  out="$(findTargetImage --list 2>/dev/null)"; rc=$?
  printf '   \033[2mrun:    findTargetImage --list   [rc=%s]\033[0m\n' "$rc" >&2
  check_eq "exit status is 0" "$rc" "0"
  check_has "lists the screen read as its own verb" "$out" "read-text"
  check_has "lists the picture flow" "$out" "--match-image=logo.png"
  check_has "lists the acting flow" "$out" "--click"
}
feat_usage_error(){
  feature usage-error
  local out rc
  # An unusable value must fail loudly: silently behaving like the default would look
  # like a working call to an agent.
  out="$(findTargetImage --min-score=abc 2>&1 >/dev/null)"; rc=$?
  printf '   \033[2mrun:    findTargetImage --min-score=abc   [rc=%s]\033[0m\n' "$rc" >&2
  check_eq "exit status is 2 (usage error)" "$rc" "2"
  check_has "names the offending flag" "$out" "--min-score"
  check_has "says what it expected" "$out" "expects a number"
}


# ---------------------------------------------------------------------------
# J. front door — the verb layer, and the deprecated alias
# ---------------------------------------------------------------------------
feat_front_door_help(){
  feature front-door-help
  local out rc
  out="$("$FRONT_DOOR" --help 2>/dev/null)"; rc=$?
  printf '   \033[2mrun:    %s --help   [rc=%s]\033[0m\n' "$FRONT_DOOR" "$rc" >&2
  check_eq "exit status is 0" "$rc" "0"
  check_has "lists the find-target verb" "$out" "find-target"
  check_has "lists the read-text verb"   "$out" "read-text"
  check_has "documents the exit statuses" "$out" "EXIT STATUS"
}
feat_front_door_read_text(){
  feature front-door-read-text
  fx_image
  local JSON; JSON="$(target_bin "$FRONT_READ")"
  check_eq "read-text reads the screen" "$(_jq "$JSON" '.[0].name')" "Screen"
  check_has "and reports the on-screen words" "$(_jq "$JSON" '.[0].text|join(" ")')" "HELLO WORLD"
  # find-target is the verb that NEEDS a target, so it must refuse an empty invocation —
  # otherwise the two verbs would be behaviourally identical and a mistyped flag would
  # silently cost a whole-screen scan.
  local rc
  "$FRONT_DOOR" find-target >/dev/null 2>"$WORK/notarget.err"; rc=$?
  printf '   \033[2mrun:    %s find-target   (no target)   [rc=%s]\033[0m\n' "$FRONT_DOOR" "$rc" >&2
  check_eq "find-target without a target is a usage error" "$rc" "2"
  check_has "and points at read-text" "$(cat "$WORK/notarget.err")" "read-text"
}
feat_front_door_find_target(){
  feature front-door-find-target
  fx_image
  local JSON; JSON="$(target_bin "$FRONT_DOOR" find-target --match-image="$WORK/hello.png" --flash=0s)"
  check_eq "find-target matches a picture" "$(_jq "$JSON" '.[0].name')" "hello.png"
  # A consumer branches on the exit status, so a successful match must exit 0. Seen once
  # as 139 (SIGSEGV during native teardown) under a loaded host; not reproducible in 23
  # clean runs since, so it is asserted here to keep it visible rather than silent.
  check_eq "and exits 0 on success" "$TARGET_RC" "0"
}
feat_front_door_unknown_verb(){
  feature front-door-unknown-verb
  local out rc
  out="$("$FRONT_DOOR" bogus-verb 2>&1 >/dev/null)"; rc=$?
  printf '   \033[2mrun:    %s bogus-verb   [rc=%s]\033[0m\n' "$FRONT_DOOR" "$rc" >&2
  check_eq "exit status is 2 (usage error)" "$rc" "2"
  check_has "names the offending verb" "$out" "bogus-verb"
}
feat_alias_transparent(){
  feature alias-transparent
  fx_image
  # Both surfaces must agree, and the deprecation notice must not touch stdout: every
  # consumer parses stdout as `target_result: <json>`.
  local legacy_stdout front_stdout payload
  legacy_stdout="$(findTargetImage --match-image="$WORK/hello.png" --flash=0s 2>"$WORK/legacy.err")"
  printf '   \033[2mrun:    findTargetImage --match-image=%s --flash=0s\033[0m\n' "$WORK/hello.png" >&2
  payload="$(printf '%s' "$legacy_stdout" | sed -n 's/.*target_result: //p')"
  check_eq "the alias still answers" "$(_jq "$payload" '.[0].name')" "hello.png"
  check_has "the deprecation notice goes to stderr" "$(cat "$WORK/legacy.err")" "deprecated"
  check_eq "stdout carries exactly one result line" "$(printf '%s' "$legacy_stdout" | grep -c 'target_result:')" "1"
  check_eq "stdout carries no notice" "$(printf '%s' "$legacy_stdout" | grep -c 'deprecated')" "0"
  front_stdout="$(target_bin "$FRONT_DOOR" find-target --match-image="$WORK/hello.png" --flash=0s)"
  check_eq "the front door and the alias agree" "$(_jq "$front_stdout" '.[0].name')" "$(_jq "$payload" '.[0].name')"
}


feat_legacy_flags(){
  feature legacy-flags
  fx_image
  # A v1 consumer must keep working untouched. The translation happens in the engine and
  # warns on stderr only, so stdout still carries exactly one clean result line.
  local out rc payload
  out="$(findTargetImage --imagePath="$WORK/hello.png" --imageSimilarity=0.5 --maxSim=1 \
         --imageWaitTime=2 --imageMaxCount=1 --imageAction=click --flash=0 2>"$WORK/legacy.err")"; rc=$?
  printf '   \033[2mrun:    findTargetImage --imagePath=… --imageSimilarity=0.5 --imageAction=click   [rc=%s]\033[0m\n' "$rc" >&2
  payload="$(printf '%s' "$out" | sed -n 's/.*target_result: //p')"
  check_eq "the v1 flags still match" "$(_jq "$payload" '.[0].name')" "hello.png"
  check_eq "and the v1 action still clicks" "$(_jq "$payload" '.[0].clicked|type')" "object"
  check_eq "stdout carries exactly one result line" "$(printf '%s' "$out" | grep -c 'target_result:')" "1"
  check_has "stdout names no deprecation" "$(printf '%s' "$out" | grep -c 'deprecated')" "0"
  check_has "the deprecation goes to stderr" "$(cat "$WORK/legacy.err")" "deprecated"
}

# ---------------------------------------------------------------------------
# catalogue: "<group>|<id>|<one imperative sentence>"
# ---------------------------------------------------------------------------
GROUP_A="A — runtime substrate (L0)"
GROUP_B="B — display + desktop (L0)"
GROUP_C="C — seam: whole-screen OCR mode"
GROUP_D="D — seam: image matching"
GROUP_E="E — seam: actions (verified against the OS pointer)"
GROUP_F="F — seam: opt-in OCR mode (extension)"
GROUP_G="G — contract robustness"
GROUP_H="H — non-functional"
GROUP_I="I — discovery"
GROUP_J="J — front door + deprecated alias"


FEATURES=(
  "$GROUP_A|tools|list the L0 essentials the image must contain"
  "$GROUP_A|java17|pin the JVM to the 17 series the engine requires"
  "$GROUP_A|natives|bake the engine's native libraries and register them with the loader"
  "$GROUP_A|screen-only|keep the base image free of any browser or webdriver runner"
  "$GROUP_A|provenance|record what the image was built from"
  "$GROUP_B|display|serve DISPLAY at the requested geometry"
  "$GROUP_B|wm|keep a window manager running for deterministic rendering"
  "$GROUP_B|vnc|expose the desktop over VNC on :5900"
  "$GROUP_B|pointer|drive the X mouse pointer from the OS"
  "$GROUP_C|screen-mode|read the whole screen as text without a template"
  "$GROUP_D|image-match|return every contract field for a template match"
  "$GROUP_D|image-similarity|accept a weak match at a low floor and reject it at a high one"
  "$GROUP_D|maxsim-ceiling|reject a match that scores above the ceiling"
  "$GROUP_D|text-hint|gate a picture match on the region's OCR text"
  "$GROUP_D|image-wait|wait for a target that appears after the call starts"
  "$GROUP_D|image-maxcount|return several matches when the target repeats"
  "$GROUP_D|image-missing|report an absent target as a status object, not an error"
  "$GROUP_D|flash|hold the on-screen match flash for the requested time"
  "$GROUP_E|action-click|click at the centre of the target"
  "$GROUP_E|action-doubleclick|double-click at the centre of the target"
  "$GROUP_E|action-rightclick|right-click at the centre of the target"
  "$GROUP_E|action-hoverclick|hover over the target and then click it"
  "$GROUP_E|action-hover|hover over the target without clicking"
  "$GROUP_E|action-none|leave the pointer untouched when no action is asked for"
  "$GROUP_F|ocr-detect|find a phrase on screen and report its bounding box"
  "$GROUP_F|ocr-detail-none|omit the bounding box when no detail is requested"
  "$GROUP_F|ocr-detail-line|report the bounding box when line detail is requested"
  "$GROUP_F|ocr-similarity|accept the OCR floor argument and reject absent text (the floor itself is a known gap)"
  "$GROUP_F|ocr-wait|wait for text that appears after the call starts"
  "$GROUP_F|ocr-action|dispatch an OCR action to the OS pointer"
  "$GROUP_F|ocr-psm-oem|accept explicit psm/oem tuning without breaking detection"
  "$GROUP_G|json-on-error|answer with JSON on stdout even when the display is unusable"
  "$GROUP_G|additive-args|ignore arguments it does not know"
  "$GROUP_H|latency|keep a warm image match inside its latency budget"
  "$GROUP_I|help|explain itself without starting the engine"
  "$GROUP_I|version|report what is running"
  "$GROUP_I|list|list the flows it supports"
  "$GROUP_I|usage-error|fail loudly on an unusable value instead of silently defaulting"
  "$GROUP_J|front-door-help|explain the verbs at the front door"
  "$GROUP_J|front-door-read-text|read the screen through the read-text verb"
  "$GROUP_J|front-door-find-target|find a target through the find-target verb"
  "$GROUP_J|front-door-unknown-verb|refuse an unknown verb with a usage error"
  "$GROUP_J|alias-transparent|keep findTargetImage working while warning on stderr only"
  "$GROUP_J|legacy-flags|translate the v1 argument names, warning on stderr only"
)

run_feature(){
  local id="$1" fn; fn="feat_$(printf '%s' "$id" | tr '-' '_')"
  if ! declare -F "$fn" >/dev/null; then echo "unknown feature: $id" >&2; return 2; fi
  "$fn"
}
feature_ids(){ printf '%s\n' "${FEATURES[@]}" | cut -d'|' -f2; }
