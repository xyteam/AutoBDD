# AutoBDD base — 4.0.0

**A docker-runnable GUI with a screen engine, driven by higher-level tools.** The image
provides the display, a desktop, and one CLI that finds things on screen — a picture, or
text — and can act on them. Your framework, your scripts or an agent do the driving.

It is deliberately only the **substrate**: no browser, no test runner, no BDD layer.

> **Looking for the 3.0.0 framework line** (`xyteam/autobdd-framework`, Chrome +
> WebdriverIO + Cucumber, and the `xyteam/autobdd` alias)? That release is frozen and
> documented in **[README-3.0.0.md](README-3.0.0.md)**.

---

## Run it

```bash
docker pull xyteam/autobdd-base:4.0.0
```

The image has **no default command** — it exposes a display, a desktop and a CLI, and you
choose how to start it. Two modes:

### A. The GUI desktop — the normal way

Starts Xvfb, openbox, lxpanel/pcmanfm, x11vnc and sshd under supervisord, then stays up:

```bash
docker run -d --name autobdd \
  -p 5900:5900 -p 2222:22 \
  -e RESOLUTION=1920x1200x24 \
  xyteam/autobdd-base:4.0.0 \
  /root/autobdd-dev.startup.sh

# watch it
vncviewer localhost:5900                 # or Remmina, or any VNC client
```

| Port | Service |
|---|---|
| `5900` | VNC on the desktop |
| `22`   | ssh (`ssh -p 2222 <user>@localhost`, password `ubuntu` unless `PASSWORD` is set) |

Set `VNC_PASSWORD` to require a password. Everything in the desktop — including the screen
the engine sees — is the display `:1`.

### B. One-shot, no desktop

Use the run bootstrap, which prepares the user and then `exec`s your command. This is how
the conformance suite drives the image:

```bash
docker run --rm --entrypoint /root/autobdd-run.startup.sh xyteam/autobdd-base:4.0.0 \
  bash -c 'Xvfb :1 -screen 0 1920x1200x24 & sleep 2; export DISPLAY=:1; autobdd read-text'
```

> **`DISPLAY` matters, and forgetting it fails quietly.** The startup scripts set it for
> **login shells only**, and the image sets no `DISPLAY` in its environment. Without it the
> engine cannot open the display, and a call answers **`{"status":"notFound"}`** — an
> ordinary-looking "not on screen" — rather than an error. So with `docker exec`, pass
> `-e DISPLAY=:1` explicitly. (Measured: identical call, `rc=0` either way; the payload is
> the only difference.)

---

## Drive it

Everything the image can do is one command, `autobdd`, described in
[`docs/CONTRACT.md`](docs/CONTRACT.md). It writes a JSON object (or array) to **stdout** on
a single line — so a caller parses stdout and branches on the exit status, nothing else.

```bash
autobdd find-target --match-image=logo.png --click    # locate a picture, then click it
autobdd find-target --match-text="Submit" --box       # find text and report its box
autobdd read-text                                     # read the whole screen as text
autobdd --help                                        # verbs, flags, exit codes
```

The verbs are verb-object, so a call reads as an instruction.

### From a higher-level tool

```bash
# run it inside the running container (note DISPLAY: the startup script only sets it for logins)
docker exec -e DISPLAY=:1 autobdd find-target --match-image=/tmp/logo.png --click
# -> {"...":"..."} on stdout; exit 0 when a result was produced, 2 for a usage error
```

| Exit | Meaning |
|---|---|
| `0` | a result was produced — **including `notFound`**, which is an answer, not a fault (branch on `.[0].status`) |
| `2` | usage error: an unparseable number, an unknown action or box level |

Unknown arguments warn on **stderr** and are otherwise ignored, so the argument surface can
grow without breaking a caller.

### Discovery costs nothing

```bash
autobdd --help        # flows, output shape, exit codes, every flag with its default
autobdd --list        # the supported flows, one runnable example per line
autobdd --version     # version, image build stamp, Oculix, Node
```

These are answered **before the JVM and native engine start** — measured at ~40 ms, versus
~1.1 s for a real match — and they never touch the screen. Asking a tool what it does should
not cost a scan.

### Arguments

The authoritative list is [`docs/CONTRACT.md`](docs/CONTRACT.md) §2. The shape:

| Argument | Default | Meaning |
|---|---|---|
| `--match-image=<file\|Screen>` | — | the target picture; `Screen` reads the whole screen. Required unless `--match-text` is given. |
| `--match-text=<text>` | — | the target text. With `--match-image` it gates the matched region; alone it searches the screen. |
| `--match-regex` | off | treat `--match-text` as a regex (default: literal, case-insensitive) |
| `--min-score` / `--max-score` | 0.8 / 1 | score floor / ceiling (mirrors the JSON `score` field) |
| `--wait=<dur>` | 1s | wait for the target — `5s`, `800ms`; a bare number means seconds |
| `--limit=<n>` | 1 | at most n matches |
| `--flash=<dur>` | 1s | on-screen match flash; `0s` disables the pause |
| `--click` `--double-click` `--right-click` `--hover` | off | actions, composable — `--hover --click` is hover-then-click |
| `--box[=<none\|line\|word>]` | off | include the matched box |
| `--psm=<n>` / `--oem=<n>` | 7 / 3 | Tesseract knobs |

