
> **Current baseline (phase-0, v3.0.0):** The four repos are aligned on **3.0.0** —
> AutoBDD framework (`package.json` `3.0.0` + docker image `xyteam/autobdd:3.0.0`),
> AutoBDD-example, autobdd-test, and xySikulixApi — verified to work together on this
> version. The test repos' `.env` `AutoBDD_Ver=3.0.0` selects the matching image
> (previously the stale `2.3.0` tag). This v3.0.0 set is the base going forward; the
> upgrade plan below targets the later dependency-upgrade work.

---

## 0. Phase 0 Spike — results (2026-09-01)

Branches created in all four repos: `phase-0` in **AutoBDD, AutoBDD-example, autobdd-test,
xySikulixApi**. (Oculix is a third-party upstream repo — not branched; consumed as a built
jar / submodule reference.)

### Verified outcomes

1. **Oculix jar obtained & built.** Maven Central `io.github.oculix-org:oculixapi` thin
   jar (9.4 MB) lacks bundled native deps (OpenCV missing) — **must use the fat jar** built
   via `mvn -pl API -am -Pcomplete-lux-jar`: `API/target/oculixapi-4.0.0-complete-lux.jar`
   (137 MB), which bundles OpenCV + Tesseract (Legerix) natives + tessdata. Built with
   `maven:3.9-eclipse-temurin-17` in Docker. Oculix needs Java 17.

2. **`java` (node-java) is confirmed dead on Node 20+** — failed to build (node-gyp JNI).
   The MarkusJx **`java-bridge`** package (Rust/napi-rs, v2.8.1, prebuilt
   `java.linux-x64-gnu.node`) is the working replacement. Note: a *different* npm package
   `node-java-bridge` (v1.0.22) merely wraps the old `java` — avoid it.

3. **OCR verified end-to-end** through `java-bridge` + Oculix fat jar: PIL-generated image
   with text → `Image.create` + `OCR.readText` → returned `"Hello World AutoBDD …"`.

4. **Template find verified end-to-end:** `new Finder(imagePath)` + `Pattern.similarSync`
   + `find` → found the DOWNLOAD button at exactly (100,100), score 0.9999.

5. **Oculix input classes available** (`Mouse` static: `move/click/down/up/type/wheel`,
   `Key` constants) — keyboard/mouse can be routed through Oculix, **dropping robotjs**.
   `Mouse.moveSync` blocked on a bare Xvfb without a window manager (expected — needs the
   desktop session present in the container).

6. **robotjs actually still works on Node 22** — installed cleanly, `getScreenSize()`
   returns a valid size, `moveMouse` present. So robotjs is *not* a hard blocker, but it is
   still unmaintained. **Decision: migrate keyboard/mouse to Oculix** (single JVM, removes
   the native dep) rather than keep robotjs; robotjs remains a documented fallback.

7. **Ubuntu 22.04 package set:** all 59 packages in `autobdd-ubuntu.dockerfile` (incl.
   `rdesktop`, `ttf-wqy-zenhei`, `libpng++-dev`, `aosd-cat`) are available in jammy.

8. **java-bridge API is compatible with the existing xysikulixapi code style:**
   `classpath.append(jar)` + `importClass('org.sikuli.script.Screen')` + `*Sync()` /
   `*Async()` methods mirror the `java.classpath.push` + `java.import` + `*Sync()` pattern.
   The xySikulixApi migration is a dependency swap, not a rewrite.

### Decisions locked in for later phases
- **Screen bridge = xysikulixapi repointed at the Oculix fat jar**, with `java` → `java-bridge`.
- **Keyboard/mouse = Oculix Mouse/Key** (drop robotjs).
- **Ubuntu 22.04** base (all packages present; avoids 24.04 rdesktop issue).
- **Oculix fat jar is built upstream** (Oculix repo) — AutoBDD consumes it, does not build it.

### Open items carried into Phase 1
- Wire Oculix fat-jar download/build into the AutoBDD image build (or xysikulixapi
  postinstall), and install `xdotool` in the container (needed by App window ops and
  Mouse input on the live desktop).

