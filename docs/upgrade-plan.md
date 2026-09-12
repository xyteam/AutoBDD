# AutoBDD — Upgrade Plan (post-consolidation)

## Status (current)

The modern-stack re-baseline described by this plan (scripted below as "v4.0.0") has
**shipped as v3.0.0**. Current state:

* **`master` = v3.0.0** — Ubuntu 22.04 · Node 20 · Java 17 · WebdriverIO 9 · Oculix 4.0.0
  (screen image matching + OCR). Tag `v3.0.0`, GitHub Release, and image
  `xyteam/autobdd:3.0.0` published.
* **`v2.4.0`** — the corrected **base**: the re-activated v2.3.0 line (Node 14 ·
  WebdriverIO 7) made runnable against current Chrome. Tag `v2.4.0`, Release, and image
  `xyteam/autobdd:2.4.0` published. v3.0.0 is the continuation of this base.
* **OculiX cutover (Phase 6): done** — see issue #152. Two checklist items are deferred
  as tracked follow-ups: **#160** (`OCR.globalOptions()` set once at bridge start) and
  **#161** (migrate keyboard/mouse from `robotjs` to Oculix `Mouse`/`Key`).
* **Future:** adopt **Octachorix** (Oculix's next OCR binding — ×2 throughput, absolute-path
  library loading) in the Oculix release after 4.0.0.
* **Tag convention:** releases use a `v`-prefix (`v2.4.0`, `v3.0.0`). Legacy tags
  (`1.0.x`, `2.1.0`) predate the convention; no `v2.3.0` tag exists (its commit is not
  reliably identifiable), so the released v2.3.0 runtime is documented, not tagged.
* **Image reproducibility:** the image installs the **latest stable Chrome** at build
  time (it floats). The build records the resolved version under
  `/etc/autobdd-chrome-version` in the image (see `.docker/autobdd-nodejs.dockerfile`).

> **Baseline:** AutoBDD is now a **single self-contained monorepo** on `master`
> (the modern-stack baseline; originally `98e3bee`). Phase-1 of the earlier effort folded `xySikulixApi` into
> `third_party/xysikulixapi` and the `autobdd-framework-test` suite into
> `test-projects/autobdd-framework-test`. Verified green (per `98e3bee`) against the baked
> `xyteam/autobdd:3.0.0` image: **all 15 e2e scenarios** (1 @Init + 14 across
> test_images/ocr/vars/envs/project_steps) plus the jest/cypress/pytest/k6 suites.
>
> **Why this doc replaces the old `upgrade-plan.md`:** the previous plan assumed a
> four-repo topology and its Phase 0/1 are shipped. This is the forward plan written
> for the consolidated monorepo, with the earlier spike findings folded in (Appendix).
> It inventories every upgradable component and orders work so that **each phase ends
> with `autobdd-framework-test` green**, is cut as a PR, merged by the user, and the next phase
> only starts on the user's go-ahead.
>
> **Target release:** the modern stack (Ubuntu 22.04, Node 20 LTS, Java 17, modern
> Chrome, WebdriverIO v9 async, Oculix-based screen bridge) — **shipped as v3.0.0**
> (see Status above); this plan referred to it as "v4.0.0" while it was in flight.

---

## 1. How a phase is shipped (workflow contract)

1. Implement the phase's scope on a branch off `master`.
2. Run the **gate** (below); it must pass on the working tree.
3. Open a PR for that phase.
4. **User reviews and merges** the PR (authority to merge stays with the user).
5. On the user's explicit permission, start the next phase.

No phase is considered done until its gate is green. Phases that change the runtime
(image) re-baseline the gate on the **new** image and record that new image as the
baseline for all later phases.

## 2. The gate — "autobdd-framework-test passes"

**Definition:** the internal suite in `test-projects/autobdd-framework-test` runs green from the
**live working-tree AutoBDD** via the docker live-mount (`AUTOBDD_DEV_MOUNT=1`), i.e.
`make autobdd-framework-test` (from the repo root) or equivalently, inside the test project,
`make test-all` — and the cucumber HTML reports show **all 15 e2e scenarios green**,
with jest/cypress/pytest/k6 also passing.

### Mechanics (evidence-based)

