# autobdd-base-test

No-browser, no-Chrome conformance suite for **`xyteam/autobdd-base`** (layers L0 + L1).

It proves the base image is usable **on its own** — as a screen-only automation substrate
and as the platform any framework (ours or a foreign one) builds on. There is no browser,
no WebdriverIO and no Cucumber here: the suite is shell scripts driving the base's public
interface, the **`autobdd` front door** documented in
[`docs/CONTRACT.md`](../../docs/CONTRACT.md).

## Image

The suite runs the **locally built** image — the compose file sets `pull_policy: never`, so
it never fetches from Docker Hub implicitly. Build it first, or pre-pull it:

```bash
# build (from the AutoBDD repo root)
docker build -f .docker/autobdd-base.dockerfile -t xyteam/autobdd-base:<v> .
# …or use a published one you have already pulled
docker pull xyteam/autobdd-base:<v>
```

> The engine, the `autobdd` front door and its verb shims are **baked into the image**, so
> after editing anything under `seam/` you must rebuild before the suite can see it. If the
> build reports `CACHED` for the `COPY seam/` layer (step `[12/19]`), force it with
> `--no-cache-filter 12`.

## Run

```bash
# the whole feature matrix — the default surface is the FRONT DOOR
AutoBDD_Ver=<v> make docker-run jobs="base-test"
# equivalently
AutoBDD_Ver=<v> docker compose run --rm autobdd-base-test make base-test

# one feature, or one whole group
AutoBDD_Ver=<v> make one FEATURE=image-match
AutoBDD_Ver=<v> make one FEATURE=D
AutoBDD_Ver=<v> make docker-run jobs="base-test/one.sh --list"     # the catalogue

# the same matrix through the DEPRECATED aliases (proves they are transparent)
AutoBDD_Ver=<v> docker compose run --rm \
  -e TARGET_BIN=findTargetImage autobdd-base-test make base-test
```

`make base-test` on its own runs the script **on your host**, which does not have the
image's tooling — the suite detects that and exits immediately with a pointer to the
commands above. Always go through `docker compose run` (or `make docker-run`).

### Environments

| Env | Default | Meaning |
|---|---|---|
| `AutoBDD_Ver` | `dev` (from `.env`) | the image tag: `xyteam/autobdd-base:<v>`. Must match what you built. |
| `TARGET_BIN` | `/usr/local/libexec/autobdd/find-target` | the entry point under test. Set to `findTargetImage` for the deprecated-alias surface. |
| `EXPECTED_VERSION` | unset | the release the image must report. Unset, the suite checks only that the image's reported version agrees with its own build stamp; set, a mismatch fails the run (CI sets it from `package.json`). |
| `RESOLUTION` | `1920x1200x24` | Xvfb geometry. |
| `NOSHOW` | unset | internal: timing features set it to keep the fixture re-show out of the measured window. |

Run **one suite at a time**. `flash` and `latency` are wall-clock measurements, so a second
concurrent suite inflates them (seen: latency 1130 ms → 1675 ms). Check for leftovers with
`docker ps` and clean up with `docker rm -f <name>`.

## What it checks

44 features in 10 groups, from `base-test/features.sh` — the catalogue is the single source
for the descriptions, the ordering and the per-feature repro command.

| Group | Features | Coverage |
|---|---|---|
| **A — runtime substrate** | `tools` `java17` `natives` `screen-only` `provenance` | L0 essentials, Java 17, Oculix natives baked **and** loader-visible, no browser/webdriver leaks, `/etc/autobdd-versions` |
| **B — display + desktop** | `display` `wm` `vnc` `pointer` | Xvfb geometry, openbox, x11vnc on `:5900`, the X pointer can be driven |
| **C — whole-screen OCR** | `screen-mode` | `read-text` returns the screen's text with `score: null` |
| **D — image matching** | `image-match` `image-similarity` `maxsim-ceiling` `text-hint` `image-wait` `image-maxcount` `image-missing` `flash` | every contract field; `--min-score`/`--max-score`; `--match-text` gating; `--wait`; `--limit`; `notFound`; the `--flash` pause measured against `--flash=0s` |
| **E — actions** | `action-click` `action-doubleclick` `action-rightclick` `action-hoverclick` `action-hover` `action-none` | each action **verified against `xdotool`'s view of the pointer**, so a reported click point must equal where the pointer actually went |
| **F — opt-in OCR** | `ocr-detect` `ocr-detail-none` `ocr-detail-line` `ocr-similarity` `ocr-wait` `ocr-action` `ocr-psm-oem` | `--box`, the OCR floor (accepted; see the known gap), `--wait`, action dispatch, `--psm`/`--oem` |
| **G — contract robustness** | `json-on-error` `additive-args` | an unusable display still yields JSON on stdout with exit 0; unknown arguments are ignored |
| **H — non-functional** | `latency` | NFR-T2: a warm image match stays inside budget |
| **I — discovery** | `help` `version` `list` `usage-error` | the tool explains itself **without starting the engine** (~40 ms, no screen scan) and fails loudly on an unusable value |
| **J — front door + alias** | `front-door-help` `front-door-read-text` `front-door-find-target` `front-door-unknown-verb` `alias-transparent` `legacy-flags` | the `autobdd <verb>` layer, that `find-target` without a target is a usage error, that the deprecated alias stays transparent, and that the **v1 argument names still work** |

### Reading a run

Every feature prints one imperative sentence, then — for each invocation actually executed —
the **exact argv** with its exit status, then the assertion with the **observed** value:

```
▸ image-similarity — accept a weak match at a low floor and reject it at a high one
   repro: base-test/one.sh image-similarity
   run:    /usr/local/libexec/autobdd/find-target --match-image=/tmp/…/hello_blur.png --min-score=0.5 --flash=0s   [rc=0]
   ✓ a low floor accepts the blurred template = hello_blur.png
   run:    /usr/local/libexec/autobdd/find-target --match-image=/tmp/…/hello_blur.png --min-score=0.99 --flash=0s   [rc=0]
   ✓ a high floor rejects it = notFound
```

`known-gap:` lines mark limitations that are deliberately **not** asserted (asserting them
would pass only when the screen happened to be blank — a false green). Exit status is `0`
when the run is green, non-zero otherwise; the verdict is the final line:

```
feature conformance: 130 passed, 0 failed
ALL FEATURES OK
```

## Shell and desktop inside the base image

```bash
# a shell
AutoBDD_Ver=<v> make docker-run-bash

# ssh + VNC desktop (the base's L0 layer) — extra `docker compose run` parameters
AutoBDD_Ver=<v> docker compose run --rm \
  --entrypoint /root/autobdd-dev.startup.sh \
  -p 2225:22 -p 5925:5900 \
  -e VNC_PASSWORD= -e RESOLUTION=1920x1200x24 \
  autobdd-base-test
# then:  ssh $USER@localhost -p 2225   (password "ubuntu")   ·   vncviewer localhost:5925
```

There is a **single run service** (`autobdd-base-test`); nothing is started or left running
in the background — every mode is `docker compose run` with different parameters.

## Layout

```
Makefile                       host + in-container targets
docker-compose.yml             one run service (autobdd-base-test)
dev/autobdd-run.startup.sh     run-container user bootstrap
base-test/run.sh               driver: runs the whole catalogue, prints the summary
base-test/one.sh               driver: runs ONE feature (or one group) — `one.sh --list`
base-test/features.sh          the catalogue: helpers, fixtures, and every feature
```
