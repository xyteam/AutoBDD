# Changelog

Release notes for AutoBDD. Images are published to Docker Hub as
`xyteam/autobdd:<version>` (plus base layers `xyteam/autobdd-nodejs:<version>`,
`xyteam/autobdd-ubuntu:<version>`). Test repos pull and run the image by version —
see [README.md](README.md).

Version tags use a `v`-prefix (`v2.4.0`, `v3.0.0`). The `1.0.x`/`2.1.0` tags predate
the convention.

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
