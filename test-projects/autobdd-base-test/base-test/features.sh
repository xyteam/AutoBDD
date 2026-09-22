#!/bin/bash
# features.sh — the base-image feature catalogue.
#
# Sourced by run.sh (runs every feature) and one.sh (runs one feature). Keeping the
# catalogue in one place means the full suite and the single-feature repro can never
# drift apart: `base-test/one.sh <id>` executes exactly the checks the suite runs for
# that id.
#
# Conventions
#   * every feature prints its own header + the one command that reproduces it
#   * every asserted behaviour is listed in the FEATURES table at the bottom
#   * a feature renders whatever fixture it needs, so features are order-independent
#   * `--flash=0` is used except where the flash itself is the subject: the flash is a
#     pure visual pause, and paying ~1 s for it on every one of ~30 features would
#     triple the suite's runtime for no extra coverage.

# ---------------------------------------------------------------------------
# result plumbing
# ---------------------------------------------------------------------------
PASS=0; FAIL=0; FAILED=()
_ok(){ PASS=$((PASS+1)); printf '   \033[32m✓\033[0m %s\n' "$1"; }
_no(){ FAIL=$((FAIL+1)); FAILED+=("$FEAT_ID: $1"); printf '   \033[31m✗\033[0m %s\n' "$1"; }
group(){ printf '\n\033[1m\033[44m  %s  \033[0m\n' "$1"; }
feature(){ FEAT_ID="$1"; FEAT_DESC="$2"; printf '\n\033[1m▸ %s\033[0m — %s\n' "$1" "$2"; printf '   \033[2m%*srepro: base-test/one.sh %s\033[0m\n' 0 '' "$1"; }
cmd(){ printf '   \033[2mcmd:   findTargetImage %s\033[0m\n' "$*"; }

check(){ local n="$1"; shift; if "$@" >/dev/null 2>&1; then _ok "$n"; else _no "$n"; fi; }
check_eq(){ local n="$1" a="$2" b="$3"; [ "$a" = "$b" ] && _ok "$n" || _no "$n (got '$a', want '$b')"; }
check_has(){ local n="$1" hay="$2" needle="$3"; [[ "$hay" == *"$needle"* ]] && _ok "$n" || _no "$n (missing '$needle' in: $hay)"; }
check_ge(){ local n="$1" a="$2" b="$3"; [ "${a:-0}" -ge "$b" ] 2>/dev/null && _ok "$n" || _no "$n (got '$a', want >= $b)"; }

# seam <args...> -> the JSON payload from the target_result line.
# The Oculix/JVM side writes its own startup logging to the same stdout fd, and can
# emit a partial line before ours, so the marker is matched anywhere on the line
# rather than anchored at the start.
seam(){ findTargetImage "$@" 2>/dev/null | sed -n 's/.*target_result: //p'; }
jq1(){ printf '%s' "$1" | jq -r "$2" 2>/dev/null; }

# pointer -> "X,Y" of the OS mouse pointer (proves an action reached the X server).
pointer(){ xdotool getmouselocation --shell 2>/dev/null | sed -n 's/^X=//p;s/^Y=//p' | paste -sd, -; }
now_ms(){ echo $(( $(date +%s%N) / 1000000 )); }

# ---------------------------------------------------------------------------
# X display lifecycle (features that need pixels call x_start themselves via the driver)
# ---------------------------------------------------------------------------
X_PIDS=()
x_start(){
  RES="${RESOLUTION:-1920x1200x24}"
  W="${RES%%x*}"; H="$(echo "$RES" | cut -dx -f2)"
  Xvfb "$DISPLAY" -screen 0 "$RES" >/dev/null 2>&1 & X_PIDS+=($!)
  for _ in $(seq 1 20); do xdpyinfo -display "$DISPLAY" >/dev/null 2>&1 && break; sleep 0.3; done
  openbox >/dev/null 2>&1 & X_PIDS+=($!)
  sleep 1
}
x_stop(){ for p in "${X_PIDS[@]:-}"; do kill "$p" 2>/dev/null; done; }