### Dev-mode mount added (after spike, per user request)
- 
  image's baked `/home/$USER/Projects/AutoBDD`, so autobdd-test exercises the **live
  working-tree AutoBDD** instead of the stale image copy. Nested `${PWD}` test-project
  mount keeps precedence. Verified: `docs/upgrade-plan.md` (phase-0-only) is visible
  inside the container at the framework path — proof the mount is active.
- 
  (`myDISPLAYSIZE` undefined at `abdd_Linux_CH.js:100`), confirming the "worked 6 years
  ago" claim is false as shipped. This is the baseline Phases 1–6 must fix.
- 
   them, without rebuilding the image each iteration.

## 0b. Option A dev-loop — working state (2026-09-01)

After the dev-mount, autobdd-test now runs the **live working-tree framework end-to-end
and ALL 5 e2e specs PASS** (test_envs, test_images, test_vars, test_project_steps,
test_ocr — Chrome 96 sessions, real scenarios, screenshots+OCR). This is the first
proof that autobdd-test works against AutoBDD since the 6-year gap.

### What it took (all committed to `phase-0` in AutoBDD + autobdd-test)

**AutoBDD `package.json`** — Node-12-safe pins (the image runs Node 12.22.7, and the
original `>=`/`^` ranges had drifted to modern packages with Node-14+ syntax that
crashed the wdio worker with `SyntaxError`):
- `glob` `>=7.1.7` → `^7.2.3` (had resolved to 13.0.6)
- `pdf-parse` `>=1.1.1` → `^1.1.1` (had resolved to 2.4.5)
- `@wdio/*` `^7.7.7` → `7.7.7` (latest 7.x = 7.40.0 needs Node 14+)
- added `inquirer: 8.2.6` (dedupes the Node-18 `@inquirer/external-editor` that
  `@wdio/cli`'s `inquirer ^8` pulled) + `overrides` for npm 8+ users
- **`fibers` must be built** in the container (`cd node_modules/fibers && node-gyp
  rebuild`) — no prebuilt binary for Node 12; without it the worker dies silently on
  `@wdio/sync` (this is why wdio 7 sync is being dropped in the wdio 9 upgrade)

**AutoBDD `framework/configs/abdd_Linux_CH.js`** — Chrome 96 launch fix:
- removed the hand-written `Default/Preferences` JSON file (crashed Chrome 96's
  chromedriver with `cannot parse internal JSON template` → `DevToolsActivePort file
  doesn't exist`). Replaced with the `goog:chromeOptions.prefs` capability (already
  commented-out in the file) so Chrome generates its own valid Preferences.

**autobdd-test**:
- `e2e-test/support/steps/when.js`: legacy `require('cucumber')` → `@cucumber/cucumber`
  (wdio 7 bundles cucumber 7)
- `docker-compose.yml`: bind-mount patched `dev/*.startup.sh` over the image's baked
  scripts; they skip the node_modules refresh when `AUTOBDD_DEV_MOUNT=1` (else the image's
  wdio-6 node_modules clobbers the mounted wdio-7 set)
- `Makefile`: `export USER/HOSTOS/USERID/GROUPID/PASSWORD` (compose can't shell-expand
  these in `.env`); `.env` slimmed to static vars only
- selenium-standalone drivers installed under the mounted tree:
  `node_modules/selenium-standalone/.selenium/{chromedriver/96.0.4664.45-x64,
  geckodriver/0.26.0-x64, selenium-server/3.141.59}` + `chromeDriverVersion=96.0.4664.45`

### Known dev-loop gotchas (to fix properly in Phases 1–6)
1. **`npm install` wipes the selenium drivers** (they live in `.selenium/` under
   node_modules). After any reinstall you must re-run
   `selenium-standalone install` (chrome + firefox) and rebuild fibers. A dev bootstrap
   script should automate this.
2. The `python2` 404 errors during startup are from `.abdd_startup.sh` →
   `/root/enable_python2_support.sh` (repo purged python2.7). Non-fatal noise; remove in
   Phase 1 (python2 already slated for removal).
3. `skipSeleniumInstall: true` in the config means wdio won't self-install drivers — the
   manual install above is required. Selenium 4 upgrade (Phase 0.5/5) uses driver manager.
4. Node 12 + fibers is the fragile legacy foundation — this whole Option A path is a
   stopgap. The wdio 9 upgrade (Phase 4) removes fibers, `@wdio/sync`, and the Node-12
   syntax constraints entirely.

### Status: Option A done — dev loop proves autobdd-test ↔ AutoBDD working

**Goal:** Bring AutoBDD, autobdd-test, and AutoBDD-example back to a working state on a
modern stack; upgrade every library and internal component (WebdriverIO, Docker/Ubuntu,
Node.js, SikuliX→Oculix, Python, Selenium, reporting). The "worked 6 years ago with its
example + test projects" claim is unverified and must be re-established end-to-end.

**Author:** xyteam-assistant · **Date:** 2026-09-01

---

## 1. Verified current state (research findings)

### Architecture at a glance

```
AutoBDD (npm package, v3.0.0)                    ← main framework
├── framework/libs/screen_session.js             ← screen/image/keyboard-mouse
│     └── execSync('findTargetImage …')          ← CLI bridge → xysikulixapi
├── framework/scripts/old-findTargetImage.js     ← orphaned (renamed "old-" 2021)
├── framework/scripts/getImageText.js            ← tesseract OCR (native)
├── framework/configs/abdd_*.js                  ← wdio 7 sync configs (selenium grid)
├── framework/support/{hooks,env,abdd}.js        ← wdio 7 hooks, cucumber ≤6 style
├── framework/step_files/**                      ← ~34 step files (sync browser.*)
└── .docker/*.dockerfile                         ← ubuntu:20.04 → node 14 → autobdd
autobdd-test / AutoBDD-example                   ← separate repos, pull xyteam/autobdd image
```

### Key findings (evidence-based)

1. **`findTargetImage` binary comes from the `xysikulixapi` npm package**, not from
   AutoBDD itself. `screen_session.js` calls `execSync('findTargetImage …')`; the local
   `old-findTargetImage.js` was renamed `old-` in commit 628cd78 (2021-07) and is orphaned
   — a candidate for deletion, replaced by the npm CLI.

2. **The SikuliX bridge is `xysikulixapi` (npm `^0.0.11`, source now at
   `../xySikulixApi`, local v0.0.12).** It:
   - downloads `sikulixapi-2.0.4.jar` (from launchpad.net) at postinstall;
   - loads it into a JVM via the **`java` npm package (joeferner/node-java)**;
   - imports `org.sikuli.script.{App,Button,ImagePath,Mouse,OCR,Pattern,Region,Settings,Screen}`;
   - provides the `findTargetImage` CLI that does find/OCR/click/type on a screen region.
   - **`java` (node-java) is unmaintained and fails to build on Node ≥20**
     (JNI, node-gyp; issue #588 "Not able to install node java in node 20"). This is the
     **single highest-risk blocker** for the whole upgrade.

3. **Oculix (../Oculix, v4.0.0) is the SikuliX1 successor.** It is Maven
   `io.github.oculix-org:oculixapi:4.0.0`, **preserves the `org.sikuli.script.*` package
   namespace** (Screen, Region, Pattern, Match, OCR, App, Button, Mouse…). Native OpenCV +
   Tesseract bundled. Because the namespace is unchanged, `xysikulixapi`'s import list can
   be **repointed at Oculix's jar** with minimal code change — this is the natural
   SikuliX→Oculix cutover. Oculix needs Java 11+ (no newer JVM constraints).

4. **robotjs** (`screen_session.js`, keyboard/mouse) is unmaintained; known build risk on
   Node ≥18. AutoBDD calls it only for keyboard/mouse primitives. Candidate replacement:
   `@nut-tree/nut-js`, or route input through the same Oculix JVM (Oculix has Mouse/Keyboard
   classes).

5. **wdio is v7.7.7 (sync mode)**; `@wdio/sync` removed in v8; wdio is now at **9.30.x**.
   Sync→async is the dominant migration (every `browser.*`, `$`, `expect`, step def, hook).

6. **Docker stack is EOL:** ubuntu:20.04 (EOL 2025-05), Node 14 (EOL), Python 3.8,
   Selenium 3.141.59, deprecated `apt-key`. Google Chrome apt repo uses deprecated `apt-key
   add/adv`. Current host has Docker 29.5.3 + Compose v5.3.1, Node v22.22.2 (host).

7. **`findTargetImage` CLI is not found by name** anywhere as a file — it resolves only
   through node_modules/.bin (via `.autoPathrc.sh` PATH). The old AutoBDD script was
   orphaned. This is one concrete broken link to fix.

8. **`abdd.js` / `abdd_*.js` configs use `cucumberOpts.tagExpression`** (cucumber ≤6).
   wdio v9 bundles cucumber v10+ (`tags`, changed hook signatures, `this.Then` removed).

9. **autobdd-test and AutoBDD-example** are separate repos consuming the
   `xyteam/autobdd:${AutoBDD_Ver}` image (both pin `AutoBDD_Ver=2.3.0`; AutoBDD is v3.0.0 —
   already a mismatch). They contain legacy `this.Then(...)` step files.

---

## 2. Target stack

| Component | Current | Target | Notes |
|---|---|---|---|
| WebdriverIO | 7.7.7 (sync) | 9.30.x (async) | dominant migration effort |
| Node.js (Docker) | 14 (EOL) | 20 LTS (or 22 LTS) | wdio v9 needs ≥18.20/≥20.9 |
| Ubuntu base | 20.04 (EOL) | 22.04 LTS | rdesktop dropped in 24.04; prefer 22.04 unless 24.04 verified |
| Python | 3.8 | 3.10+ (3.12) | auto-runner.py already py3-clean |
| Selenium | 3.141.59 | 4.x + current drivers | selenium-standalone service |
| SikuliX bridge | xysikulixapi → sikulixapi-2.0.4.jar (via node-java) | xysikulixapi → **oculixapi-4.0.0.jar** (via node-java-bridge) | namespace preserved |
| Java bridge | `java` (node-java, broken) | `node-java-bridge` (Rust/napi, prebuilt) | resolves the top blocker |
| Keyboard/mouse | robotjs (unmaintained) | Oculix Mouse/Keyboard via JVM, or @nut-tree | spike needed |
| Chrome | 91 (pinned chromedriver) | current Chrome + chromedriver | Selenium 4 manager handles |
| Cucumber | v6 (tagExpression, this.Then) | v10+ (tags, async hooks) | bundled with wdio v9 |
| Docker compose | `version:` key + `--compress` | compose v2 (drop obsolete flags) | |

---

## 3. Phased implementation plan

Each phase is independently verifiable; each ends with a gate.

> **Renumbering note (2026-09-05):** Phase 1 below is a new *repo-consolidation* phase
> added ahead of the previously-numbered stack-upgrade phases. Historical references in
> sections 0–2 ("Phase 1–6") used the pre-consolidation numbering; the authoritative phase
> numbers are now those in this section (consolidation = Phase 1, Docker = 2,
> screen-bridge = 3, hygiene = 4, wdio = 5, reporting = 6, example cutover = 7, cleanup = 8).

### Phase 0 — Spike (highest risk, do first)

Build the Docker image with the new stack and verify the two riskiest native pieces:

- **0.1** Node 20/22 + `node-java-bridge` + Oculix jar: verify `org.sikuli.script.Screen`
  importable from Node and a sample `find`/OCR works inside the container.
  - Outcome: either (a) node-java-bridge works with Oculix jar → adopt; or (b) need
    alternate bridge (spawn JVM + JSON-RPC, e.g. the `operix-js`/`oculix` java-caller
    approach documented in Oculix/Additional-Wrappers). Decide here, not later.
- **0.2** robotjs on Node 20: try node-gyp rebuild; if it fails, migrate keyboard/mouse to
  Oculix Mouse/Keyboard (preferred — removes a native dep) and drop robotjs.
- **0.3** Ubuntu 22.04 package check: `aosd-cat`, `libpng++-dev`, `libopencv-dev`,
  `ttf-wqy-zenhei`, `rdesktop`/`freerdp`, tesseract-ocr.

**Gate 0:** a minimal container boots, `npm install` succeeds, a bare Chrome session
launches, and an Oculix `find` on a sample image returns a match.

### Phase 1 — Repo consolidation: single AutoBDD monorepo (dominant topology change)

> **Status: DONE (2026-09-05).** autobdd-test folded into `test-projects/autobdd-test` as
> the internal test suite; xySikulixApi vendored into `third_party/xysikulixapi` and
> consumed via a `file:` dependency. Verified: `make e2e-test` passes against the baked
> `xyteam/autobdd:3.0.0` image (all runners, exit 0). AutoBDD is self-contained (no
> external `xysikulixapi`/`autobdd-test` deps).

Reduce the four aligned repos to **one** (AutoBDD) plus one external demo
(AutoBDD-example).

**1.1 — Fold `xySikulixApi` into AutoBDD as an internal library**
- Move the `xySikulixApi` source (the java-bridge/Oculix screen bridge:
  `bin/{findTargetImage,downloadSikulixApiJar}.js`, `lib/xysikulixapi.js`,
  `lib/oculixapi-4.0.0-complete-lux.jar`) into AutoBDD — e.g. `framework/third_party/
  sikulix/` or a top-level `sikulix/` module — so AutoBDD is self-contained for the screen
  bridge (no external `xysikulixapi` npm dep, no separate repo, no per-repo publish).
- Convert it to an internal module: `framework/libs/screen_session.js` consumes it
  directly (`require`) instead of `execSync('findTargetImage')` through
  `node_modules/.bin`, or keep the CLI but resolve it from the internal path.
- Drop the `xysikulixapi` npm dependency and the orphaned
  `framework/scripts/old-findTargetImage.js`.

**1.2 — Fold `autobdd-test` into AutoBDD as the internal test suite**
- Move `autobdd-test`'s test content under AutoBDD (`test-projects/autobdd-test/` — the
  shell already exists — or `framework/tests/`), committed in-repo instead of
  `npx degit`-fetched at build time.
- The internal suite becomes AutoBDD's own regression gate (e2e-test
  single/parallel/auto runners, jest, cypress, pytest, k6) run against the working tree /
  baked image via `make autobdd-test`.