- Nothing runs on the host: the suite always runs inside a container from
  `xyteam/autobdd:${AutoBDD_Ver}` (`AutoBDD_Ver=3.0.0` now). The committed
  `test-projects/autobdd-framework-test/docker-compose.yml` bind-mounts
  `${AUTOBDD_SRC:-../AutoBDD}` (this repo) at `/home/$USER/Projects/AutoBDD:rw` and
  sets `AUTOBDD_DEV_MOUNT=1`, so the **working tree's own code and `node_modules` are
  exercised**, not the image's baked copy. Startup scripts under `dev/`
  (`autobdd-run.startup.sh` / `autobdd-dev.startup.sh`) implement the mount-aware
  skip logic; `dev/bootstrap-dev.sh` provisions native bits into the working tree.
- e2e targets: `make e2e-test` = single-runner (@Init, 1 scenario) +
  parallel-runner (5 features, 14 scenarios) + auto-runner (re-runs the 5, minus
  @Init). All point baseUrl at `chrome://version` — no app server, Chrome-only,
  exercising browser + screen/image/OCR + VAR/ENV steps. Exit-code nuance: the
  single-runner pipes wdio through `tee` and auto-runner gates on `*.run` presence, so
  "green" = all three make phases exit 0 **and** the HTML reports show 15/15 green.