# ---------------------------------------------------------------------------
# fixtures — each renders into $WORK and (except the tile inputs) shows on the root
# ---------------------------------------------------------------------------
fx_blank(){ display -window root -size "${W:-1920}x${H:-1200}" xc:white >/dev/null 2>&1 & sleep 1; }
fx_image(){ convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "HELLO WORLD" "$WORK/hello.png"
            display -window root "$WORK/hello.png" >/dev/null 2>&1 & sleep 2; }
fx_image_blurred(){ convert "$WORK/hello.png" -blur 0x3 "$WORK/hello_blur.png"; }
fx_ocr(){ convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "AUTOTEST OCR" "$WORK/ocr.png"
          display -window root "$WORK/ocr.png" >/dev/null 2>&1 & sleep 2; }
fx_tile(){ convert -size 220x110 xc:white -pointsize 48 -fill black -gravity center -annotate +0+0 "BLK" -bordercolor black -border 4 "$WORK/tile.png"; }
fx_two_tiles(){ fx_tile
  # Full-resolution canvas: the root window tiles its background, so a smaller canvas
  # would repeat and change the number of matches.
  convert -size "${W:-1920}x${H:-1200}" xc:white \
          \( "$WORK/tile.png" \) -geometry +120+120 -composite \
          \( "$WORK/tile.png" \) -geometry +900+120 -composite "$WORK/two.png"
  display -window root "$WORK/two.png" >/dev/null 2>&1 & sleep 2; }

# ---------------------------------------------------------------------------
# A. runtime substrate
# ---------------------------------------------------------------------------
feat_tools(){
  feature tools "L0 essentials are present in the image"
  for t in Xvfb openbox x11vnc sshd java node python3 convert import ffmpeg aosd_cat xdotool wmctrl jq findTargetImage; do
    check "present: $t" command -v "$t"
  done
}
feat_java17(){
  feature java17 "Java is the pinned 17 series (Oculix floor)"
  check_has "java is the 17 series" "$(java -version 2>&1 | head -1)" '"17'
}
feat_natives(){
  feature natives "Oculix native libs are baked and visible to the loader"
  cmd "(--imagePath=Screen)   # any successful call proves the natives loaded"
  check_ge "natives baked (>=3 shared objects)" "$(ls /opt/oculix-natives 2>/dev/null | wc -l)" 3
  check_has "natives registered with ldconfig" "$(ldconfig -p 2>/dev/null | grep -o '/opt/oculix-natives' | head -1)" "/opt/oculix-natives"
  check_eq "seam loads natives (screen mode answers)" "$(jq1 "$(seam --imagePath=Screen --flash=0)" '.[0].name')" "Screen"
}
feat_screen_only(){
  feature screen-only "image is screen-only: no browser / no webdriver runner"
  check "no wdio in the base" bash -c '! ls /root/Projects/AutoBDD/node_modules/@wdio >/dev/null 2>&1'
  check "no chrome/chromedriver in the base" bash -c '! command -v google-chrome >/dev/null 2>&1 && ! command -v chromedriver >/dev/null 2>&1'
}
feat_provenance(){
  feature provenance "/etc/autobdd-versions records what the image was built from"
  check "file present" test -s /etc/autobdd-versions
  check_has "records os + java + node" "$(cat /etc/autobdd-versions)" "built="
  check_has "records the pinned base digest" "$(cat /etc/autobdd-versions)" "ubuntu_digest=sha256:"
}

