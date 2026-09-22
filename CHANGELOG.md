# Changelog

Release notes for AutoBDD. From the layered re-design the images are published as
**`xyteam/autobdd-base:<version>`** and **`xyteam/autobdd-framework:<version>`**
(**`xyteam/autobdd:<version>`** is a deprecated alias of the latter); earlier releases
shipped a single `xyteam/autobdd` tag with `-nodejs`/`-ubuntu` base layers. Test repos
pull and run the image by version — see [README.md](README.md).

Version tags use a `v`-prefix (`v2.4.0`, `v3.0.0`). The `1.0.x`/`2.1.0` tags predate
the convention.

## Unreleased — the layered re-design (in progress)

**Phase A — structure (done).** The single image is split into two published tags:

- **`xyteam/autobdd-base`** — L0 (Ubuntu 24.04 + essentials, X display + desktop:
  Xvfb/openbox/x11vnc) + L1 (Java 17, Node 20, the Oculix screen engine exposed as the
  `findTargetImage` CLI seam). **No browser.** Usable screen-only, or as a platform to
  build your own framework on.
- **`xyteam/autobdd-framework`** — base + L2 (Chrome + matching chromedriver,
  WebdriverIO 9, Cucumber, the AutoBDD step library). `xyteam/autobdd` is a deprecated
  alias (same image, two tags).
- The base's public seam is frozen in [`docs/CONTRACT.md`](docs/CONTRACT.md).
- Conformance suites split — `test-projects/autobdd-base-test` (no browser) and
  `test-projects/autobdd-framework-test`; each gates its tag. CI:
  `.github/workflows/conformance.yml` builds both tags from the commit and runs both suites.
- Test-project composes are run-only and set `pull_policy: never` (local image only);
  `AutoBDD_Ver` defaults to `dev`.
- One uniform screenshot watermark on every step/final capture — a dark bottom band with
  the remark (green passed / red failed).

