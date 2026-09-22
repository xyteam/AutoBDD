# AutoBDD base — screen-engine CLI-seam contract

**Status:** frozen in **v1** (Phase A) · **Applies to:** `xyteam/autobdd-base`
(L0+L1) · **Consumers:** AutoBDD's own step libraries, and any **bring-your-own
framework** built `FROM autobdd-base`.

This is the **public interface of the base image**: how any framework, in any language,
makes AutoBDD *see the screen and act on it*. It is deliberately a **CLI + JSON** seam so
consumers never import our code — they shell out.

> Stability: the **argument names** and the **JSON shape** below are the versioned
> contract. Additive fields/args are non-breaking; renames/removals are a **major** change.

---

## 1. Command

```
autobdd <verb> [--<arg>=<value> ...]      # the front door
  autobdd find-target …                   # locate a target, optionally act on it
  autobdd read-text                       # read the screen as text

findTargetImage [--<arg>=<value> ...]     # DEPRECATED alias for `autobdd find-target`
```

The front door is the interface; the verbs are verb-object so a call reads as an
instruction. `read-text` is `find-target`'s whole-screen mode given its own name, so that
reading the screen is not spelled as "find a target called Screen".

**`findTargetImage` remains supported and behaviourally identical** — it is a deprecated
alias that prints a one-line notice on **stderr** (never stdout, which is parsed as the
payload) and then defers to the front door, so any future argument translation applies to
it without a second implementation. Removal will be a future major.

Writes one line to **stdout**: `target_result: <json>` (a JSON array). The caller parses
from the first `[` to the last `]`. The target is **required**: omitting it is a usage error
(exit 2), not an implicit whole-screen scan — see §4b.

## 1b. Entry points and PATH

| Path | Role |
|---|---|
| `/usr/local/bin/autobdd` | the front door (the interface) |
| `/usr/local/bin/findTargetImage` | deprecated alias, stderr notice only |
| `/usr/local/libexec/autobdd/{find-target,read-text}` | verb-named entry points, **not on PATH** |
| `/opt/autobdd/seam/src/findTargetImage.js` | the engine (one implementation) |

Only the front door and the deprecated alias are on `PATH`, so a derived image cannot
shadow the engine or collide with the verb names.

## 2. Arguments

Canonical (v2) vocabulary. Names mirror the JSON fields they control (`--min-score` ↔
`score`, `--box` ↔ `ocrDetails`, `--limit` ↔ the array length), and durations carry their
unit, so a value cannot be misread.

| Argument | Default | Meaning |
|---|---|---|
| `--match-image=<file\|Screen>` | — | the target picture. `Screen` reads the whole screen as text. **Required** unless `--match-text` is given. |
| `--match-text=<text>` | — | the target text. With `--match-image` it gates the matched region; alone it searches the screen. |
| `--match-regex` | off | treat `--match-text` as a regular expression (default: literal substring, case‑insensitive) |
| `--min-score=<0-1>` | 0.8 | score floor |
| `--max-score=<0-1>` | 1 | score ceiling |
| `--wait=<dur>` | 1s | wait for the target. Durations carry a unit: `5s`, `800ms`; a bare number means seconds. |
| `--limit=<n>` | 1 | at most n matches |
| `--flash=<dur>` | 1s | on‑screen match flash; `0s` disables the pause |
| `--click` `--double-click` `--right-click` `--hover` | off | actions, composable — `--hover --click` means hover then click |
| `--box[=<none\|line\|word>]` | off | include the matched box |
| `--psm=<n>` `--oem=<n>` | 7 / 3 | Tesseract knobs |