# ---------------------------------------------------------------------------
# B. display + desktop substrate
# ---------------------------------------------------------------------------
feat_display(){
  feature display "Xvfb serves DISPLAY at the requested geometry"
  check "Xvfb serving $DISPLAY" xdpyinfo -display "$DISPLAY"
  check_eq "display geometry ${W}x${H}" "$(xdotool getdisplaygeometry 2>/dev/null | tr ' ' 'x')" "${W}x${H}"
}
feat_wm(){
  feature wm "window manager (openbox) is running"
  check "openbox process alive" bash -c "pgrep -x openbox >/dev/null || pgrep -f 'openbox' >/dev/null"
}
feat_vnc(){
  feature vnc "x11vnc exposes the desktop on :5900"
  x11vnc -display "$DISPLAY" -nopw -forever -shared -bg -rfbport 5900 -o "$WORK/x11vnc.log" >/dev/null 2>&1
  VNC_PID="$(pgrep -f 'x11vnc .*rfbport 5900' | head -1)"
  check "x11vnc process running" test -n "$VNC_PID"
  sleep 2
  check "listening on :5900" bash -c "netstat -ltn 2>/dev/null | grep -q ':5900 '"
}
feat_pointer(){
  feature pointer "mouse/keyboard substrate is live (xdotool drives the X pointer)"
  cmd "(xdotool mousemove 500 400)"
  xdotool mousemove 500 400; sleep 0.3
  check_eq "pointer moved to X=500" "$(xdotool getmouselocation --shell | sed -n 's/^X=//p')" "500"
  check_eq "pointer moved to Y=400" "$(xdotool getmouselocation --shell | sed -n 's/^Y=//p')" "400"
}

# ---------------------------------------------------------------------------
# C. seam: whole-screen OCR mode
# ---------------------------------------------------------------------------
feat_screen_mode(){
  feature screen-mode "--imagePath=Screen OCRs the whole screen (no template)"
  fx_image
  cmd "--imagePath=Screen --flash=0"
  local JSON; JSON="$(seam --imagePath=Screen --flash=0)"
  check_eq "name is Screen"            "$(jq1 "$JSON" '.[0].name')"                "Screen"
  check_eq "score is null (no template)" "$(jq1 "$JSON" '.[0].score')"             "null"
  check_eq "center is a point"         "$(jq1 "$JSON" '.[0].center.x|type')"       "number"
  check_has "text carries the on-screen words" "$(jq1 "$JSON" '.[0].text|join(" ")')" "HELLO WORLD"
}

