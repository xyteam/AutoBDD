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
findTargetImage \
    --imagePath=<path-to‑template.png> \
    --imageSimilarity=0.8 \
    --maxSim=1.0 \
    --imageWaitTime=1000 \
    --imageAction=click \
    --imageMaxCount=1
```

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
| `--ocrDetail <none|line|word>` | string | `none` | Level of OCR detail to include in the output: <br>• `none` – no extra OCR data (backward‑compatible).<br>• `line` – one entry per OCR line.<br>• `word` – one entry per OCR word. |
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
  "clicked": { "x":<num>, "y":<num> } | null,
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
  The Oculix natives are extracted at runtime and copied into `/opt/oculix-natives`,
  making them available via `LD_LIBRARY_PATH`.
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

## Try it and see the report

This repo ships two suites. Both run the **locally built** image only
(`pull_policy: never` — build it, or pre‑pull the published tag):

* **`test-projects/autobdd-base-test`** – a **no‑browser** conformance suite for the
  **base** image (L0/L1 + the frozen CLI seam). Fast; no Chrome required:

  ```bash
  cd test-projects/autobdd-base-test
  AutoBDD_Ver=<v> make docker-run jobs="base-test"
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

*This README reflects the current state of the `master` branch, including the opt‑in OCR
arguments, native‑library handling, and the updated public contract of the
`findTargetImage` seam.*