- Preconditions to run the gate locally:
  - docker + docker-compose reachable; image `xyteam/autobdd:3.0.0` present (it is,
    ~5.75 GB, on base `xyteam/autobdd-nodejs:2.3.0` = Node 12.22.7 + Chrome 96).
  - the working tree has `node_modules` (currently **absent** on a fresh clone — no
    `package-lock.json` is committed) and, while the runtime is Node 12/wdio 7,
    `dev/bootstrap-dev.sh` run after every `npm install` (it rebuilds `fibers` for the
    container's Node 12 and installs selenium-standalone drivers `chromedriver
    96.0.4664.45` + `geckodriver 0.26.0` into the working tree's `.selenium/`).
  - xvfb virtual display (scripts allocate display 100–599; no real display needed).
- **Phase 1 (project phase-1, DONE):** the reproducible green gate was established and
  verified at consolidation `98e3bee` (see §4 Phase 1); every later phase is measured
  against a known-good command, not tribal knowledge.

---

## 3. Complete inventory of upgradable components

Evidence for every row: dependency audit (usage of each `package.json` entry across the
repo), native-bridge audit of `third_party/xysikulixapi` + consumers, container audit of
`.docker/`, and the internal-suite audit of `test-projects/autobdd-framework-test`. Path/line
references are in the audit notes reproduced in §Appendix.

### 3.1 Runtime platform (Docker / image) — `.docker/`, root `Makefile`, compose

| # | Component | Current | Target | Notes |
|---|---|---|---|---|
| R1 | Ubuntu base | `ubuntu:20.04` (focal, EOL 2025-05) — `autobdd-ubuntu.dockerfile:1` | 22.04 LTS | Root of the EOL chain; 24.04 drops `rdesktop` so prefer 22.04 |
| R2 | Node.js | 12.22.7 (baked `autobdd-nodejs:2.3.0` base; file still targets `setup_14.x`) | 20 LTS | Only reachable via wdio9+async (see ordering) |
| R3 | Java | 11 (`default-jdk` on focal) | 17 | Oculix requires Java 17; 22.04 `default-jdk` is 17 |
| R4 | Chrome | 96 pinned (2.3.0-era base) + `chromedriver 96.0.4664.45` | current stable + driver-managed | Google purged ≤114 .debs; a from-scratch rebuild already yields Chrome 152 |
| R5 | Selenium | 3.141.59 standalone (service, pinned drivers) | 4.x + current drivers | via `@wdio/selenium-standalone-service` / driver manager |
| R6 | Python | 3.8 (focal default; `auto-runner.py` is py3) | 3.10+ (3.12) | `requirement.txt` = wheel/setuptools/tinydb |
| R7 | apt key mechanism | `apt-key add/adv` for nodesource/google-chrome/k6 — `autobdd-nodejs.dockerfile` | `gpg --dearmor` keyrings | deprecated `apt-key` |
| R8 | Compose | v1 (`version: '3.5'` + `--compress`) — `.docker/docker-compose.yml`, `.docker/Makefile` | compose v2 | drop obsolete keys/flags |
| R9 | python2 remnants | `enable_python2_support.sh` still shipped in overlay; startup noise | remove | repo purged python2.7 |
| R10 | Image tag / version var | `AUTOBDD_VERSION`+`AutoBDD_Ver` = `3.0.0` | new release tag (v4.0.0) | single coordinated bump |
| R11 | tini | v0.19.0 | keep/current | minor |
| R12 | overlay | `.docker/autobdd.root` baked config (supervisord, xvfb launchers, fonts, startup) | re-verify on new base | Copy, not mount |

### 3.2 WebdriverIO / Cucumber framework stack — `framework/configs|step_files|step_functions|libs|support`

| # | Component | Current | Target | Notes |
|---|---|---|---|---|
| W1 | WebdriverIO | 7.7.7 **sync** (`@wdio/sync` + `fibers`) | v9.30.x **async** | Dominant code effort; Node-12-only while sync |
| W2 | fibers | built in-container for Node 12 | **removed** | only for wdio sync; dead on Node ≥17 |
| W3 | Cucumber | v7 `@cucumber/cucumber` (wdio7-bundled), `cucumberOpts.tagExpression`, `this.Then` | v10+ (wdio9), `tags`, async hooks, imported bindings | configs `abdd_Linux_CH.js`/`FF`/`Win10_*` |
| W4 | Step defs style | synchronous `browser.*`/`$`/`expect` | `await` + `async` defs/hooks | files: `step_files/**`, `step_functions/**`, `libs/*_session.js`, `support/hooks.js` |
| W5 | Command/API renames | legacy names | v9 names | `waitForExist`→`waitForExists`, maximize/execute patterns |
| W6 | `@babel/core`/`@babel/register` | ^7.14 | latest 7.x | `requireModule:['@babel/register']` in configs |
| W7 | `expect-webdriverio` | ^3.1.0 (globals) | ^6 | ~25 step files use global `expect` |
| W8 | wdio configs | `abdd_Linux_CH.js`, `abdd_Linux_FF.js`, `abdd_Win10_{CH,EDGE,IE}.js`, `abdd_local.js`, `selenium-standalone_config.js` | prune to supported browsers; drop IE/local | see cleanup §3.6 |

### 3.3 Screen/OCR/keyboard-mouse native bridge — `third_party/xysikulixapi` + `framework/libs/screen_session.js`, `framework/scripts/getImageText.js`

| # | Component | Current | Target | Notes |
|---|---|---|---|---|
| B1 | Java bridge | `java` (joeferner/node-java) `^0.12.2` — `xysikulixapi/package.json:10`, node-gyp JNI (`binding.gyp`) | MarkusJx **`java-bridge`** v2.8.x (Rust/napi prebuilt) | **highest-risk blocker**: `java` fails node-gyp on Node ≥20; not `node-java-bridge` v1.0.22 (thin wrapper of old `java`) |
| B2 | Sikuli jar | `sikulixapi-2.0.4.jar` from launchpad (SikuliX) | **`oculixapi-4.0.0-complete-lux.jar`** (Maven Central `io.github.oculix-org:oculixapi:4.0.0`, fat jar bundles OpenCV+Tesseract+natives+tessdata) | `org.sikuli.script.*` namespace preserved → repoint imports; needs Java 17 (R3) |
| B3 | robotjs | `^0.6.0`, required directly in `screen_session.js:3` (keyTap/typeString/mouse/drag) | Oculix `Mouse`/`Key` statics | drop native dep; `xdotool` already in image; nut-js documented fallback |
| B4 | OCR | native tesseract via `getImageText.js` (ImageMagick capture) | Oculix `OCR.readText` (verified in spike) | decision 3.4 |
| B5 | Bridge API surface | `execSync('findTargetImage …')` JSON CLI (stable seam) | keep CLI; repoint vendored lib underneath | minimal consumer churn |

### 3.4 Root `package.json` pure-JS hygiene

| Class | Packages | Action |
|---|---|---|
| DEAD direct deps | `@hapi/hapi`, `cryptiles`, `hoek`, `deep-extend`, `json-diff`, `minimist-options`, `moment`, `url-parse`, `words-to-numbers`, `inquirer` (transitive pin for wdio7-cli) | remove (drop `inquirer`/`overrides` once @wdio/cli v9 used) |
| NODE-BUILTIN shims | `assert`, `child_process`, `path` | remove; code uses Node core |
| DEAD devDeps | `@rpii/wdio-html-reporter`, `@wdio/allure-reporter`, `@wdio/dot-reporter`, `@wdio/jasmine-framework`, `allure-commandline`, `chromedriver` (npm ^91), `wdio-chromedriver-service`, `devtools` (+`automationProtocol`) | remove |
| `@wdio/sync` | devDep 7.7.7 | remove when async conversion lands (W1) |
| USED, needs bump/risk | `glob` ^7→^9; `xlsx` ^0.17.0 (CVEs)→^0.18.5; `pdf-parse` ^1.1.1 (old); `newman` ^5.2.4→^6; `npm-check-updates` ^11→latest; `request` (deprecated; one odd import of internal `{debug}`); unbounded `>=` pins (`encodeurl`,`minimist`,`bottleneck`,…) | pin/bump each, keeping runtime compatibility at each stage |

### 3.5 Reporting / runner toolchain

| # | Component | Current | Target | Notes |
|---|---|---|---|---|
| X1 | `wdio-cucumberjs-json-reporter` | ^4.0.0 (`hooks.js`, configs) | ^6 | feeds all HTML reports |
| X2 | `multiple-cucumber-html-reporter` | ^1.18.0 | v3 / replacement | main HTML report path (`gen-report.js`, `generate-reports.js`) |
| X3 | `cucumber-html-reporter` / `cucumber-junit` | ^5.4.0 / ^1.7.1 | current/replacement | `generate-reports.js`, `auto-runner.py:616` |
| X4 | report scripts | `scripts/{gen-report,generate-reports,testrail-reports}.js`, `parse-{single,parallel}-runner-log.js`, `auto-runner.py` (tagExpression→tags) | re-verify + align | see cucumber/json version churn |
| X5 | TestRail | `testrail-api` ^1.3.6, `testrail_libs.js` | keep/current | used |

### 3.6 Orphaned / dead code to remove

| # | Item | Where | Notes |
|---|---|---|---|
| C1 | `old-findTargetImage.js` | `framework/scripts/` | orphaned 2021 duplicate of the bridge bin |
| C2 | `abdd_local.js` | `framework/configs/` | legacy Chimp config |
| C3 | IE support | `abdd_Win10_IE.js` + IE driver | IE EOL 2022 |
| C4 | legacy Edge | `abdd_Win10_EDGE.js` | 2015-era `MicrosoftWebDriver.exe` |
| C5 | `fs-ext` / `safexvfb.js` flock path | `libs/safexvfb.js`, dep `fs-ext` | only commented-out call sites; use util-linux `flock` / `proper-lockfile` if re-enabled |
| C6 | python2 remnants | `.docker/autobdd.root` | see R9 |
| C7 | unused bridge imports | `xysikulixapi/lib/xysikulixapi.js` | App/Button/Mouse/Settings/ImagePath unused by the CLI |

### 3.7 Internal test suite itself (`test-projects/autobdd-framework-test`)

e2e (wdio/cucumber, chrome://version) must ride the runtime migration; cypress/jest/
pytest/k6 are independent and stay as gates. Suite is exercised live via §2.

---

## 4. Phased implementation plan

Ordering is driven by hard coupling constraints (verified in §3/§Appendix):

- **(a)** `@wdio/sync`/`fibers` only run on Node ≤~16 → cannot bump Node while sync.
- **(b)** the vendored bridge uses `java` (node-gyp JNI) → `npm install` breaks on
  Node ≥20 → swap to `java-bridge` (MarkusJx, N-API prebuilt). **`java-bridge` requires
  Node ≥14** — its bundled JS uses optional chaining and will not even parse on the
  Node-12 3.0.0 image (verified against 2.1.0–2.8.1). So the swap can only be landed
  and verified on the Node-20 image → it is **folded into Phase 5**, not a standalone
  Node-12 phase (original Phase 4).
- **(c)** Oculix fat jar needs **Java 17** (R3) → oculix + robotjs→Oculix land only
  after the Docker phase ships Java 17.
- **(d)** wdio7 async (no `@wdio/sync`, no fibers) runs on Node 12 → the big
  sync→async conversion can be done and gated **on the current image** before the
  runtime bump.

Therefore the runtime rebuild (Docker + Node 20 + wdio9, now also absorbing the
`java`→`java-bridge` swap) is deliberately sequenced after the de-risking phases that
still run green on `xyteam/autobdd:3.0.0`.

### Phase 1 — Green baseline (**DONE** — consolidation `98e3bee`, project phase-1)

- **Status:** the reproducible green gate is already in place and checked in: the
  internal suite in `test-projects/autobdd-framework-test` was folded in and verified green
  (15/15 e2e + jest/cypress/pytest/k6) on `xyteam/autobdd:3.0.0`. §2 documents exactly
  how to run the gate from the working tree. No new work here — it is the reference
  every later phase must keep green (on the 3.0.0 image until Phase 5 re-baselines
  onto a new image).

### Phase 2 — Dependency hygiene on the current runtime (**DONE** — merged as #151)

- **Goal:** shrink to a minimal, current-runtime-safe dependency set **without**
  changing the wdio/Node major (still Node-12-compatible).
- **Scope:** remove DEAD + NODE-BUILTIN + DEAD devDeps (all of §3.4 table rows 1–4),
  delete orphaned code that carries no runtime path and is clearly safe
  (`old-findTargetImage.js`, C2 Chimp config). Fix unbounded `>=` pins to exact/caret
  where the module stays. No reporter/runner bumps yet.
- **Risk:** low. Any removal that turns out load-bearing surfaces immediately in the
  gate.
- **Gate:** `npm install` clean; autobdd-framework-test green on the 3.0.0 image.

### Phase 3 — sync→async conversion (still wdio7 / Node 12) (**DONE** — PR #154)

- **Goal:** remove `@wdio/sync` + `fibers`; convert the framework to async wdio so the
  runtime is no longer Node-12-locked. This is the de-risk that unlocks Node 20.
- **Scope:** every `browser.*`/`$()`/`$$()`/`expect()` gets `await`; every step def +
  hook becomes `async`; `this.Then` → imported `@cucumber/cucumber` bindings
  (`const {Then,Given,When} = require('@cucumber/cucumber')`); drop `@wdio/sync` and
  the fibers rebuild from `dev/bootstrap-dev.sh`. Files:
  `framework/step_functions/**`, `framework/step_files/**`,
  `framework/libs/{browser_session,fs_session,framework_libs,vcenter_session}.js`,
  `framework/support/{hooks,module_hooks}.js`.
- **Risk:** high-churn but mechanical; gated green on the same 3.0.0 image **without
  fibers**.
- **Gate:** autobdd-framework-test green on the 3.0.0 image with fibers removed from the tree.

### Phase 4 — Screen-bridge plumbing swap `java` → `java-bridge` (**FOLDED INTO PHASE 5**)

- **Status:** originally a standalone Node-12 phase; **not viable on the current
  image.** De-risking proved `java-bridge` (MarkusJx 2.1.0–2.8.1) does **not** run on
  Node 12 — its bundled JS uses optional chaining (`SyntaxError: Unexpected token '.'`),
  needing Node ≥14. On Node 12 the incumbent `java` (JNI) works fine, so nothing on the
  3.0.0 image is broken; the swap is only required and only verifiable once the runtime
  is Node 20.
- **Scope now lands in Phase 5** (with the Node-20 rebuild): swap
  `third_party/xysikulixapi/package.json` (`java ^0.12.2`, `node-gyp`, `binding.gyp` →
  `java-bridge`), `lib/xysikulixapi.js`, `bin/{findTargetImage,downloadSikulixApiJar}.js`:
  `java.classpath.push`→`classpath.append`, `java.import`→`importClass`,
  `java.options`→`ensureJvm({opts})`, `java.newFloat`→auto-converted number, call-style
  `Region(x)`→`new Region(x)`; keep `*Sync()` names and the `findTargetImage` CLI
  contract. Still loads `sikulixapi-2.0.4.jar` (Java 11-compatible) for Phase 5
  verification; the OculiX jar + Java-17-only surface stays in Phase 6.
- **Gate (in Phase 5):** root `npm install` on Node 20 runs no node-gyp JNI;
  `findTargetImage` works end-to-end in the Node-20 container; autobdd-framework-test green on
  the new image.

### Phase 5 — Runtime re-baseline: Docker foundation + Node 20 + WebdriverIO v9

- **Goal:** the one coupled rebuild that moves off the EOL stack: Ubuntu 22.04
  (R1/R7/R8/R9), Node 20 (R2), Java 17 (R3), modern Chrome + driver-managed Selenium 4
  (R4/R5), Python 3.10+ (R6), compose v2. In the same phase, bump wdio 7→9 and align
  cucumber/expect/reporters config keys, because the old runtime cannot host the new
  stack (and the new runtime cannot host wdio7-sync). Re-baseline the gate on a **new**
  image.
- **Scope (sub-steps, one PR):**
  - 5a `.docker/`: ubuntu 22.04; nodesource `setup_20.x`; google-chrome/k6 keys via
    `gpg --dearmor`; drop `apt-key`, python2 support; Java 17; compose v2; version →
    new tag.
  - 5b `package.json` devDeps: `@wdio/*` → ^9.30, drop `@wdio/sync`+`@wdio/jasmine`,
    add `@wdio/globals`; `expect-webdriverio` → ^6; `@babel/*` latest. Includes the
    folded Phase 4 bridge swap: `third_party/xysikulixapi` `java`→`java-bridge`.
  - 5c configs (`abdd_Linux_CH.js` etc.): `cucumberOpts.tagExpression` → `tags`;
    reporter + selenium blocks to wdio9 names; remove `devtools`/`automationProtocol`.
  - 5d command/API renames required by v9 (W5).
- **Risk:** largest phase; that is exactly why Phases 1–4 de-risked it. Splitting the
  wdio bump out of the Docker rebuild is not feasible (runtime lockstep), so the
  sub-steps land in one PR and the gate re-baselines on the new image.
- **Gate:** build new image; `npm install` clean on Node 20; **autobdd-framework-test green on
  the NEW image** (15/15 + aux suites). New image becomes the baseline.

### Phase 6 — Native screen bridge: Oculix cutover (on the new runtime)

- **Goal:** finish the SikuliX→Oculix + robotjs removal now that Java 17 is present.
- **Scope:** vendored bridge downloads `oculixapi-4.0.0-complete-lux.jar` (Maven
  Central) instead of `sikulixapi-2.0.4.jar` (B2); verify every `org.sikuli.script.*`
  import resolves; `screen_session.js` keyboard/mouse off robotjs → Oculix `Mouse`/`Key`
  (B3); OCR decision (`getImageText.js` → Oculix `OCR.readText`, B4); delete orphaned
  `old-findTargetImage.js` (C1) if not already removed; confirm `xdotool`.
- **Risk:** native; mitigated by spike (Appendix) and validated end-to-end on the new
  image (real display + xvfb).
- **Gate:** `findTargetImage`/OCR/image-find work end-to-end on the new image;
  autobdd-framework-test green on the NEW image (screen/image/OCR @IMAGE/@OCR scenarios).

### Phase 7 — Reporting pipeline to wdio9/cucumber-v10 JSON

- **Goal:** restore full searchable HTML report (screenshots + movie) on the new
  reporter/JSON stack.
- **Scope:** `wdio-cucumberjs-json-reporter` ^6 keys; `multiple-cucumber-html-reporter`
  v3 (or replacement) parsing cucumber v10/wdio9 JSON; re-verify
  `scripts/{gen-report,generate-reports,testrail-reports}.js`,
  `parse-{single,parallel}-runner-log.js`, `auto-runner.py` (tagExpression→tags
  translation, X4).
- **Risk:** medium; reporter JSON schema churn is the known unknown.
- **Gate:** a real run produces a valid HTML report with step screenshots + movie;
  autobdd-framework-test green on the new image.

### Phase 8 — Final dependency refresh, dead-platform cleanup, release

- **Goal:** reach "latest libraries" and cut v4.0.0.
- **Scope:** remaining pure-JS bumps held for the new runtime (`glob`→^9,
  `xlsx`→^0.18.5/`exceljs`, `pdf-parse`, `newman`→^6, `npm-check-updates`→latest,
  pin unbounded ranges) — re-run the gate after each bump group; platform cleanup C3/C4
  (drop IE, legacy Edge), C5 (fs-ext/proper-lockfile or remove dormant path), C6/C7;
  docs/README/tags; coordinated `AutoBDD_Ver`/`AUTOBDD_VERSION` → v4.0.0.
- **Risk:** low–medium per bump; gate after every group.
- **Gate:** autobdd-framework-test green on the new image; `make autobdd-build-all` + release
  checklist green.

> **Sizing note:** Phase 1 (baseline) is already done/checked in. Phases 2–4 keep the
> gate on the existing 3.0.0 image and are individually mergeable PRs. Phase 5 is the
> coupled runtime rebuild and its PR is the one that re-baselines the gate onto the new
> image; Phases 6–8 then ride that baseline.

## 5. Definition of done (v4.0.0)

- AutoBDD remains a single self-contained monorepo; `make autobdd-framework-test` green on the
  **new** image from the working tree.
- Modern image: Ubuntu 22.04, Node 20, Java 17, Python 3.10+, modern Chrome, Selenium 4.
- WebdriverIO v9 **async** (no `@wdio/sync`, no fibers); cucumber v10+ `tags`.
- Screen bridge on **Oculix fat jar via `java-bridge`**; robotjs removed.
- All libraries at latest compatible versions; dead code removed (IE, legacy Edge,
  Chimp config, orphaned `old-findTargetImage.js`, dead deps, python2 remnants).
- AutoBDD-example `@Demo` run (external demo) green on the new image tag.
- Release tag + image bumped to v4.0.0.

---

## Appendix — verified facts carried from the earlier spike (fold-in)

- **Oculix jar:** Maven Central `io.github.oculix-org:oculixapi:4.0.0` thin jar
  (9.4 MB) lacks bundled OpenCV natives → **must use the fat jar**
  `oculixapi-4.0.0-complete-lux.jar` (~137 MB, bundles OpenCV + Tesseract natives +
  tessdata). Oculix needs **Java 17**. Preserves the `org.sikuli.script.*` namespace,
  so xysikulixapi's import list repoints with minimal change.
- **`java` (node-java) is dead on Node ≥20** (node-gyp JNI). Replacement is the
  MarkusJx **`java-bridge`** package (Rust/napi-rs, prebuilt `java.linux-x64-gnu.node`).
  `node-java-bridge` v1.0.22 is a different package that merely wraps the old `java` —
  avoid.
- **OCR + template-find verified end-to-end** through `java-bridge` + Oculix fat jar:
  PIL text → `Image.create`+`OCR.readText` → `"Hello World AutoBDD …"`; `new
  Finder(image)`+`Pattern.similarSync`+`find` → DOWNLOAD button at (100,100) score
  0.9999.
- **robotjs still works on Node 22** (installed cleanly; `getScreenSize()` valid) but is
  unmaintained → decision: migrate keyboard/mouse to Oculix Mouse/Key; robotjs remains
  a documented fallback.
- **Ubuntu 22.04 package set:** all packages in `autobdd-ubuntu.dockerfile` (incl.
  `rdesktop`, `ttf-wqy-zenhei`, `libpng++-dev`, `aosd-cat`) are available in jammy.
- **`java-bridge` API mirrors the existing style:** `classpath.append(jar)` +
  `importClass('org.sikuli.script.Screen')` + `*Sync()/*Async()` ↔ the old
  `java.classpath.push` + `java.import` + `*Sync()`. The migration is a dependency
  swap, not a rewrite.
- The `findTargetImage` JSON CLI (`execSync` from `screen_session.js`) is the stable
  seam — keep the bin wrapper and repoint the vendored lib underneath it, so consumer
  churn is minimal.

*Superseded content (four-repo phase 0/1 of the pre-consolidation plan) is out of scope
for this document; see git history.*