# ---------------------------------------------------------------------------
# D. seam: image matching
# ---------------------------------------------------------------------------
feat_image_match(){
  feature image-match "template match returns every contract field"
  fx_image
  cmd "--imagePath=\$WORK/hello.png --flash=0"
  local JSON; JSON="$(seam --imagePath="$WORK/hello.png" --flash=0)"
  check_eq "name is the template file name" "$(jq1 "$JSON" '.[0].name')" "hello.png"
  check_eq "score >= 0.99 for an exact on-screen copy" "$(jq1 "$JSON" '.[0].score >= 0.99')" "true"
  check_eq "region OCR text is HELLO WORLD" "$(jq1 "$JSON" '.[0].text[0]')" "HELLO WORLD"
  check_eq "location is {x,y}"   "$(jq1 "$JSON" '.[0].location  | has("x") and has("y")')" "true"
  check_eq "dimension is {w,h}"  "$(jq1 "$JSON" '.[0].dimension | has("width") and has("height")')" "true"
  check_eq "center is a point"   "$(jq1 "$JSON" '.[0].center.x|type')" "number"
  check_eq "clicked is null with no action" "$(jq1 "$JSON" '.[0].clicked')" "null"
}
feat_image_similarity(){
  feature image-similarity "--imageSimilarity is the score floor (accepts/rejects)"
  fx_image; fx_image_blurred
  cmd "--imagePath=\$WORK/hello_blur.png --imageSimilarity=0.5 --flash=0"
  check_eq "blurred template matches with a low floor" \
    "$(jq1 "$(seam --imagePath="$WORK/hello_blur.png" --imageSimilarity=0.5 --flash=0)" '.[0].name')" "hello_blur.png"
  check_eq "same call is rejected by a high floor" \
    "$(jq1 "$(seam --imagePath="$WORK/hello_blur.png" --imageSimilarity=0.99 --flash=0)" '.[0].status')" "notFound"
}
feat_maxsim_ceiling(){
  feature maxsim-ceiling "--maxSim is the score ceiling (rejects even a perfect match)"
  fx_image
  cmd "--imagePath=\$WORK/hello.png --maxSim=0.5 --flash=0"
  check_eq "perfect match rejected by a low ceiling" \
    "$(jq1 "$(seam --imagePath="$WORK/hello.png" --maxSim=0.5 --flash=0)" '.[0].status')" "notFound"
}
feat_text_hint(){
  feature text-hint "--textHint gates the match on the region's OCR text"
  fx_image
  cmd "--imagePath=\$WORK/hello.png --textHint=HELLO --flash=0"
  check_eq "matching hint accepts"   "$(jq1 "$(seam --imagePath="$WORK/hello.png" --textHint=HELLO --flash=0)" '.[0].name')"   "hello.png"
  check_eq "non-matching hint rejects" "$(jq1 "$(seam --imagePath="$WORK/hello.png" --textHint=NOPE --flash=0)" '.[0].status')" "notFound"
}
feat_image_wait(){
  feature image-wait "--imageWaitTime waits for a target that appears late"
  fx_blank
  ( sleep 3; display -window root "$WORK/hello.png" >/dev/null 2>&1 ) &
  cmd "--imagePath=\$WORK/hello.png --imageWaitTime=8 --flash=0   # shown 3 s after the call starts"
  check_eq "call blocks until the target appears" \
    "$(jq1 "$(seam --imagePath="$WORK/hello.png" --imageWaitTime=8 --flash=0)" '.[0].name')" "hello.png"
}
feat_image_maxcount(){
  feature image-maxcount "--imageMaxCount returns several matches"
  fx_blank; fx_two_tiles
  cmd "--imagePath=\$WORK/tile.png --imageMaxCount=2 --flash=0"
  local JSON; JSON="$(seam --imagePath="$WORK/tile.png" --imageMaxCount=2 --flash=0)"
  check_eq "two identical tiles -> two results" "$(jq1 "$JSON" 'length')" "2"
  check_eq "the two matches are at distinct centres" "$(jq1 "$JSON" '.[0].center.x != .[1].center.x')" "true"
}
feat_image_missing(){
  feature image-missing "an absent target is a status object, not an error"
  cmd "--imagePath=\$WORK/nope.png --flash=0"
  local JSON; JSON="$(seam --imagePath="$WORK/nope.png" --flash=0)"
  check_eq "status is notFound" "$(jq1 "$JSON" '.[0].status')" "notFound"
  check_eq "still a JSON array" "$(jq1 "$JSON" 'type')" "array"
}
feat_flash(){
  feature flash "--flash is the on-screen match pause (default 1 s)"
  fx_image
  cmd "--imagePath=\$WORK/hello.png            # default flash (1 s pause)"
  seam --imagePath="$WORK/hello.png" >/dev/null 2>&1                      # warm the JVM
  # Minimum of three per mode: the minimum is the least noisy estimator, and both modes
  # pay the identical JVM/match cost, so the difference is the flash itself.
  local best_def="" best_none="" ms
  for _ in 1 2 3; do
    local t0 t1; t0=$(now_ms); seam --imagePath="$WORK/hello.png" >/dev/null; t1=$(now_ms)
    ms=$(( t1 - t0 )); [ -z "$best_def" ] || [ "$ms" -lt "$best_def" ] && best_def="$ms"
  done
  for _ in 1 2 3; do
    local t0 t1; t0=$(now_ms); seam --imagePath="$WORK/hello.png" --flash=0 >/dev/null; t1=$(now_ms)
    ms=$(( t1 - t0 )); [ -z "$best_none" ] || [ "$ms" -lt "$best_none" ] && best_none="$ms"
  done
  check_ge "default flash costs >= 0.8 s more than --flash=0" "$(( best_def - best_none ))" 800
  printf '   \033[2m     measured: default %s ms vs --flash=0 %s ms\033[0m\n' "$best_def" "$best_none"
}