Presence of a predicate defines the mode, so there are no modes to remember: `--match-image`
alone, `--match-text` alone, or both (picture gated on its region's text).

## 2b. Deprecated v1 arguments

Still accepted, translated in the engine, and warned about **on stderr** (stdout stays pure
payload). Removal is a future major.

| v1 | becomes |
|---|---|
| `--imagePath` | `--match-image` |
| `--ocrPath` | `--match-text` |
| `--textHint` | `--match-text --match-regex` (v1 was regex; the new default is literal) |
| `--imageSimilarity`, `--ocrSimilarity` | `--min-score` |
| `--maxSim`, `--ocrMaxSim` | `--max-score` |
| `--imageWaitTime` (seconds) | `--wait` (e.g. `5s`) |
| `--ocrWaitTime` (milliseconds) | `--wait` (e.g. `800ms`) |
| `--imageMaxCount`, `--ocrMaxCount` | `--limit` |
| `--imageAction`, `--ocrAction` | `--click` / `--double-click` / `--right-click` / `--hover` (`single` and `hoverClick` are accepted) |
| `--ocrDetail` | `--box` |
| `--ocrPSM`, `--ocrOEM` | `--psm`, `--oem` |

## 2c. Raw argument reference (v1 — deprecated)

Kept only as a reference for the v1 semantics; §2b maps every row to its v2 replacement.

| Arg | Type | Default | Meaning |
|---|---|---|---|
| `--imagePath` | string | `Screen` | Path to the **target image**, or `Screen` for whole-screen OCR mode. |
| `--imageSimilarity` | float | `0.8` | Minimum match score (floor). |
| `--maxSim` | float | `1` | Maximum accepted score (ceiling). |
| `--textHint` | regex string | `''` | If set, the matched region's OCR text must match this regex. |
| `--imageWaitTime` | int (s) | `1` | Auto-wait timeout for the find. |
| `--imageAction` | enum | `none` | `none` \| `click`/`single` \| `hover` \| `hoverClick` \| `doubleClick` \| `rightClick`. |
| `--imageMaxCount` | int | `1` | Max number of matches to return/act on. |
| `--flash` | float (s) | `1.0` | Duration of the on-screen match flash (visual feedback; captured into step screenshots). |

## 3. Output (JSON)

An **array**. On success, one object per match:

```json
[
  {
    "name": "target.png",
    "score": 0.999999,
    "text": ["...ocr lines of the matched region..."],
    "location":  { "x": 350, "y": 225 },
    "dimension": { "width": 200, "height": 150 },
    "center":    { "x": 450, "y": 300 },
    "clicked":   null
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `name` | string | The target image file name (or `Screen`). |
| `score` | float \| null | Match similarity (6-dp); `null` in Screen mode. |
| `text` | string[] | OCR lines of the matched region (Screen mode: whole screen). |
| `location` | `{x,y}` | Top-left of the match, screen pixels. |
| `dimension` | `{width,height}` | Match size in pixels. |
| `center` | `{x,y}` | Click point (used by the click actions). |
| `clicked` | `{x,y}` \| null | Set when an action was performed. |

**Not found:** the array contains a single status object:

```json
[ { "status": "notFound" } ]
```

## 4. Environment inputs

| Env | Required | Meaning |
|---|---|---|
| `DISPLAY` | yes | X display to capture/act on (Xvfb; exported before the JVM/GUI start). |
| `SCREENSHOT` | no | When `>= 1`, the match flash frame is captured (used by step screenshots). |
| `TESSDATA_PREFIX` | no | OCR data path (Oculix bundles its own tessdata). |
| `OMP_THREAD_LIMIT`, `LC_ALL`, `LC_CTYPE` | no | OCR/native tuning (set to `1`, `C`, `C`). |

## 4b. Discovery and failure modes (additive)

The discovery questions are answered **before** the JVM and the native engine start, so
asking what the tool does costs ~40 ms instead of a whole-screen OCR scan:

| Arg | Behaviour |
|---|---|
| `--help`, `-h` | usage: flows, output shape, exit codes, every flag with its default. Exit 0. |
| `--version` | the seam, the image's build stamp (from `/etc/autobdd-versions`), Oculix and Node versions. Exit 0. |
| `--list` | the supported flows, one runnable example per line. Exit 0. |

Two failure modes are explicit rather than silent:

* **Unknown arguments** are warned about on **stderr** and otherwise ignored (the argument
  surface is additive, so an older consumer must keep working).
* **Unusable values** (a non-numeric threshold, an unknown `--box` level)
  print `findTargetImage: <flag> expects …` on stderr and exit **2**. Silently behaving
  like the default would look like a successful call to an automated caller.

## 5. Guarantees

- **Screen-only capable:** this seam needs **no browser** — it is the interface that makes
  `autobdd-base` runnable on its own (screen-only mode) and drivable by a foreign framework.
- **Stable JSON:** fields are additive; consumers MUST ignore unknown fields.
- **Exit behavior:** `0` when a result was produced — **including `notFound`**, which is an
  answer, not a fault (branch on `.[0].status`). `2` for a usage error. Callers parse stdout
  only; the JSON payload is always the line carrying `target_result:`.
- **Discovery never touches the screen:** `--help`/`--version`/`--list` do not start the
  engine and never scan.

## 6. Not part of the contract

- The internal JS library (`third_party/xysikulixapi`) and its runtime (java-bridge/JVM).
- The step-library source (that is L2 / `autobdd-framework`).