- Update `package.json` `download-test`/`test-init`/`test`/`clean` scripts and the docker
  build (no build-time `degit`; tests bake or mount with the framework).

**1.3 — Keep `AutoBDD-example` as the external demo suite**
- AutoBDD-example stays a separate repo consuming the `xyteam/autobdd:${AutoBDD_Ver}`
  image — the documented way third parties use AutoBDD.
- It is not part of the AutoBDD build/test cycle; only the demo/`@Demo` cutover in
  Phase 7 touches it.

**Gate 1:** AutoBDD is a single self-contained repo (no `xysikulixapi`/`autobdd-test`
external deps); `npm install` + the internal test suite run green against the working
tree; `make autobdd-test` exercises the folded-in suite.

### Phase 2 — Docker foundation

- **2.1** `autobdd-ubuntu.dockerfile`: ubuntu 22.04; replace `apt-key add/adv` with
  `gpg --dearmor`; drop python2 support file (`enable_python2_support.sh` removed);
  bump Python.
- **2.2** `autobdd-nodejs.dockerfile`: Node 20 LTS (nodesource `setup_20.x`); delete the
  obsolete "16.x breaks fiber" comment (fiber was only for wdio sync). Refresh google-
  chrome / k6 / terraform / hashicorp apt keys via gpg-dearmor.