# ---------------------------------------------------------------------------
# E. seam: actions are really dispatched (verified against the OS pointer)
# ---------------------------------------------------------------------------
# Each action returns its click point in the JSON; comparing that with xdotool's view
# of the pointer proves the action reached the X server instead of only being reported.
action_case(){
  local action="$1" expect_click="$2"
  cmd "--imagePath=\$WORK/hello.png --imageAction=$action --flash=0"
  xdotool mousemove 3 3; sleep 0.3
  local JSON; JSON="$(seam --imagePath="$WORK/hello.png" --imageAction="$action" --flash=0)"
  local cx cy
  cx="$(jq1 "$JSON" '.[0].center.x')"; cy="$(jq1 "$JSON" '.[0].center.y')"
  if [ "$expect_click" = "click" ]; then
    check_eq "reports clicked == center" "$(jq1 "$JSON" '.[0].clicked.x')" "$cx"
  else
    check_eq "reports clicked = null" "$(jq1 "$JSON" '.[0].clicked')" "null"
  fi
  check_eq "pointer actually moved to the match centre" "$(pointer)" "$cx,$cy"
}
feat_action_click(){
  feature action-click "--imageAction=click dispatches a click at the match centre"
  fx_image; action_case click click
}
feat_action_doubleclick(){
  feature action-doubleclick "--imageAction=doubleClick"
  fx_image; action_case doubleClick click
}
feat_action_rightclick(){
  feature action-rightclick "--imageAction=rightClick"
  fx_image; action_case rightClick click
}
feat_action_hoverclick(){
  feature action-hoverclick "--imageAction=hoverClick"
  fx_image; action_case hoverClick click
}
feat_action_hover(){
  feature action-hover "--imageAction=hover moves the pointer but does not click"
  fx_image; action_case hover hover
}
feat_action_none(){
  feature action-none "--imageAction=none leaves the pointer alone"
  fx_image
  cmd "--imagePath=\$WORK/hello.png --imageAction=none --flash=0"
  xdotool mousemove 3 3; sleep 0.3
  local JSON; JSON="$(seam --imagePath="$WORK/hello.png" --imageAction=none --flash=0)"
  check_eq "clicked stays null" "$(jq1 "$JSON" '.[0].clicked')" "null"
  check_eq "pointer untouched" "$(pointer)" "3,3"
}

