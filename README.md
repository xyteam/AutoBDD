# AutoBDD

**AutoBDD** — a BDD automation framework that drives the **screen** (image matching +
OCR), not just the DOM. `package.json` `3.0.0`.

## What this repository is (and isn't)

This repo is the **framework source and the build source of the AutoBDD docker
images**. You do **not** need to clone it to use AutoBDD.

* The images are built here and **published to Docker Hub**:
  **`xyteam/autobdd-base`** and **`xyteam/autobdd-framework`**. **`xyteam/autobdd`**
  is kept as a **deprecated alias** of `autobdd-framework` (same image, two tags),
  so existing consumers keep working.
* The image is **Ubuntu 24.04** based.
* **Test repositories pull and run the image directly** — e.g.
  [AutoBDD-example](https://github.com/xyteam/AutoBDD-example) runs its suite
  against `xyteam/autobdd:<version>` with no framework clone required.
* **Clone only to inspect/build the AutoBDD docker image.**

```bash
# a test repo selects the published image via AutoBDD_Ver and runs its own compose;
# no AutoBDD framework clone is required
cd ~/Projects/AutoBDD-example
AutoBDD_Ver=3.0.0 ABDD_PROJECT=AutoBDD-example \
  USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
  docker compose run --rm autobdd-example-run "make e2e-test"
# (see the test repo's docker-compose.yml / README for its exact run service)
```

## Two images, two layers

The product is published as two tags that are also two **layers** of one stack:

| Tag | Layers | Contains | Use when |
|-----|--------|----------|----------|
| **`xyteam/autobdd-base`** | **L0** OS + essentials, X display + desktop (Xvfb/openbox/x11vnc) · **L1** screen engine (Java 17 + Node + the Oculix bridge) | **no browser, no WebdriverIO** | you want **screen-only** automation, or you are building **your own framework** on top |
| **`xyteam/autobdd-framework`** | L0 + L1 **+ L2** | Chrome + matching chromedriver · WebdriverIO · Cucumber · the AutoBDD step library | you want the ready‑made BDD framework and HTML reports |

`xyteam/autobdd:<v>` is a **deprecated alias** of `xyteam/autobdd-framework:<v>`.

## The public interface of the base image (the frozen seam)

The base image exposes a single command‑line program, **`findTargetImage`**, which is the
frozen public contract described in [`docs/CONTRACT.md`](docs/CONTRACT.md).  
All communication with the base image happens through this program; it returns a JSON
object (or array) on **stdout**.

### Basic usage (image matching)

```bash
autobdd find-target --match-image=<path-to-template.png> \
                    --min-score=0.8 --max-score=1.0 \
                    --wait=5s --click --limit=1
```

### The front door

```bash
autobdd find-target --match-image=logo.png --click    # locate, then click
autobdd find-target --match-text="Submit" --box       # find text, report its box
autobdd read-text                                     # read the whole screen as text
autobdd --help                                        # verbs, flags, exit codes
```

`findTargetImage` still works and is behaviourally identical — it is a **deprecated alias**
that prints one line to **stderr** and defers to the front door, so a v1 consumer keeps
working unchanged. **The conformance suite defaults to the front door**; set
`TARGET_BIN=findTargetImage` to run the same matrix through the alias. The engine lives at `/opt/autobdd/seam/src/`, out of `PATH`; only the
front door and the alias are on it, so a derived image cannot shadow either.

The target is **required**: `autobdd find-target` with no target exits `2` and points at
`read-text`. (It used to default to a whole-screen scan, so a mistyped flag silently cost
~3 s and looked like a successful call.)

The suite defaults to the **front door**. Run it through the deprecated alias instead to
prove the alias is still transparent:

```bash
AutoBDD_Ver=<v> make docker-run jobs="base-test"                  # default: the front door
AutoBDD_Ver=<v> docker compose run --rm \
  -e TARGET_BIN=findTargetImage autobdd-base-test make base-test   # the deprecated alias
```

### Discovery and exit status

```bash
findTargetImage --help        # flows, output shape, exit codes, every flag + default
findTargetImage --list        # the supported flows, one runnable example per line
findTargetImage --version     # seam, image build stamp, Oculix, Node
```

These are answered **before the JVM and native engine start** — measured at ~40 ms, versus
~1.1 s for a real match, and they never touch the screen. Exit status is `0` when a result
was produced — **including `notFound`, which is an answer, not a fault** (branch on
`.[0].status`) — and `2` for a usage error. Unknown arguments warn on stderr and are
otherwise ignored, because the argument surface is additive; an *unusable value* (a
non‑numeric threshold, an unknown `--imageAction`) exits `2` instead of silently behaving
like the default.

### Opt‑in OCR mode (new)

All OCR‑related arguments are **optional**; if none of them are supplied the seam
behaves exactly as described above (pure image matching).  
When `--ocrPath` is supplied the seam runs OCR instead of image matching.

| Argument | Type | Default | Meaning |
|----------|------|---------|---------|
| `--ocrPath <text>` | string | *(required for OCR mode)* | Text to search for via OCR. |
| `--ocrSimilarity <float>` | float | `0.8` | Minimum OCR confidence (0‑1) to treat as a match. |
| `--ocrMaxSim <float>` | float | `1.0` | Maximum OCR confidence (upper bound). |
| `--ocrWaitTime <ms>` | integer | `1000` | How long (ms) to wait for the OCR text to appear (polls until found or timeout). |
| `--ocrMaxCount <int>` | integer | `1` | Maximum number of OCR matches to return. |
| `--ocrAction <action>` | string | `none` | Action to perform on each OCR match: `none`, `click`, `doubleClick`, `rightClick`, `hover`, `hoverClick`. |
| `--ocrDetail <none|line|word>` | string | `none` | Include the OCR bounding box in the result. `line` and `word` both emit the matched text region: a tight box when the engine exposes one for the query, otherwise the searched region's rectangle. `none` omits `ocrDetails` entirely (backward‑compatible). |
| `--ocrPSM <int>` | integer | `7` | Tesseract Page Segmentation Mode (passed through to Oculix). |
| `--ocrOEM <int>` | integer | `3` | Tesseract OCR Engine Mode (passed through to Oculix). |

### Output format (backward‑compatible)

The seam always returns a JSON array (or a single `{status:'notFound'}` object).  
Each result object contains the original fields:

```json
{
  "name": "<string>",                 // matched text (or template name)
  "score": <number>,                  // OCR confidence (0‑1) or image similarity
  "text": [<string>, ...],           // OCR lines (full text split by '\n')
  "location": { "x":<num>, "y":<num>, "width":<num>, "height":<num> },
  "dimension": { "width":<num>, "height":<num> },
  "center": { "x":<num>, "y":<num> },
  "clicked": { "x":<num>, "y":<num> } | null,   // set only for clicking actions (click/doubleClick/rightClick/hoverClick)
  "ocrDetails": [                     // <-- ONLY present when --ocrDetail ≠ none
    {
      "text": "<string>",             // the OCR word or line
      "x":<num>, "y":<num>,           // top‑left corner
      "width":<num>, "height":<num>,  // size in pixels
      "confidence":<number>           // OCR confidence for this token (0‑1)
    },
    ...
  ]
}
```

If `--ocrDetail=none` (the default) the `ocrDetails` field may be omitted or set to
an empty array – existing parsers that ignore this field see no change.

### Example usages

* **Detect a word and get its bounding box (no action)**  

  ```bash
  findTargetImage --ocrPath="SUBMIT" --ocrDetail=word
  ```

* **Click the first occurrence of a word**  

  ```bash
  findTargetImage --ocrPath="SUBMIT" --ocrAction=click --ocrDetail=word
  ```

* **Double‑click the second occurrence of a phrase**  

  ```bash
  findTargetImage --ocrPath="END TEST" --ocrAction=doubleClick \
                  --ocrDetail=word --ocrMaxCount=2
  ```

* **Hover over a line of text (no click)**  

  ```bash
  findTargetImage --ocrPath="Status:" --ocrAction=hover --ocrDetail=line
  ```

* **Combine image matching with OCR gating (textHint)** – unchanged from the original
  seam; see `docs/CONTRACT.md` for details.

## Under the hood

* **Base** (`xyteam/autobdd-base`): Ubuntu 24.04 · Java 17 · Node 20 · Xvfb/openbox/x11vnc ·
  the Oculix 4.0.0 screen engine exposed as the `findTargetImage` CLI seam.
  The Oculix natives bundled in the engine JAR are extracted **at image‑build time**
  into `/opt/oculix-natives` and registered with `ldconfig`, so the image is
  self‑contained: no on‑demand extraction at run time and no need for a writable
  `/tmp` or `/root`.
* **Framework** (`xyteam/autobdd-framework`): base + Chrome and a **matching
  chromedriver** on PATH, WebdriverIO 9 (Cucumber), the AutoBDD step library.
* Runs with `docker compose` (Compose v2).
* Reports: HTML with step screenshots (pass/fail watermarks) and test movies.

## Version differences

| Release | Chrome | WebdriverIO | Node | Runtime |
|---------|--------|-------------|------|---------|
| **v2.3.0** | 96 | 7 | 12 | original pinned runtime (Node 12.22.7 + Chrome 96) |
| **v2.4.0** | modern (latest stable, e.g. 153) | 7 | 14 | re‑activated v2.3.0 line; builds against current Chrome; matching browser driver baked into the image |
| **v3.0.0** | modern (latest stable, e.g. 153) | 9 | 20 | runtime re‑baseline: Node 20 + Java 17 + WebdriverIO 9 + Oculix 4.0.0 (image matching/OCR) |

> From the next release the product is published as two tags — **`xyteam/autobdd-base`**
> (screen‑only) and **`xyteam/autobdd-framework`** (the full product), with
> **`xyteam/autobdd`** as a **deprecated alias**. See **Two images, two layers** above and
> [`docs/CONTRACT.md`](docs/CONTRACT.md) for the base's public seam.

## Feature conformance — what the base image can do, and how to check each bit

The base image's feature set is enumerated as a **catalogue** in
`test-projects/autobdd-base-test/base-test/features.sh` (currently **44 features**).
The suite is organised per feature, and every feature prints the single command that
reproduces it — so the output doubles as documentation.

**One-liner: run the whole feature matrix and see the full result**

```bash
cd test-projects/autobdd-base-test
AutoBDD_Ver=<v> make docker-run jobs="base-test"    # ~3.5 min; ends "ALL FEATURES OK"
```

```text
════════════════════════════════════════════════════════════════════════════
 AutoBDD base image — feature conformance
   image   : xyteam/autobdd-base  (built 2026-09-22T19:02:59Z)
   display : :1  1920x1200x24
   surface : /usr/local/libexec/autobdd/find-target
   catalogue: 44 features — see base-test/features.sh

 reproduce ALL features (inside the image):
   AutoBDD_Ver=<v> make docker-run jobs="base-test"
 reproduce ONE feature:
   AutoBDD_Ver=<v> make one FEATURE=image-match
 list the catalogue:
   AutoBDD_Ver=<v> make docker-run jobs="base-test/one.sh --list"
════════════════════════════════════════════════════════════════════════════

  D — seam: image matching

▸ image-similarity — accept a weak match at a low floor and reject it at a high one
   repro: base-test/one.sh image-similarity
   run:    findTargetImage --imagePath=/tmp/base-test.VGxClH/hello_blur.png \
             --imageSimilarity=0.5 --flash=0   [rc=0]
   ✓ a low floor accepts the blurred template = hello_blur.png
   run:    findTargetImage --imagePath=/tmp/base-test.VGxClH/hello_blur.png \
             --imageSimilarity=0.99 --flash=0   [rc=0]
   ✓ a high floor rejects it = notFound

▸ flash — hold the on-screen match flash for the requested time
   repro: base-test/one.sh flash
           timed without the fixture re-show (NOSHOW=1)
   run:    findTargetImage --imagePath=/tmp/.../hello.png   [rc=0]
   run:    findTargetImage --imagePath=/tmp/.../hello.png --flash=0   [rc=0]
           measured: default 2241 ms vs --flash=0 1338 ms -> delta 903 ms
   ✓ the default flash pauses for at least 0.5 s (0 ms would mean the flash is not applied) = 903 (>= 500)
   ✓ the flash pause is bounded = 903 ms (<= 2500)

════════════════════════════════════════════════════════════════════════════
feature conformance: 130 passed, 0 failed
ALL FEATURES OK
════════════════════════════════════════════════════════════════════════════
```

**Reading a run.** Each feature prints `▸ <id> — <one imperative sentence>` (the intent),
then one line per **invocation actually executed**:

| Line | Meaning |
|---|---|
| `run:` | the **exact argv** that ran, with its exit status. A check can never narrate a command it did not run, and a multi-invocation feature prints *every* invocation instead of one aspiration. |
| `probe:` | a host-side command, printed then run from the same string — so every printed line is literally runnable. |
| `✓ <what> = <observed>` | the assertion **and the value observed**, so a green run is evidence, not a checklist. |
| `known-gap:` | a documented limitation that is deliberately *not* asserted (see below). |
| `✗ <what> (got X, want Y)` | a failure, with both values; failures are collected per feature at the end. |


**One-liner: reproduce a single feature, or a whole group**

```bash
cd test-projects/autobdd-base-test
AutoBDD_Ver=<v> make one FEATURE=image-match     # one feature
AutoBDD_Ver=<v> make one FEATURE=D               # every D-group feature
AutoBDD_Ver=<v> make docker-run jobs="base-test/one.sh --list"   # list the catalogue
```

Each feature is one line to reproduce inside the image: `base-test/one.sh <feature>`.

| Group | Features | What it establishes |
|---|---|---|
| **A — runtime substrate** | `tools` `java17` `natives` `screen-only` `provenance` | the L0 essentials are present, Java is the pinned 17 series, the Oculix natives are baked and loader‑visible, the image really is browser‑free, and `/etc/autobdd-versions` records the build inputs |
| **B — display + desktop** | `display` `wm` `vnc` `pointer` | Xvfb serves `DISPLAY` at the requested geometry, openbox runs, x11vnc exposes `:5900`, and the OS pointer can be driven |
| **C — whole‑screen OCR** | `screen-mode` | `--imagePath=Screen` returns the whole screen's text with `score: null` |
| **D — image matching** | `image-match` `image-similarity` `maxsim-ceiling` `text-hint` `image-wait` `image-maxcount` `image-missing` `flash` | every contract field; the similarity **floor** and `maxSim` **ceiling**; `--textHint` gating; `--imageWaitTime` waiting for a late target; several matches via `--imageMaxCount`; `notFound` as a status object; the `--flash` pause |
| **E — actions** | `action-click` `action-doubleclick` `action-rightclick` `action-hoverclick` `action-hover` `action-none` | each `--imageAction` is **verified against the OS pointer** (`xdotool`), so a reported click point must equal where the pointer actually went |
| **F — opt‑in OCR** | `ocr-detect` `ocr-detail-none` `ocr-detail-line` `ocr-similarity` `ocr-wait` `ocr-action` `ocr-psm-oem` | text search by `--ocrPath`, the optional `ocrDetails` box, its floor, wait, action dispatch and PSM/OEM pass‑through |
| **G — contract robustness** | `json-on-error` `additive-args` | an unusable display still yields JSON on stdout with exit 0, and unknown arguments are ignored (additive contract) |
| **H — non‑functional** | `latency` | NFR‑T2: a warm image match stays inside its budget |
| **I — discovery** | `help` `version` `list` `usage-error` | the tool explains itself *without* starting the engine (~40 ms, no screen scan), reports what is running, lists its flows, and fails loudly on an unusable value |
| **J — front door** | `front-door-help` `front-door-read-text` `front-door-find-target` `front-door-unknown-verb` `alias-transparent` | the `autobdd <verb>` layer; `read-text` is its own verb; `find-target` without a target is a usage error; and the deprecated alias stays transparent (notice on stderr, stdout carries exactly one result line) |

**Reading a run.** Each feature prints `▸ <feature> — <what it checks>`, the exact `cmd:`
line, then one `✓`/`✗` per assertion. Failures are collected at the end grouped by
feature, and groups can be run alone by letter, which makes a red run easy to bisect.

**Notes on coverage honesty**

* `SCREENSHOT` appears in `docs/CONTRACT.md` §4 but is **not implemented by the base
  seam** (it is an L2/framework concern — the framework's hooks capture the flash frame).
  It is deliberately absent from the catalogue rather than asserted falsely.
* Timing‑based checks (`flash`, `latency`) use the **minimum of three** runs, because the
  minimum is the least noisy estimator of a fixed cost; their thresholds are stated in the
  output so a regression is visible, not merely caught.
* `--flash=0` is used except where the flash is the subject: the flash is a pure visual
  pause, and paying ~1 s for it on every feature would triple the run time for no extra
  coverage. The `flash` feature measures the default path explicitly.
* **`--ocrSimilarity` is accepted but not applied.** Measured: with the text on screen,
  `--ocrSimilarity=0.99` still matches, because this build's OCR path exposes no per‑match
  confidence to filter on. The *image* floor **is** applied (`image-similarity` asserts both
  directions). The report prints a `known-gap:` line rather than asserting a rejection that
  would pass only when the screen happens to be blank — a false green.
* **`--ocrDetail=word` reports the matched region**, not one entry per token (a tight box
  when the engine exposes one, otherwise the searched region's rectangle).
* Feature descriptions live in the catalogue table alone, so `--list`, the suite headers and
  the run lines cannot drift apart.



## Try it and see the report

This repo ships two suites. Both run the **locally built** image only
(`pull_policy: never` — build it, or pre‑pull the published tag):

* **`test-projects/autobdd-base-test`** – the **no‑browser** feature‑conformance suite for
  the **base** image (L0/L1 + the frozen CLI seam). 44 features, no Chrome required. See
  **Feature conformance** above for the one‑liners and the catalogue:

  ```bash
  cd test-projects/autobdd-base-test
  AutoBDD_Ver=<v> make docker-run jobs="base-test"   # whole feature matrix
  AutoBDD_Ver=<v> make one FEATURE=action-hover      # one feature
  ```

* **`test-projects/autobdd-framework-test`** – the full framework suite. Run it to see
  AutoBDD's reports for yourself — step screenshots (with green/red pass/fail watermarks
  and image‑match markers), per‑scenario movies, and the HTML report:

  ```bash
  cd test-projects/autobdd-framework-test
  AutoBDD_Ver=<v> ABDD_PROJECT=autobdd-framework-test \
    USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
    make docker-run jobs="clean e2e-test"
  # then open test-results/e2e-test/*/index.html
  ```

## Credits

* Screen image matching / OCR: **[oculix-org/Oculix](https://github.com/oculix-org/Oculix)** —
  the engine AutoBDD uses to see the screen. OculiX carries the SikuliX lineage
  ([RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)) forward in its own project.
* Keyboard/mouse: **[octalmage/robotjs](https://github.com/octalmage/robotjs)**.
* Demo app and pre‑canned Cucumber‑JS steps adapted from
  **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**.
* Framework control from
  **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)**.

--- 

*This README reflects the current state of this branch, including the opt‑in OCR
arguments, native‑library handling, and the updated public contract of the
`findTargetImage` seam.*