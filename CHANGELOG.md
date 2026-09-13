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
- **Next:** exact Chrome + chromedriver via Chrome for Testing, apt version recording
  (complete `/etc/autobdd-versions`), security (SBOM + scanning), the size gate, and
  startup targets.

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