- **2.3** `autobdd-image.dockerfile` + `autobdd.root/`: install requirements, `npm
  install`; wire the Oculix jar (now internal to AutoBDD per Phase 1) into the build; no
  build-time `degit` of autobdd-test (internal now).
- **2.4** `docker-compose.yml` (AutoBDD + AutoBDD-example): drop `version:` key; `.docker/
  Makefile`: drop `--compress`.
- **2.5** Bump `AUTOBDD_VERSION`/`AutoBDD_Ver` consistently to a new release version.

**Gate 2:** `make autobdd-build-all` succeeds; `autobdd-bash` opens a shell; the internal
python dry-run passes.

### Phase 3 — Screen bridge: SikuliX → Oculix (now internal to AutoBDD)

- **3.1** In the folded-in internal module (from Phase 1):
  - swap `java` → `node-java-bridge` (same `java.import`/`java.classpath` surface);
  - download Oculix `oculixapi-4.0.0.jar` instead of `sikulixapi-2.0.4.jar`
    (`downloadSikulixApiJar.js`: URL → Maven Central);
  - confirm all `org.sikuli.script.*` imports still resolve against Oculix.
- **3.2** `screen_session.js` and any direct consumers require the internal module; remove
  the `xysikulixapi` npm dep and orphaned `old-findTargetImage.js` if not already done in
  1.1. Keep `fuzzball` (used by screen/then.js).