**Conformance suite — the front door is the default surface.** The suite drives
`/usr/local/libexec/autobdd/find-target` by default and prints the surface it used in its
banner; `TARGET_BIN=findTargetImage` runs the same matrix through the deprecated alias and
so keeps proving the alias transparent. The run lines therefore name the interface this
repo is moving to. Two guidance fixes came out of the same review: the banner now prints
invocations that actually work (the previous `make base-test` runs the script on the *host*,
which has none of the image's tooling), and the suite now detects that case and exits 2 with
a one-line pointer instead of failing once per assertion with missing-binary noise.

**Base seam — argument vocabulary.** The v1 names described *how we look* (`image` vs `ocr`)
and disagreed with themselves: `--imageSimilarity`/`--ocrSimilarity` were one concept, and
`--imageWaitTime` was **seconds** while `--ocrWaitTime` was **milliseconds**. The v2 names
describe *what you want*: `--match-image` / `--match-text` are the two ways to name the
target, and everything else is stated once — `--min-score`, `--max-score`, `--wait`,
`--limit`, `--box`, `--psm`, `--oem`. Actions became composable flags, so `--hover --click`
replaces the `hoverClick` enum string; `--match-text` is **literal by default** with
`--match-regex` opting in, so a search phrase containing `:` or `(` cannot silently change
meaning (v1 `--textHint` was regex and keeps that behaviour through the legacy path).
Durations now carry their unit (`--wait 5s`, `--wait 800ms`), which removes the s/ms split.

Every v1 name is still accepted: it is translated in the engine and warns **on stderr only**
(stdout carries the payload), so existing consumers keep working unchanged. See
`docs/CONTRACT.md` §2b. Verified: the whole conformance matrix runs green on the new
vocabulary, and a `legacy-flags` feature asserts the v1 names still match and still click.

**Base seam — front door.** The interface is now verb-object: `autobdd find-target …`
locates a target (optionally acting on it) and `autobdd read-text` reads the screen, so
"read the screen" is no longer spelled as "find a target called Screen". The engine moved
out of `PATH` to `/opt/autobdd/seam/src/`; only the front door and the deprecated alias are
on it, so a derived image cannot shadow or collide with them. `findTargetImage` is kept as a
**deprecated alias** that prints its notice on **stderr only** — stdout is parsed as the
payload — and defers to the front door, so argument translation added later applies to it
without a second implementation.

The target is now **required**: `autobdd find-target` with no target exits 2 and points at
`read-text`. Previously the engine defaulted to `--imagePath=Screen`, so omitting the target
silently ran a whole-screen scan (~3 s) and looked like a successful call, and it made
`find-target` and `read-text` behaviourally identical. `docs/CONTRACT.md` §1 always said the
target was required; this enforces it.

Verified by running the whole conformance matrix through **both** surfaces — the alias and
`/usr/local/libexec/autobdd/find-target`: **124 passed, 0 failed (43 features)** each time.

**Base seam — discovery surface.** `--help`/`-h`, `--version` and `--list` are answered
*before* the JVM and native engine start: measuring the old behaviour, `--help` returned
exit 0 after a **3079 ms whole-screen OCR scan** and the binary carried **0** usage strings,
so the canonical "what does this do?" move silently did work and reported success. Usage is
now ~40 ms and prints the flows, the output shape, the exit codes and every flag with its
default. Unusable values (a non-numeric threshold, an unknown `--imageAction`/`--ocrDetail`)
now print the offending flag on stderr and exit **2**, rather than silently behaving like the
default and looking like a successful call. Unknown arguments still warn and are ignored, so
the additive-argument guarantee is unchanged.

**Base seam — behaviour fixes found by the feature suite.** The base suite was rebuilt as a
34‑feature catalogue (`test-projects/autobdd-base-test/base-test/features.sh`), each feature
independently reproducible via `base-test/one.sh <feature>`. Writing it surfaced five defects
in `findTargetImage`, all fixed here:

- **`--imageWaitTime` was ignored.** SikuliX's `autoWaitTimeout` applies to `wait()`/
  `exists()`, not to the `findAll()` the seam used, so a target that appeared late was
  missed despite the caller asking to wait. The search now retries until the deadline, as
  `docs/CONTRACT.md` §2 documents.
- **Clicking actions did not move the pointer.** `Region.click()`/`doubleClick()`/
  `rightClick()` do not reposition the pointer in this Oculix build, so an action was
  dispatched somewhere other than the reported `center` (measured: reported `900,1100`,
  pointer landed at `131,160`). Actions now move to the region centre first; the suite
  verifies **every** action against `xdotool`'s view of the pointer.
- **`--flash` never paused.** `java.lang.Thread.sleep()` through java-bridge is a no‑op
  (`sleep(1000)` measured 0 ms), so the on‑screen flash had no hold time. Waits now use a
  real Node‑side block (`Atomics.wait`), which also stops the OCR poll from spinning.
- **`--imageMaxCount` returned aliases.** One accumulator object was pushed per match, so N
  results were N references to the last match (identical centres). Results are now built
  fresh per match.
- **`clicked` was set for non‑clicking actions.** The image path recorded `clicked` even for
  `--imageAction=hover`; it is now set only when a click was actually dispatched, matching
  the OCR path and the field's documented meaning.

**Phase B — NFR hardening (in progress).**

- **Node 20 → Node 24 LTS.** Node 20 reached **EOL 2026-04-30**; the image now installs
  Node **24.21.0** — exact and checksum-verified from the official tarball (no floating
  apt repo). `robotjs` `^0.6.0 → ^0.9.1` (NAN → `node-addon-api`/`node-gyp-build`, N-API)
  and `node-gyp` `^10 → ^13` for the new ABI. `autobdd-base-test` 39/39 and
  `autobdd-framework-test` green on it (baked and dev-mount).
- **Suite gate green on the 24.04 base.** Two base-move breakages in
  `autobdd-framework-test` fixed: `pytest-test` hit PEP 668 (`EXTERNALLY-MANAGED`) and now
  installs with `pip3 install --break-system-packages --user`; `k6-test` called a tool the
  layered image no longer ships (L3 guest tools, §FR-15) and now provisions k6 itself
  (`v2.2.0`, SHA-256-verified) into `$HOME/.local/bin`, the way jest/pytest install their own
  tools. Full gate green in both modes (dev-mount and baked): **15/15 e2e scenarios**,
  cypress 3/3, jest 3/3, pytest 6 + 1 xfail, k6 thresholds met.
- **Pin-all: Chrome + chromedriver from Chrome for Testing (NFR-P2/P3/P4/P5).** Both
  artifacts are now the **exact** pinned build `153.0.8010.36`, SHA-256-verified at build
  time, from `chrome-for-testing-public` — instead of apt's floating `stable` channel. The
  zip carries no dependency metadata, so the runtime library set is installed explicitly
  (noble's `t64` names). Two CfT-vs-distribution differences had to be handled: CfT prints
  "Google Chrome **for Testing** <v>", which tools parsing `<product> <version>` misread
  (Cypress 6 aborts with ``Expected `majorVersion` to be a string or a positive number``), so
  `google-chrome` is now a shim that drops that qualifier; and CfT's "only for automated
  testing" infobar overlays the page, so the framework launches with `--disable-infobars`.
  The `chromeLogo`/`myGoogleLogo` fixtures were re-captured from the CfT page (the logo and
  wordmark are CfT-branded). `/etc/autobdd-versions` is complete: OS + digest, Java, Node,
  Python, the Oculix jar, the pinned apt GUI/tool stack, and the framework's Chrome and
  chromedriver lines.
- **Size gate, SBOM and CVE report in CI (NFR-S2/S4, NFR-SEC6).** The conformance workflow
  records each tag's compressed pull size and fails a PR over the NFR-S2 budgets
  (`autobdd-base` ≤ 2.5 GB, `autobdd-framework` ≤ 3.5 GB — **0.81 GB** and **1.24 GB** as
  measured by the gate in CI), and emits a per-tag **SPDX SBOM** (syft) and a
  **HIGH/CRITICAL CVE report** (trivy) attached to the build. The scan is advisory: a CVE
  delta is reviewed per release, so there is no severity gate until that baseline exists.
  Scanner images are pinned.
- **Targets measured.** `make autobdd-measure-startup` reports cold-start readiness (DISPLAY
  live + sshd) against NFR-T1's 10 s: **4.1 s** for `autobdd-base:dev`, **4.8 s** for
  `autobdd-framework:dev` (an earlier 9.9 s / 26 s reading was host contention, not the
  image). The base suite also asserts **NFR-T2** through the CLI seam: a warm image-match
  measures ~1.0 s (best of three, `--flash=0`) — at the target, dominated by per-call
  node+JVM startup (the X capture is ~0.16 s of it).
- **Framework robustness fixes surfaced by the cutover.** wdio names its log file after the
  capability id (`0-0` for every single-instance run), so parallel features sharing a report
  dir raced to unlink it (`Error in reporter CucumberJsJsonReporter: ENOENT`): the log dir is
  per process now. `scroll`/`clearInputField` wait (bounded) for the element before acting,
  instead of scrolling blind. And the framework forces **classic WebDriver**
  (`wdio:enforceWebDriverClassic`): under the run's parallel workers the negotiated BiDi
  channel stalled (`session.subscribe … timed out after 180000 ms`), which blocked the
  element commands behind it and timed out whole scenarios.
- **Next:** security gating on a reviewed CVE baseline, size/startup trend tracking, and the
  apt-snapshot pinning carved out to P2.

The v1 release cuts when Phase B is green and publishes the two tags.

## v4.0.0

**A re-scope, not a re-baseline: the base becomes the product.** `v3.0.0` is untouched —
tag, release and image stay exactly as shipped, as the last release of the framework line.
`v4.0.0` is cut from it and narrows the product to the **substrate**: a docker-runnable GUI
(Xvfb + openbox + x11vnc) with the Oculix screen engine behind one CLI, so that higher-level
tools — a framework, a script, an agent — drive it. No browser, no test runner, no BDD layer.

What that meant in practice, all in this release:

* **One interface.** `autobdd <verb>` replaced the bare `findTargetImage` binary:
  `autobdd find-target` locates a target (a picture, or text) and optionally acts on it;
  `autobdd read-text` reads the screen. The v1 name remains a deprecated alias.
* **A vocabulary that reads as an instruction.** `--match-image` / `--match-text` name the
  target; `--min-score`, `--max-score`, `--wait=5s`, `--limit`, `--box`, `--psm`, `--oem`
  state everything once for both modalities; actions are composable flags (`--hover --click`).
  Every v1 flag is translated, with a stderr-only warning.
* **Discoverability.** `--help`/`--list`/`--version` answer in ~40 ms **without starting the
  engine** (measuring the old behaviour: 3079 ms and a whole-screen scan, with zero usage
  strings in the binary); unusable values exit 2 instead of silently defaulting.
* **A self-contained image.** The Oculix natives bundled in the engine JAR are extracted at
  build time into `/opt/oculix-natives` and registered with `ldconfig`: no runtime
  extraction, no writable `/tmp` or `/root` needed.
* **A conformance suite that is also the spec.** 44 features / 131 checks, each independently
  reproducible (`base-test/one.sh <feature>`), each printing the exact command it ran and the
  value it observed. Writing it found and fixed six real defects in the engine, and five in
  the suite's own narration.
* **The image reports what it is.** `version=` is recorded in `/etc/autobdd-versions` and
  printed by `autobdd --version`, and CI resolves that value from `package.json` so the
  build arg, the image tags and the suite's expectation cannot drift: the base suite checks
  that `--version` agrees with the image's own stamp, and — when `EXPECTED_VERSION` is set —
  that both equal the declared release. Unset (a local run) it checks consistency only, so
  the same suite works for a `dev` build and for a release build.

The framework image (`xyteam/autobdd-framework`, and the `xyteam/autobdd` alias) remains on
the 3.0.0 line; it pins its base via `AUTOBDD_VERSION`, so re-baselining it onto 4.0.0 is a
later, separate change that must pass the framework e2e suite.

## v3.0.0

The runtime re-baseline — the continuation of v2.4.0.

**Runtime**
- Ubuntu 22.04 · Node 20 · Java 17 · Chrome + chromedriver on PATH.
- WebdriverIO **9** (cucumber); runs with `docker compose` (Compose v2).
- **Oculix 4.0.0** screen image matching + OCR (vendored `oculixapi-4.0.0-linux.jar`,
  java-bridge on Java 17); native libs baked to `/opt/oculix-natives` with
  `LD_LIBRARY_PATH`. System `tesseract`/`leptonica`/`opencv` removed from the image.
- Dynamic driver-version reporting (reads the real `chromedriver --version`).

**Image-match UX**
- Restored flash-on-match — a red border over clear content (no opaque fill), visible
  under Xvfb; ~1 s, tunable via `--flash`.
- Flash in the step screenshot — the capture during a `FindImageTarget` step becomes
  that step's screenshot, with the step-name watermark at the bottom, green for passed
  / red for failed steps.
- Baked (image) mode compose for `autobdd-test`.

**Validation** — e2e gate green (29/29) on the rebuilt image, dev-mount and baked modes.

**Notes** — the image installs the latest stable Chrome at build time (it floats); the
resolved version is recorded at `/etc/autobdd-chrome-version` in the image.

## v2.4.0

The corrected **base**: re-activates the AutoBDD **v2.3.0** line into a working,
reproducible state. (The previously-applied "v3.0.0" label on this baseline was
premature and has been retracted; v3.0.0 now refers to the runtime re-baseline above.)

**Runtime** — Node 14 · WebdriverIO 7 · Chrome (latest stable at build, e.g. 153).

**Browser driver fix** — the legacy `selenium-standalone` can no longer provision a
driver for modern Chrome (its source caps at ChromeDriver 114; its zip extractor drops
nested entries; it only skips on HTTP 304). The image now bakes the selenium-server jar
and a chromedriver **matching the installed Chrome** at the paths selenium-standalone
computes, and `chromeDriverVersion` is detected dynamically. `skipSeleniumInstall`
stays on; the server spawns chromedriver per session (parallel works).

**Validation** — AutoBDD-example against the image: 740 passing / 4 failing / 1 skipped
(was 0 ran).

## v2.3.0

The original pinned runtime: **Node 12.22.7 · Chrome 96 · WebdriverIO 7**. Documented
for reference; not tagged in this repository.

## Version matrix

| Release | Chrome | WebdriverIO | Node |
|---|---|---|---|
| v2.3.0 | 96 | 7 | 12 |
| v2.4.0 | modern (latest stable at build) | 7 | 14 |
| v3.0.0 | modern (latest stable at build) | 9 | 20 |