Presence defines the mode, so there is nothing to remember: `--match-image` alone,
`--match-text` alone, or both (a picture gated on its region's text).

```bash
autobdd find-target --match-text="SUBMIT" --click                   # find text, click it
autobdd find-target --match-image=card.png --match-text=Total       # gate a picture on its text
autobdd find-target --match-image=tile.png --limit=2 --wait=5s      # several matches, wait
autobdd find-target --match-image=logo.png --hover --click          # hover, then click
```

### Compatibility

`findTargetImage` — the v1 name — still works and is behaviourally identical: a
**deprecated alias** that prints one line to **stderr** and defers to the front door. Every
v1 argument (`--imagePath`, `--ocrPath`, `--textHint`, `--imageSimilarity`, `--maxSim`,
`--imageWaitTime`, `--imageAction`, `--ocrDetail`, …) is translated and warns on stderr only,
so a v1 consumer keeps working untouched. See `docs/CONTRACT.md` §2b.

The target is **required**: `autobdd find-target` with no target exits `2` and points at
`read-text`. (It used to default to a whole-screen scan, so a mistyped flag silently cost
~3 s and looked like a successful call.)

---

## What's inside

| Layer | Contents |
|---|---|
| **L0** | Ubuntu 24.04 · Java 17 · Node 24 · Xvfb, openbox, lxpanel/pcmanfm, x11vnc, sshd · ImageMagick, ffmpeg, xdotool, wmctrl, jq |
| **L1** | the **Oculix 4.0.0** screen engine (image matching + OCR), exposed as the `autobdd` front door |

* The engine lives at `/opt/autobdd/seam/src/`, out of `PATH`; only the front door and the
  deprecated alias are on it, so a derived image cannot shadow either. The verb-named entry
  points sit in `/usr/local/libexec/autobdd/`.
* The Oculix natives bundled in the engine JAR are extracted **at image-build time** into
  `/opt/oculix-natives` and registered with `ldconfig`, so the image is **self-contained**:
  no on-demand extraction at run time and no writable `/tmp` or `/root` required.
* `/etc/autobdd-versions` records what the image was built from — `version`, the OS, Java,
  Node, the Oculix jar, apt package versions and the build timestamp. `autobdd --version`
  reports it.

---

## Feature conformance — what it can do, and how to check each bit

The image's feature set is a **catalogue** in
`test-projects/autobdd-base-test/base-test/features.sh` — **44 features**, each independently
reproducible and each printing the exact command it ran. The suite *is* the usage
documentation you can execute.

```bash
# build the image first (the suite tests the local image, never pulls implicitly)
docker build -f .docker/autobdd-base.dockerfile -t xyteam/autobdd-base:4.0.0 .

cd test-projects/autobdd-base-test
AutoBDD_Ver=4.0.0 make docker-run jobs="base-test"     # whole matrix, ~3.5 min
AutoBDD_Ver=4.0.0 make one FEATURE=image-match         # one feature
AutoBDD_Ver=4.0.0 make one FEATURE=D                   # one group
AutoBDD_Ver=4.0.0 make docker-run jobs="base-test/one.sh --list"   # the catalogue
```

```text
════════════════════════════════════════════════════════════════════════════
 AutoBDD base image — feature conformance
   image   : xyteam/autobdd-base  (built 2026-09-22T21:01:45Z)
   display : :1  1920x1200x24
   surface : /usr/local/libexec/autobdd/find-target
   catalogue: 44 features — see base-test/features.sh
════════════════════════════════════════════════════════════════════════════

▸ image-similarity — accept a weak match at a low floor and reject it at a high one
   repro: base-test/one.sh image-similarity
   run:    /usr/local/libexec/autobdd/find-target \
             --match-image=/tmp/base-test.VGxClH/hello_blur.png --min-score=0.5 --flash=0s   [rc=0]
   ✓ a low floor accepts the blurred template = hello_blur.png
   run:    /usr/local/libexec/autobdd/find-target \
             --match-image=/tmp/base-test.VGxClH/hello_blur.png --min-score=0.99 --flash=0s   [rc=0]
   ✓ a high floor rejects it = notFound

▸ flash — hold the on-screen match flash for the requested time
   measured: default 2128 ms vs --flash=0s 1131 ms -> delta 997 ms
   ✓ the default flash pauses for at least 0.5 s = 997 (>= 500)
   ✓ the flash pause is bounded = 997 ms (<= 2500)

════════════════════════════════════════════════════════════════════════════
feature conformance: 135 passed, 0 failed
ALL FEATURES OK
════════════════════════════════════════════════════════════════════════════
```

### Reading a run

Each feature prints `▸ <id> — <one imperative sentence>` (the intent), then one line per
**invocation actually executed**:

| Line | Meaning |
|---|---|
| `run:` | the **exact argv** that ran, with its exit status. A check can never narrate a command it did not run, and a multi-invocation feature prints *every* invocation instead of one aspiration. |
| `probe:` | a host-side command, printed then run from the same string — every printed line is literally runnable. |
| `✓ <what> = <observed>` | the assertion **and the value observed**, so a green run is evidence, not a checklist. |
| `known-gap:` | a documented limitation that is deliberately *not* asserted (below). |
| `✗ <what> (got X, want Y)` | a failure with both values; failures are collected per feature at the end. |

Groups can be run alone by letter, which makes a red run easy to bisect. Set
`TARGET_BIN=findTargetImage` to run the same matrix through the deprecated alias and prove
it is still transparent; set `EXPECTED_VERSION=4.0.0` to make a version mismatch fail
(CI sets it from `package.json`).

| Group | Features | What it establishes |
|---|---|---|
| **A — runtime substrate** | `tools` `java17` `natives` `screen-only` `provenance` | the L0 essentials are present, Java is the pinned 17 series, the Oculix natives are baked and loader-visible, the image really is browser-free, and the build inputs are recorded |
| **B — display + desktop** | `display` `wm` `vnc` `pointer` | Xvfb serves `DISPLAY` at the requested geometry, openbox runs, x11vnc exposes `:5900`, the OS pointer can be driven |
| **C — whole-screen OCR** | `screen-mode` | `autobdd read-text` returns the whole screen's text with `score: null` |
| **D — image matching** | `image-match` `image-similarity` `maxsim-ceiling` `text-hint` `image-wait` `image-maxcount` `image-missing` `flash` | every contract field; the `--min-score` floor and `--max-score` ceiling; `--match-text` gating; `--wait` for a late target; several matches via `--limit`; `notFound` as a status object; the `--flash` pause |
| **E — actions** | `action-click` `action-doubleclick` `action-rightclick` `action-hoverclick` `action-hover` `action-none` | each action is **verified against the OS pointer** (`xdotool`), so a reported click point must equal where the pointer actually went |
| **F — text search** | `ocr-detect` `ocr-detail-none` `ocr-detail-line` `ocr-similarity` `ocr-wait` `ocr-action` `ocr-psm-oem` | search by `--match-text`, the optional `ocrDetails` box, wait, action dispatch, `--psm`/`--oem` |
| **G — contract robustness** | `json-on-error` `additive-args` | an unusable display still yields JSON on stdout with exit 0; unknown arguments are ignored |
| **H — non-functional** | `latency` | NFR-T2: a warm image match stays inside its budget |
| **I — discovery** | `help` `version` `list` `usage-error` | the tool explains itself *without* starting the engine, reports what is running, and fails loudly on an unusable value |
| **J — front door + compatibility** | `front-door-help` `front-door-read-text` `front-door-find-target` `front-door-unknown-verb` `alias-transparent` `legacy-flags` | the `autobdd <verb>` layer; `read-text` is its own verb; `find-target` without a target is a usage error; the deprecated alias stays transparent; the v1 arguments still work |

### Known gaps — stated, not hidden

* **`--min-score` is not applied to text targets.** Measured: with the text on screen,
  `--min-score=0.99` still matches, because this build's OCR path exposes no per-match
  confidence to filter on. The *image* floor **is** applied (`image-similarity` asserts both
  directions). The report prints a `known-gap:` line rather than asserting a rejection that
  would pass only when the screen happens to be blank — a false green.
* **`--box` reports the matched region**, not one entry per token (a tight box when the
  engine exposes one, otherwise the searched region's rectangle).
* **`SCREENSHOT`** appears in `docs/CONTRACT.md` §4 but is **not implemented by this image**
  (it is an L2/framework concern — the framework's hooks capture the flash frame). It is
  absent from the catalogue rather than asserted falsely.
* A `rc=139` (SIGSEGV during native teardown, *after* a correct result was written) has been
  observed **twice**, both times on an abnormally loaded host, and is not reproducible in 44
  targeted runs since. If you branch on exit status, treat a `139` with a valid payload as
  this known flake.

---

## Repository layout

```
.docker/autobdd-base.dockerfile   the image this README is about
seam/                             the engine + the autobdd front door (in-tree)
docs/CONTRACT.md                  the public interface (canonical + deprecated arguments)
test-projects/autobdd-base-test/  the 44-feature conformance suite
.docker/autobdd-framework.dockerfile, test-projects/autobdd-framework-test/
                                  the framework line (browser + runner + BDD), built from
                                  this tree on the 4.0.0 base; its frozen published
                                  release is 3.0.0 — see README-3.0.0.md
README-3.0.0.md                   the frozen 3.0.0 framework release
```

## Credits

* Screen image matching / OCR: **[oculix-org/Oculix](https://github.com/oculix-org/Oculix)** —
  the engine this image uses to see the screen. OculiX carries the SikuliX lineage
  ([RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)) forward in its own project.
* Keyboard/mouse: **[octalmage/robotjs](https://github.com/octalmage/robotjs)**.

---

*This README covers `xyteam/autobdd-base:4.0.0` only. The frozen 3.0.0 framework release —
Chrome, WebdriverIO, Cucumber and the HTML reports — is in
[README-3.0.0.md](README-3.0.0.md).*