- **3.3** Decide robotjs fate per 0.2; if migrating input to Oculix, update
  `screen_session.js` keyboard/mouse functions accordingly.
- **3.4** Verify `getImageText.js` (tesseract OCR) against the new image; keep or fold
  into Oculix OCR.

**Gate 3:** `findTargetImage` and screen image-finding work end-to-end against Oculix on
the new image (both real display and xvfb), driven by the internal module.

### Phase 4 — Dependency hygiene (isolate variables before the wdio bump)

- **4.1** Remove Node built-ins as deps: `child_process`, `path`, `assert`.
- **4.2** Remove/verify dead deps: `@hapi/hapi`, `hoek`, `cryptiles`, `moment` (or →dayjs),
  `java`+`xysikulixapi` (removed in Phase 1/3), `request` (→ global `fetch`), `url-parse`
  if only transitive, `newman` → ^6, `npm-check-updates` → latest,
  `allure-commandline` → latest.
- **4.3** `xlsx` ^0.17.0 (known CVEs) → ^0.18.5 or `exceljs` (used in `libs/fs_session.js`).
- **4.4** `fs-ext` (`safexvfb.js` flockSync) → pure-JS `proper-lockfile` (drop native dep).
- **4.5** Run the internal test suite on **wdio v7 still** to confirm hygiene didn't break
  pre-upgrade behavior.

