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
