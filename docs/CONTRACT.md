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
findTargetImage [--<arg>=<value> ...]
```

Writes one line to **stdout**: `target_result: <json>` (a JSON array). The caller parses
from the first `[` to the last `]`.

## 2. Arguments

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
| `center` | `{x,y}` | Click point (used by `--imageAction`). |
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

## 5. Guarantees

- **Screen-only capable:** this seam needs **no browser** — it is the interface that makes
  `autobdd-base` runnable on its own (screen-only mode) and drivable by a foreign framework.
- **Stable JSON:** fields are additive; consumers MUST ignore unknown fields.
- **Exit behavior:** the process prints the result and exits; callers parse stdout only.

## 6. Not part of the contract

- The internal JS library (`third_party/xysikulixapi`) and its runtime (java-bridge/JVM).
- The step-library source (that is L2 / `autobdd-framework`).