**Gate 4:** `npm install` clean, existing (pre-upgrade) internal tests still pass on wdio v7.

### Phase 5 — WebdriverIO v7 → v9 (dominant effort)

- **5.1** Sync → async: `await` every `browser.*`, `$()`, `$$()`, `expect()`; make every
  step def + hook `async`. Files: `framework/step_functions/**`,
  `framework/step_files/{browser,screen,shell,vcenter,nodejs,postman,maven}/**`,
  `framework/libs/{browser_session,fs_session,framework_libs,vcenter_session}.js`,
  `framework/support/hooks.js`.
- **5.2** Command renames: `windowHandleMaximize`→`maximizeWindow`;
  `getWindowHandle().on('DOMContentLoaded')`→`browser.execute(readyState)`/`waitUntil`;
  `waitForExist`→`waitForExists` (v9).
- **5.3** Cucumber: `cucumberOpts.tagExpression`→`tags` in all configs; update hook
  signatures; rewrite legacy `this.Then`→`const {Then}=require('@cucumber/cucumber')`.
- **5.4** Dep bumps (root devDeps): `@wdio/*`→^9.30, remove `@wdio/sync`,
  `@wdio/jasmine-framework`, `@rpii/wdio-html-reporter`, `wdio-chromedriver-service`,
  `devtools`+`automationProtocol`; add `@wdio/globals`; bump `expect-webdriverio`→^6,
  `wdio-cucumberjs-json-reporter`→^6.
- **5.5** Configs: `abdd_Linux_CH.js`, `abdd_Linux_FF.js`, `abdd_Win10_*.js` — reporter
  blocks to cucumberjs-json v6 names; selenium-standalone service to Selenium 4; confirm
  `abdd_local.js` (legacy Chimp) dead → remove.

**Gate 5:** one feature runs end-to-end against a real browser via `abdd_Linux_CH.js`,
and the internal test suite (folded-in in Phase 1) passes on wdio v9.

### Phase 6 — Reporting pipeline