# ---------------------------------------------------------------------------
# F. seam: opt-in OCR mode (extension; not part of the frozen v1 contract)
# ---------------------------------------------------------------------------
feat_ocr_detect(){
  feature ocr-detect "find text on screen and report its bounding box"
  fx_ocr
  cmd "--ocrPath=\"AUTOTEST OCR\" --ocrDetail=word"
  local JSON; JSON="$(seam --ocrPath="AUTOTEST OCR" --ocrDetail=word)"
  check_eq "one match"                 "$(jq1 "$JSON" 'length')" "1"
  check_eq "matched text"              "$(jq1 "$JSON" '.[0].ocrDetails[0].text')" "AUTOTEST OCR"
  check_eq "bbox has x/y/width/height" "$(jq1 "$JSON" '.[0].ocrDetails[0] | has("x") and has("y") and has("width") and has("height")')" "true"
  check_eq "centre is the bbox centre" "$(jq1 "$JSON" '.[0].center.x')" "$(jq1 "$JSON" '.[0].ocrDetails[0].x + .[0].ocrDetails[0].width/2')"
}
feat_ocr_detail_none(){
  feature ocr-detail-none "--ocrDetail=none (default) omits the extension field"
  fx_ocr
  cmd "--ocrPath=\"AUTOTEST OCR\"        # no --ocrDetail"
  local JSON; JSON="$(seam --ocrPath="AUTOTEST OCR")"
  check_eq "ocrDetails absent"   "$(jq1 "$JSON" '.[0] | has("ocrDetails")')" "false"
  check_eq "core fields present" "$(jq1 "$JSON" '.[0] | has("name") and has("center") and has("text")')" "true"
}
feat_ocr_detail_line(){
  feature ocr-detail-line "--ocrDetail=line also reports the box"
  fx_ocr
  cmd "--ocrPath=\"AUTOTEST OCR\" --ocrDetail=line"
  check_eq "ocrDetails present" "$(jq1 "$(seam --ocrPath="AUTOTEST OCR" --ocrDetail=line)" '.[0] | has("ocrDetails")')" "true"
}
feat_ocr_similarity(){
  feature ocr-similarity "--ocrSimilarity is the OCR match floor"
  fx_ocr
  cmd "--ocrPath=\"AUTOTEST OCR\" --ocrSimilarity=0.8"
  check_eq "normal floor matches"  "$(jq1 "$(seam --ocrPath="AUTOTEST OCR" --ocrSimilarity=0.8)" '.[0].name')" "AUTOTEST OCR"
  check_eq "absent text -> notFound" "$(jq1 "$(seam --ocrPath="NO SUCH TEXT HERE")" '.[0].status')" "notFound"
}
feat_ocr_wait(){
  feature ocr-wait "--ocrWaitTime (ms) waits for text that appears late"
  convert -size 600x200 xc:white -pointsize 60 -fill black -gravity center -annotate +0+0 "AUTOTEST OCR" "$WORK/ocr.png"
  fx_blank
  ( sleep 2; display -window root "$WORK/ocr.png" >/dev/null 2>&1 ) &
  cmd "--ocrPath=\"AUTOTEST OCR\" --ocrWaitTime=8000   # shown 2 s after the call starts"
  check_eq "call waits for the late text" \
    "$(jq1 "$(seam --ocrPath="AUTOTEST OCR" --ocrWaitTime=8000)" '.[0].name')" "AUTOTEST OCR"
}
feat_ocr_action(){
  feature ocr-action "OCR actions dispatch to the OS pointer like image actions"
  fx_ocr
  cmd "--ocrPath=\"AUTOTEST OCR\" --ocrAction=click --ocrDetail=word"
  xdotool mousemove 3 3; sleep 0.3
  local JSON; JSON="$(seam --ocrPath="AUTOTEST OCR" --ocrAction=click --ocrDetail=word)"
  check_eq "reports clicked == center" "$(jq1 "$JSON" '.[0].clicked.x')" "$(jq1 "$JSON" '.[0].center.x')"
  check_eq "pointer dispatched to the reported centre" "$(pointer)" "$(jq1 "$JSON" '.[0].center.x'),$(jq1 "$JSON" '.[0].center.y')"
}
feat_ocr_psm_oem(){
  feature ocr-psm-oem "--ocrPSM/--ocrOEM are accepted without breaking detection"
  fx_ocr
  cmd "--ocrPath=\"AUTOTEST OCR\" --ocrPSM=7 --ocrOEM=3"
  check_eq "explicit PSM/OEM still matches" \
    "$(jq1 "$(seam --ocrPath="AUTOTEST OCR" --ocrPSM=7 --ocrOEM=3)" '.[0].name')" "AUTOTEST OCR"
}

# ---------------------------------------------------------------------------
# G. contract robustness
# ---------------------------------------------------------------------------
feat_json_on_error(){
  feature json-on-error "stdout still carries JSON when the display is unusable"
  cmd "DISPLAY=:77 --imagePath=Screen"
  local OUT RC
  OUT="$(DISPLAY=:77 findTargetImage --imagePath=Screen 2>/dev/null)"; RC=$?
  check_eq "exit status is 0" "$RC" "0"
  check_has "still emits the target_result line" "$OUT" "target_result:"
  check_has "payload is a JSON array"           "$OUT" "["
}
feat_additive_args(){
  feature additive-args "unknown arguments are ignored (additive contract)"
  fx_image
  cmd "--imagePath=\$WORK/hello.png --someFutureArg=1 --flash=0"
  check_eq "unknown arg does not break matching" \
    "$(jq1 "$(seam --imagePath="$WORK/hello.png" --someFutureArg=1 --flash=0)" '.[0].name')" "hello.png"
}

# ---------------------------------------------------------------------------
# H. non-functional
# ---------------------------------------------------------------------------
feat_latency(){
  feature latency "NFR-T2: warm image-match stays within budget"
  fx_image
  cmd "--imagePath=\$WORK/hello.png --flash=0   # best of 3"
  seam --imagePath="$WORK/hello.png" --flash=0 >/dev/null 2>&1        # warm
  local BEST="" ms
  for _ in 1 2 3; do
    local t0 t1; t0=$(now_ms); seam --imagePath="$WORK/hello.png" --flash=0 >/dev/null 2>&1; t1=$(now_ms)
    ms=$(( t1 - t0 )); [ -z "$BEST" ] || [ "$ms" -lt "$BEST" ] && BEST="$ms"
  done
  if [ "${BEST:-99999}" -le 1500 ]; then _ok "warm match ${BEST} ms (budget 1500 ms)"; else _no "warm match ${BEST} ms (> 1500 ms budget)"; fi
}