- **6.1** `wdio-cucumberjs-json-reporter` v6 config keys; `multiple-cucumber-html-reporter`
  v3 (or replacement) parsing cucumber v10/wdio v9 JSON.
- **6.2** Re-verify `scripts/{gen-report,generate-reports,testrail-reports}.js`,
  `parse-single-runner-log.js`, `auto-runner.py` (tagExpression→tags translation).
- **6.3** Python tooling: bump per Phase 2; smoke auto-runner dry-run + parallel run.

**Gate 6:** full HTML report with step screenshots + movie generated from a real run.

### Phase 7 — AutoBDD-example cutover (external demo only)

autobdd-test is now AutoBDD's internal suite (Phase 1), so this phase only migrates the
external demo repo.

- **7.1** AutoBDD-example: bump to wdio v9; rewrite legacy `this.Then` steps; update
  `Makefile`/`docker-compose.yml` to the new image tag + compose v2; verify the `@Demo`
  run end-to-end and confirm report output.
- **7.2** Coordinated release: bump AutoBDD (framework + internal suite) and
  AutoBDD-example; AutoBDD-example's `AutoBDD_Ver` points at the new image.

**Gate 7:** AutoBDD-example's `@Demo` smoke run passes on the new image.

### Phase 8 — Obsolete platform cleanup

- **8.1** Drop IE (`abdd_Win10_IE.js`, IE driver) — IE EOL 2022.
- **8.2** Edge via msedgedriver (replace 2015-era `MicrosoftWebDriver.exe`).
- **8.3** Remove `abdd_local.js` (legacy Chimp config) if confirmed dead.

---

## 4. Cross-cutting decisions & risks

| # | Decision / risk | Mitigation |
|---|---|---|
| D1 | **`java` (node-java) is broken on Node 20** — top blocker | Phase 0 spike: `node-java-bridge` (prebuilt Rust/napi, same API) first; fallback: spawn JVM + JSON-RPC (operix-js model) |
| D2 | **Oculix vs SikuliX jar** — Oculix keeps `org.sikuli.script.*` | Folded-in internal module (Phase 1) repointed at oculixapi-4.0.0.jar (Phase 3); verify each import resolves |
| D3 | **robotjs** unmaintained, won't build on Node 20 | Prefer Oculix Mouse/Keyboard (removes dep); else `@nut-tree/nut-js`; decided in 0.2 |
| D4 | **Ubuntu 22.04 vs 24.04** | Default 22.04 (rdesktop present); only go 24.04 if 22.04 package set fails |
| D5 | **wdio v9 sync→async is large** | Sequence: hygiene on v7 first (Phase 4), then one wdio bump (Phase 5) with a canary feature per browser |
| D6 | **wdio v9 JSON vs old reporters** | Spike reporter parsing in Phase 6; swap `multiple-cucumber-html-reporter` if it can't read v9 JSON |
| D7 | **Repo consolidation is broad** | Do it first (Phase 1) on the *current* wdio v7 stack so the topology change is decoupled from the wdio bump (Phase 5) |
| D8 | **"worked 6 years ago" unverified** | No assumption; every phase's gate re-proves behavior end-to-end from a clean container |

---

## 5. Definition of done

- AutoBDD is a **single self-contained repo**: `xySikulixApi` folded in as an internal
  screen-bridge library and `autobdd-test` folded in as the internal test suite
  (Phase 1). `AutoBDD-example` remains the external demo repo.
- `make autobdd-build-all` builds a modern image (Ubuntu 22.04, Node 20, Python 3.10+,
  Selenium 4, Oculix-based screen bridge).
- `make autobdd-test` runs the **internal** suite green on the working tree / baked image:
  e2e (browser + screen/image + shell + nodejs + maven + postman + vcenter), jest, cypress,
  py3, k6.
- AutoBDD-example `@Demo` run produces a valid searchable HTML report with screenshots and
  movie.
- All libraries and internal components upgraded to the latest compatible versions; dead
  code (IE, Chimp config, orphaned `old-findTargetImage.js`, obsolete deps, external
  `xysikulixapi`/`autobdd-test` deps) removed.