# ---------------------------------------------------------------------------
# catalogue: "<group>|<id>|<one-line description>"
# ---------------------------------------------------------------------------
GROUP_A="A — runtime substrate (L0)"
GROUP_B="B — display + desktop (L0)"
GROUP_C="C — seam: whole-screen OCR mode"
GROUP_D="D — seam: image matching"
GROUP_E="E — seam: actions (verified against the OS pointer)"
GROUP_F="F — seam: opt-in OCR mode (extension)"
GROUP_G="G — contract robustness"
GROUP_H="H — non-functional"

FEATURES=(
  "$GROUP_A|tools|essentials present (Xvfb, ImageMagick, ffmpeg, xdotool, jq, seam)"
  "$GROUP_A|java17|Java is the pinned 17 series (Oculix floor)"
  "$GROUP_A|natives|Oculix natives baked and registered with the loader"
  "$GROUP_A|screen-only|screen-only image: no browser, no webdriver runner"
  "$GROUP_A|provenance|/etc/autobdd-versions records the build inputs"
  "$GROUP_B|display|Xvfb serves DISPLAY at the requested geometry"
  "$GROUP_B|wm|window manager (openbox) is running"
  "$GROUP_B|vnc|x11vnc exposes the desktop on :5900"
  "$GROUP_B|pointer|xdotool drives the X pointer (mouse substrate)"
  "$GROUP_C|screen-mode|--imagePath=Screen OCRs the whole screen"
  "$GROUP_D|image-match|template match returns every contract field"
  "$GROUP_D|image-similarity|--imageSimilarity floor accepts/rejects"
  "$GROUP_D|maxsim-ceiling|--maxSim ceiling rejects"
  "$GROUP_D|text-hint|--textHint gates on region OCR text"
  "$GROUP_D|image-wait|--imageWaitTime waits for a late target"
  "$GROUP_D|image-maxcount|--imageMaxCount returns several matches"
  "$GROUP_D|image-missing|absent target -> status object, not an error"
  "$GROUP_D|flash|--flash is the on-screen match pause"
  "$GROUP_E|action-click|--imageAction=click"
  "$GROUP_E|action-doubleclick|--imageAction=doubleClick"
  "$GROUP_E|action-rightclick|--imageAction=rightClick"
  "$GROUP_E|action-hoverclick|--imageAction=hoverClick"
  "$GROUP_E|action-hover|--imageAction=hover (no click)"
  "$GROUP_E|action-none|--imageAction=none leaves the pointer alone"
  "$GROUP_F|ocr-detect|find text on screen, report its box"
  "$GROUP_F|ocr-detail-none|--ocrDetail=none omits the extension field"
  "$GROUP_F|ocr-detail-line|--ocrDetail=line reports the box"
  "$GROUP_F|ocr-similarity|--ocrSimilarity floor and absent-text notFound"
  "$GROUP_F|ocr-wait|--ocrWaitTime waits for late text"
  "$GROUP_F|ocr-action|OCR action dispatches to the OS pointer"
  "$GROUP_F|ocr-psm-oem|--ocrPSM/--ocrOEM accepted"
  "$GROUP_G|json-on-error|unusable display still yields JSON on stdout"
  "$GROUP_G|additive-args|unknown arguments are ignored"
  "$GROUP_H|latency|NFR-T2 warm match within budget"
)

# run_feature <id> — call the feat_ function for an id
run_feature(){
  local id="$1" fn; fn="feat_$(printf '%s' "$id" | tr '-' '_')"
  if ! declare -F "$fn" >/dev/null; then echo "unknown feature: $id" >&2; return 2; fi
  "$fn"
}
feature_ids(){ printf '%s\n' "${FEATURES[@]}" | cut -d'|' -f2; }
