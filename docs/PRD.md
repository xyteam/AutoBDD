# AutoBDD — Product Requirements Document
## Re-design: a layered automation platform (framework + image) and consuming test repos

**Version:** 0.1 (draft for discussion) · **Status:** in review · **Owner:** Product/Platform

> Living document. Review, discuss and improve point-by-point. Numbers in `FR-*`/`NFR-*`
> are anchors for the discussion, not final.

---

## 0. TL;DR

AutoBDD becomes a **layered, image-first automation platform**. The image ships four
tiers — **(L0) lean OS, (L1) OS actions, (L2) BDD framework, (L3) extra test tools** —
and test repos consume the image *as-is* or *bring their own L2/L3*.

> **Positioning:** *"If a human can see it and do it on the screen, AutoBDD can test it."*

---

## 1. Test philosophy — **image-action first, web/DOM-action assist**

This is the product's spine. It decides how tests are written and what "good" looks like.

**1.1 Image-action first (primary).**
Drive the application the way a user does — through the **screen**: locate, click,
hover, drag and assert on **rendered images and on-screen text** (image matching + OCR).

**1.2 Web/DOM-action assist (secondary).**
Use browser/DOM steps as **fast, precise shortcuts when they are available and stable**
— e.g. navigate to a URL, set an input value, read an attribute, wait for network idle.
They **assist**; they are not the contractual surface of a test.

**1.3 Why image-first**
- **Represents the user** — asserts what is actually shown, not an implementation detail.
- **Universal** — the same action model works for DOM, canvas/WebGL, PDF, iframes,
  native/desktop apps and remote VDI. DOM-actions cover only part of that.
- **Robust to refactors** — the DOM/ids/classes can churn without breaking the test.
- **One language** — a screen action and a DOM action are both plain Cucumber steps.

**1.4 Guardrails (so "image-first" doesn't become "image-only, flaky")**
- Use DOM-actions for **setup/navigation** and for **exact-value** operations where the
  screen is a poor oracle; use image-actions for **presence, appearance, position,
  interaction and visual assertions**.
- Image actions must be **stable**: deterministic capture, tuned similarity, explicit
  waits, and clear failure artifacts (the flash + step screenshot + movie).
- A test SHOULD be understandable by a non-coder from the steps alone.

**1.5 Consequence for the product**
The default demo/template actions are **screen-actions**; web-page actions are labelled
as *assist*. The image must make screen-actions first-class and cheap (see L1).

**1.6 The boundary — precision & confidence (the measured crossover).**
Strictness is not a policy constant; it is a function of **(a)** the target's
DOM-addressability, **(b)** the operation's precision need, and **(c)** the *measured*
confidence of the screen path. Screen image + keyboard/mouse actions **fade** when the
match is ambiguous (low similarity, small margin), rendering is non-deterministic
(fonts/animation/DPI/scroll), the target is tiny, the oracle needs exactness, or
synchronisation is cleaner on the DOM. DOM control becomes beneficial exactly there.

| DOM-addressable? | Operation needs | Recommended | Why |
|---|---|---|---|
| **No** (native / canvas / PDF / remote VDI) | anything | **screen (mandatory)** | DOM capability = 0 |
| Yes | representation (presence, appearance, position, visual state, interaction) | **screen (primary)** | represents the user; robust to refactor |
| Yes | exactness (value equality, structure, order, dynamic data) | **DOM assist** | screen can't guarantee exactness |
| Yes | setup / navigation / wait | **DOM assist** | fast, stable |
| Yes, tie | either works | **confidence score decides** | data-driven |

Metrics to capture per screen step: `score` (image similarity — already returned by the
finder), `margin` (best − 2nd-best), `verified` (post-action state check), `latency`;
plus **stability** derived by comparing confidence across runs.

**1.7 Decisions (agreed)**

- **D1 — Stability study at the end of each run.** After a run, compare each step's
  confidence against previous runs. When instability is observed, **expose the confidence
  score** and advise a **more precise means**: a higher-score image/fixture, or web-DOM.
- **D2 — Tie-break by confidence.** When either action model would work, our **confidence
  score decides**. Escalate to web-DOM only when the user **demands higher confidence**,
  and then guide them to observe web-DOM as the replacement.
- **D3 — Screen-only runtime mode is v1.** Enable a **no-browser** runtime (L1 OS-actions
  alone — no L2/Chrome/wdio) for pure desktop/native targets where DOM capability = 0.
- **D4 — Confidence is advisory-only in v1.** Exposed in the report (badge + numbers) and
  in the post-run stability study; **not** an assertable step (revisit in v2).

---

## 2. Vision & positioning (sales)

Today's browser tools (Playwright, Cypress, Selenium) are excellent — **inside the DOM**.
The moment a target isn't a DOM element (canvas/WebGL, PDF viewers, native/desktop apps,
remote VDI, third-party sites), they either can't or they get brittle.

AutoBDD's promise: **see anything, test anything** — image- and text-based actions *plus*
browser automation, in **one BDD (Cucumber) language**, running reproducibly **from a
single container**.

Three sales pillars:
1. **Universal reach** — one framework spans screen-image and web-page actions.
2. **Reproducible by construction** — the whole stack is a versioned image; a test repo
   needs *only a clone of itself*.
3. **Composable** — use the full image, or bring your own framework/tooling and keep our
   OS + screen engine.

---

## 3. Problem & opportunity

- **Problem:** automation stacks are glued-together and environment-fragile
  (Chrome/driver drift, OCR/native-lib hell), and they are DOM-bound.
- **Opportunity:** a **layered platform image** removes setup/drift; image+text actions
  open a category of "un-automatable" targets; a clean layer contract lets teams adopt
  incrementally.

---

## 4. Goals / non-goals

**Goals**
- G1 A single versioned image delivering **L0–L3**, runnable by any test
  repo with no framework clone.
- G2 A clean **layer contract** so a repo can replace L2 (BDD framework) and/or L3 (tools).
- G3 Demonstrate (via AutoBDD-example) both **screen-image** (first) and **web-page**
  (assist) action families.
- G4 Reproducible builds; green conformance suite; lean, fast-starting images.

**Non-goals (v1)**
- NG1 Windows/macOS images (Linux first; future).
- NG2 Own cloud grid/scheduler.
- NG3 Re-implementing the underlying engines (we integrate Oculix + WebdriverIO).

---

## 5. Personas

| Persona | Need | Success |
|---|---|---|
| **QA engineer** | write tests in plain language; trustworthy reports | runs suite from a clone; sees step screenshots + movies |
| **SDET / platform eng** | reproducible env; extend/replace layers | pins image version; swaps L2/L3 |
| **Engineering manager** | cover "hard" targets; low maintenance | fewer flaky envs; covers canvas/native |
| **Visual/UX reviewer** | pixel accuracy over time | image/text assertions with clear artifacts |

---

## 6. Product architecture — the layered model

```
        ┌───────────────────────────────────────────────┐
 L3     │ Guest tools (NOT shipped): API (postman) ·      │  user-provided
        │ Load (jmeter) · Unit (jest/pytest)             │
        ├───────────────────────────────────────────────┤
 L2     │ BDD framework: Chrome + chromedriver · Node ·  │  "the framework"
        │ WebdriverIO · Cucumber · Python · AutoBDD      │
        │ (step libraries, runners, reports)             │
        ├───────────────────────────────────────────────┤
 L1     │ OS actions (advanced): image match + OCR       │  the differentiator
        │ (Oculix) · keyboard/mouse · screen capture     │
        ├───────────────────────────────────────────────┤
 L0     │ Lean Linux OS + essentials: sshd · parallel ·  │  foundation
        │ curl/wget · git · jq · unzip · ffmpeg · tini   │
        │ X display + desktop: Xvfb · window manager ·   │  + GUI substrate
        │ [optional LXDE · x11vnc · themes · fonts]      │
        └───────────────────────────────────────────────┘
```

**Base OS + desktop decision (agreed).**
- **Base = Ubuntu** (glibc required by Chrome, OpenJDK/Oculix, and the X desktop).
  - **Going-forward: `ubuntu:24.04` LTS** (support to 2029 / ESM 2034; mainstream
    LTS; broad repo/tooling support). Pin `openjdk-17-jdk` (24.04's `default-jdk` is 21).
  - **`ubuntu:22.04` LTS retained as backup/current** (this is what v3.0.0 ships;
    keep it as the fallback if 24.04 shows issues). Note 22.04 standard support ends
    2027‑04 — not the long-term baseline.
  - **Defer `ubuntu:26.04`** (released 2026‑04; Wayland-first; ecosystem immature) to P2.
  - **Not viable:** Alpine (musl) and distroless/scratch (no shell/apt/WM).
- **The desktop is part of L0, split required vs optional:**
  - **Required (pinned):** `Xvfb` + **a single light window manager** (e.g. `openbox`)
    + the **exact font/theme set** we test against. A WM is mandatory even for headless
    runs so GUI windows place/decorate predictably.
  - **Optional overlay:** `lxde` + `x11vnc` + `arc-theme` + `zenity` … for the
    interactive/dev GUI.
  - **The desktop/WM/theme/fonts are pinned and recorded** — they are inputs to
    image-match confidence/stability (§1.6).

**Published tags — two tiers (agreed).** L0/L1 are kept as *internal build stages*
(for cache/reuse) but published as a **single `autobdd-base` tag**:

| Tag | Layers | Contents | Consumer |
|---|---|---|---|
| `xyteam/autobdd-base:<v>` | L0+L1 | OS + X desktop + image/OCR + kbd/mouse | **screen-only runs**; bring-your-own framework |
| **`xyteam/autobdd-framework:<v>`** | + **L2 only** | **the product**: + Chrome/chromedriver, Node, Python, wdio, cucumber, AutoBDD | **default** — test repos pull this |

- **Product scope = the essentials.** `autobdd-framework` ships **Chrome/chromedriver,
  Node, Python, wdio, cucumber, AutoBDD** — and **not** the guest tools (postman, jmeter, jest,
  pytest); users add those in their own projects (the generic
  `When I run this command "..."` step makes any CLI tool a BDD step).
- **Alias:** `xyteam/autobdd:<v>` is published as a **deprecated alias** of
  `autobdd-framework:<v>` (same image, two tags) so existing consumers
  (`AutoBDD_Ver`) don't break.
- **Build vs publish:** keep L0/L1 as build stages; publish one `autobdd-base` tag.
- **Dev GUI:** bundle `lxde` + `x11vnc` + `arc-theme` + CJK fonts into `autobdd-base`
  for v1 (simpler; slimmable later via a build arg / overlay).
- **Record per release:** base OS, Chrome/driver, WM/theme/fonts, engine version.
- **Back-compat:** retire/alias today's `autobdd-ubuntu` / `-nodejs` at the next major
  (L0 → `autobdd-base`, L2 → `autobdd-framework`).

---

## 7. Composition model — "use ours, or bring your own"

The product rule: **the platform image is a default, not a straitjacket.**

- **Use the product** — `docker run xyteam/autobdd-framework:<v>` (alias: `xyteam/autobdd:<v>`)
  → base + the BDD framework essentials.
- **Bring your own framework** — build `FROM xyteam/autobdd-base` (OS + display +
  screen/mouse engine) and add your Node / wdio / JUnit / Playwright. You keep the screen
  engine, display, ssh/VNC.
- **Bring your own tools** — add them **in your project** (install + invoke via the
  generic `When I run this command "..."` step); the product image does **not** ship
  postman/jmeter/jest/pytest.
- **Screen-only (no browser)** — run `xyteam/autobdd-base`; today's screen actions need no
  Chrome/wdio.
- **Use ours as environment only** — mount your project; the image never owns your tests.

**Layer contract (interfaces each layer exposes):**
- **`autobdd-base` (L0+L1):** `DISPLAY` (Xvfb) + pinned WM; `:22` ssh, `:5900` VNC;
  entrypoint reads `USER`/`USERID`/`GROUPID`; `tini`; **the screen engine's CLI seam**
  (`findTargetImage`-style) with **stable JSON I/O** + env (`TESSDATA_PREFIX`,
  `LD_LIBRARY_PATH`).
- **`autobdd-framework` (L2):** `auto-runner.py`, `xvfb-runner.sh`, the report generator;
  `PATH` provides `npx wdio`, `chromedriver`, `node`, `python3`; `CHROMEDRIVER_PATH`; the
  generic `When I run this command "..."` step (so guest tools are first-class steps).

---

## 8. Repo re-design

**8.1 `AutoBDD` (the platform/framework repo) — "build the image + ship the framework."**
- Owns the shipped layers (L0, L1, L2): dockerfiles, `framework/` (step libraries, runners,
  report generator), the Oculix bridge.
- Owns image build + publish; README: **"clone only to inspect/build the image."**
- Ships **two conformance suites** under `test-projects/`, one per product tag. Each suite
  is the shippability gate for its tag, and **CI builds the tag then runs its suite**.

**8.1.1 `test-projects/autobdd-base-test` — gates `autobdd-base` (L0/L1). NO browser.**
- Runs **on `autobdd-base`** only — no Chrome, no wdio, no cucumber.
- **Form:** a **CLI/script suite** (a bash/python runner with assertions + a small report),
  because the base ships no BDD framework.
- **Covers:**
  - **L0** — ssh reachable (`:22`); essentials present (`curl`/`wget`/`git`/`jq`/`parallel`/
    `ffmpeg`/`unzip`); entrypoint creates `USER`/`UID`/`GID` + exports `DISPLAY`; `tini`.
  - **L0** — Xvfb up on `DISPLAY`; the **pinned WM** is running; VNC reachable (`:5900`);
    a sample GUI window renders (launch a tiny X app → screenshot → assert non-blank).
  - **L1 (the engine — the moat)** — `findTargetImage` CLI finds a known target on screen
    and returns **JSON** `{location,dimension,score,…}`; OCR reads on-screen text; keyboard/
    mouse move/click/type (assert via re-capture / pointer query); **confidence metrics**
    (`score`,`margin`,`verified`) are emitted.
- **Method:** use a **non-browser GUI target** (display a fixture image / a simple X app)
  to exercise image-match, OCR and kbd/mouse — proving the base "sees and acts" with no
  Chrome in the loop.

**8.1.2 `test-projects/autobdd-framework-test` — gates `autobdd-framework` (product, +L2).**
- Runs **on `autobdd-framework`** (the product image).
- **Form:** **cucumber (wdio) e2e** — like today's `autobdd-test` (this suite supersedes it).
- **Covers:**
  - Chrome + **matching** chromedriver launch; `npx wdio` runs a module; `CHROMEDRIVER_PATH`.
  - Step libraries — **screen actions** (image/OCR), **web/DOM actions**, `vars`/`envs`/
    `project_steps`.
  - Runners — single / parallel / auto; Xvfb isolation per worker.
  - Reports — HTML + step screenshots (pass/fail watermarks) + movies + junit/xml.
  - The generic `When I run this command "..."` step (guest-tool path).
  - The **confidence/stability study** output (D1).
- **CI wiring:** platform CI builds `autobdd-base` → runs **`autobdd-base-test`**; builds
  `autobdd-framework` → runs **`autobdd-framework-test`**. A tag ships only if its suite is green.

**8.2 `AutoBDD-example` (a consuming test project) — "use the image; show everything."**
- Contains **only tests**, mock/demo apps, and its run compose; **no framework code**.
- Organized by action family, image-first:
  - `screen-actions/` **(primary)** — image match + OCR
  - `web-page-actions/` (assist) — browser/DOM
  - `tool-actions/` — API (postman), load (jmeter), unit (jest/pytest) as BDD
- Runs off the published image (`AutoBDD_Ver`), zero framework clone.

**8.3 Cross-repo contract**
- Image ↔ framework ↔ example versions tracked in a matrix (`v2.3.0` / `v2.4.0` / `v3.0.0`).
- The example declares a **minimum image version**; CI runs it against the published tag.

---

## 9. Functional requirements

**L0 — base (OS + X display + desktop)**
- FR-1 Lean Linux base; image size target ≤ ~1.2 GB.
- FR-2 Provides `sshd`, `parallel`, `curl/wget`, `git`, `jq`, `unzip`, `ffmpeg`,
  `tini`/`supervisor`.
- FR-2a **Xvfb** for a headless X display (`DISPLAY` exported before any JVM/GUI start).
- FR-2b **A single pinned light window manager** (e.g. `openbox`) — required even for
  headless runs so GUI windows place/decorate predictably.
- FR-2c **Optional overlay** — `lxde` + `x11vnc` + `arc-theme` + `zenity` + CJK fonts
  for the interactive/dev GUI (VNC).
- FR-2d **Pinned GUI stack** — the WM/theme/font set is fixed and recorded (it is an
  input to image-match confidence/stability, §1.6).
- FR-3 Entrypoint creates `USER`/`USERID`/`GROUPID`, exports `DISPLAY`, exposes 22/5900.
- FR-4 Headless by default; VNC optional.

**L1 — OS actions (differentiator, first-class)**
- FR-5 Image matching: `find/click/hover/assert` on a supplied image; returns
  `{location,dimension,score,text}` JSON.
- FR-6 OCR: read on-screen text/areas; assert containment.
- FR-7 Keyboard/mouse: move/click/drag/type (prefer a single native surface).
- FR-8 Visual feedback: found-target **flash**, visible in movies and **carried into the
  step screenshot** with a pass/fail watermark.
- FR-9 Natives bundled & warmed at build (no runtime download).
- FR-9a **Confidence exposure** — each screen step records `score`, `margin`, `verified`,
  `latency`; the report shows a confidence badge + raw numbers. Advisory only in v1 (D4).
- FR-9b **Post-run stability study** — after each run, compare per-step confidence against
  previous runs; on instability, surface the score and advise a more precise means
  (higher-score image/fixture, or web-DOM) (D1).
- FR-9c **Screen-only runtime mode (v1)** — run pure screen actions with **no browser**
  (L1 alone) for targets where DOM capability = 0 (D3).

**L2 — BDD framework**
- FR-10 Chrome + **matching** chromedriver on `PATH`; no runtime driver download.
- FR-11 Node LTS + WebdriverIO + Cucumber; `npx wdio` runs a module.
- FR-12 Runners: `auto-runner.py` (parallel discovery), single/parallel runners; Xvfb isolation.
- FR-13 Reports: HTML with step screenshots (watermarks), per-scenario movies, junit/xml.
- FR-14 Python available for tooling/tests.

**L3 — guest tools (NOT shipped; user-provided)**
- FR-15 **Guest tools** (API: **postman** · load: **jmeter** · unit: jest/pytest) are **not**
  part of the product image; users install them in their own test projects.
- FR-16 The product provides the generic **`When I run this command "..."`** step so any
  installed CLI tool becomes a first-class BDD step.
- FR-17 The reference **example** demonstrates guest tools (API: postman · load: jmeter ·
  unit: jest/pytest) as optional modules — the image itself does not ship them.

**Repos**
- FR-19 Test repos run with **no framework clone**; only their own clone + the image.
- FR-20 A repo may replace L2 and/or L3 by building on the lower tags.
- FR-21 Example demonstrates each action family (screen first) and runs green from the
  published image.

---

## 10. Non-functional requirements

Targets are anchors for review; each maps to a place we can measure/enforce.

### 10.1 Size / footprint (NFR-S)
- **NFR-S1** Two published tags only: `autobdd-base` and `autobdd-framework` (+ alias).
- **NFR-S2** Budgets (compressed pull size):
  - `autobdd-base` ≤ **2.5 GB**
  - `autobdd-framework` ≤ **3.5 GB**
- **NFR-S3** Layer deltas (build-stage budgets, for trend tracking): L0 ≤ 1.0 GB ·
  L1 ≤ 0.8 GB · L2 ≤ 1.0 GB.
- **NFR-S4** **Size gate in CI**: the build records each tag's size; a PR that exceeds a
  budget fails (or requires an explicit waiver).
- **NFR-S5** No build toolchain in the runtime stage (multi-stage; compilers/dev headers
  stay in builder stages) — keeps the surface and CVEs down.

### 10.2 Reproducibility & pinning (NFR-P) — **pin all third-party tools**
- **NFR-P1** The **published image digest is the immutable pin**: consumers reference
  `:<v>` (or its digest); a released digest never changes.
- **NFR-P2** **Digest-pin `FROM`** in every Dockerfile (e.g. `ubuntu:24.04@sha256:…`).
- **NFR-P3** **Pin every third-party component the platform ships to an exact version** —
  not just majors. The pinned set:
  - **Base OS** — `ubuntu:24.04` digest-pinned; **apt packages version-pinned** (or built
    from a pinned distro snapshot).
  - **Chrome + chromedriver** — **exact version via Chrome for Testing**
    (`chrome-for-testing-public/<ver>/…` for *both* browser and driver), **not** apt
    "latest". This is what makes Chrome pinning possible.
  - **Java** — exact `openjdk-17-jdk` version.
  - **Node** — exact Node 20.x (NodeSource pinned).
  - **Python** — exact 3.x + `requirements` pinned (`==` / hashes).
  - **Oculix engine** — `oculixapi` 4.0.0 (exact jar).
  - **Node deps** — committed `package-lock.json`; **`npm ci`** (not `npm install`).
  - **GUI stack** — WM/theme/fonts pinned (they change rendering → change image-match
    confidence, §1.6).
  - **Other tools** — ImageMagick, ffmpeg, … exact apt versions.
- **NFR-P4** **Record the resolved pinned versions** in-image (`/etc/autobdd-versions`,
  generalizing today's `/etc/autobdd-chrome-version`).
- **NFR-P5** **Verified downloads** — checksums/signatures for externally fetched artifacts
  (Chrome-for-Testing, jars).
- **NFR-P6** **A pin bump is a reviewed change** (Renovate/dependabot-style PR) that
  triggers **both** conformance suites (§8.1).

### 10.3 Startup & performance (NFR-T)
- **NFR-T1** Container ready (ssh/VNC up, `DISPLAY` live) ≤ **10 s**.
- **NFR-T2** First image-match after warm-up ≤ **1 s**; full-screen OCR within a few s.
- **NFR-T3** No runtime downloads of drivers/natives (bundled + warmed at build); after
  build, a run needs network only for the **targets under test**.

### 10.4 Security (NFR-SEC)
- **NFR-SEC1** Tests run as the **non-root** `USER` the entrypoint creates; root only for
  entrypoint setup.
- **NFR-SEC2** **No secrets baked** — no credentials/tokens in layers; secrets via runtime
  env (`PASSWORD`, etc.); document this.
- **NFR-SEC3** **sshd hardened** (no root login unless required; prefer key auth); VNC
  password required if VNC is exposed.
- **NFR-SEC4** **`docker.sock` only when a test truly needs it**; if bind-mounted,
  document the privilege it grants (host daemon access).
- **NFR-SEC5** **Privileged/`--no-sandbox`**: document why Chrome/the container needs it,
  and keep it as small a grant as possible.
- **NFR-SEC6** **Scanning + SBOM**: CI scans each image (e.g. Trivy/Grype/Scout) and emits
  an **SBOM** (syft) attached to the build; CVE deltas reviewed per release.
- **NFR-SEC7** **Rebuild cadence**: periodic rebuild with `--pull` to absorb backported
  fixes (distro security is cadence-driven, not base-driven).

### 10.5 Observability & artifacts (NFR-O)
- **NFR-O1** Per-scenario structured logs; artifacts retained (step screenshots, movies,
  junit/xml, HTML report).
- **NFR-O2** **Confidence/stability** surfaced (report badge + post-run study) — advisory
  in v1 (D4).

### 10.6 Portability (NFR-PORT)
- **NFR-PORT1** Primary `linux/amd64`; `linux/arm64` a multi-arch goal (P2), tracked.

### 10.7 Reliability / maintainability (NFR-R)
- **NFR-R1** Near-hermetic runs (NFR-T3); flake attributable to the target, not the harness.
- **NFR-R2** Each tag gated by its conformance suite (§8.1); a tag ships only if green.
- **NFR-R3** Automated dependency/version-bump PRs; the version matrix updated per release.

---

## 11. UX / workflows

1. **Consumer (most users)** — clone test repo; `docker compose run … "make e2e-test"`;
   open `index.html`. No framework knowledge.
2. **Author** — add a feature; prefer `:screen:` steps, use `:browser:` to assist; run one
   module fast.
3. **Platform eng** — pin `AutoBDD_Ver`; or `FROM autobdd-base` and plug in your own framework.
4. **CI** — pull image; run suite; upload report artifact.

---

## 12. Packaging & versioning

- Semantic versions, `v`-prefix tags; release = tag + GitHub Release + published images
  (+ recorded Chrome/driver).
- **Version matrix** (established): v2.3.0 (Ubuntu20.04/Node12/Chrome96/wdio7) →
  v2.4.0 (Node14, runnable base) → v3.0.0 (Ubuntu22.04/Node20/Java17/Chrome/wdio9/Oculix4).
  **Going forward: base `ubuntu:24.04`** (22.04 retained as backup; 26.04 deferred).
- Compatibility: the example declares a supported image range.

---

## 13. CI/CD

- Platform repo CI: build each tag, then run its suite — `autobdd-base-test` (base)
  and `autobdd-framework-test` (product).
- Consumer/repo CI: pull the published image; run their suite — validates the layer contract
  with real consumers.

---

## 14. Metrics & acceptance

**Acceptance is per platform component, gated by that component's test suite** — a
component is accepted only when **its** suite passes against **its** image:

| Component | Accepted when |
|---|---|
| **`autobdd-base`** (L0/L1) | **`autobdd-base-test`** passes — ssh/essentials, Xvfb+WM+VNC, screen engine (image match + OCR + kbd/mouse + confidence metrics), no browser |
| **`autobdd-framework`** (product, +L2) | **`autobdd-framework-test`** passes — Chrome/driver, step libraries, runners, reports, command step, stability study |
| **`AutoBDD-example`** | runs green off the published image (`AutoBDD_Ver`) |
| **Docs** | README states the layers, version matrix, and philosophy |

**Product metrics** (tracked, not gates): time-to-first-green (< 15 min from clone);
image pull size vs budgets (NFR-S2); share of "un-automatable" targets now covered;
env-related flake rate; screen-step confidence/stability trend.

---

## 15. Roadmap

- **P0 (done):** modern runtime (v3.0.0), Oculix cutover, run-off-image, screen + guest-tool
  BDD families.
- **v1 — the re-design release (one release, internally phased).** All approved NFRs stay
  in v1; work ships as a stream of small PRs and the release cuts when Phase B is green.
  - **Phase A — structure:** layers (L0/L1/L2) + the **two tags** (`autobdd-base`,
    `autobdd-framework`; `autobdd` alias); split suites (`autobdd-base-test`,
    `autobdd-framework-test`), each gating its tag; **freeze `autobdd-base`'s CLI seam +
    JSON schema as the public contract** (already exercised by screen-only mode); example
    goes **screen-first**; docs (layers, version matrix, philosophy).
  - **Phase B — NFR hardening:** **pin-all** (Chrome + chromedriver exact via Chrome for
    Testing; record apt versions), security (SBOM + scanning), size gate, startup targets.
  - *Carve-out:* **apt snapshot pinning → P2** (v1 records apt versions; the pinned distro
    snapshot lands in P2).
- **P1:** publish a **bring-your-own-framework example** — a **full second BDD framework**
  (e.g. a JUnit or Playwright project) that `FROM autobdd-base` and drives the screen
  engine through the CLI seam, proving the contract beyond our own cucumber stack;
  baseline OS → 24.04 fully validated; guidance for guest tools.
- **P2:** pinned distro **apt snapshot**; `linux/arm64`; remote-screen (VNC) targets;
  richer visual-diff reporting; MCP exposure.

---

## 16. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Layer split churns image names/consumers | version bump + aliases; one migration guide |
| Browser/driver drift | pin or record versions; CI guard |
| OCR/native fragility in containers | Oculix bundled natives + absolute-path loading (Octachorix next) |
| "Image-first" misread as "image-only" → flaky | the guardrails in §1.4; prefer DOM-assist for exact values |
| "Bring-your-own" contract rot | validate via real consumer CI |
| Scope creep into native/mobile | keep as future, non-goal for v1 |

---

## 17. Sales battlecard

- **vs Playwright/Selenium/Cypress:** they read the DOM; we *see* the screen
  (images + text) — canvas, PDF, native, remote.
- **vs Applitools/Percy:** they compare images; we *act* on them (find→click→type) in one
  BDD flow.
- **vs "home-grown":** a versioned, reproducible image and a language the whole team reads.

---

## 18. Open questions (for point-by-point discussion)

1. ~~Tag naming?~~ **Resolved (§6):** two tags — `autobdd-base`, `autobdd-framework`, with
   `autobdd` as a deprecated alias. Old `-ubuntu`/`-nodejs` retired at the next major.
2. ~~Is L3 opt-in or included by default?~~ **Resolved (§6/§7):** L3 (guest tools — postman,
   jmeter, jest/pytest) is **not shipped at all**; users add tools in their projects.
3. ~~BYO-framework: v1 or P1?~~ **Resolved (hybrid):** the **contract is v1** (freeze
   `autobdd-base`'s CLI seam + JSON schema as the public interface), the **BYO
   build/example is P1**.
4. ~~Chrome pinning policy?~~ **Resolved (NFR-P3):** pin an **exact** Chrome + chromedriver
   version via **Chrome for Testing** (browser *and* driver), like every other
   third-party tool; versions recorded in `/etc/autobdd-versions`.
5. ~~How strictly to enforce image-first?~~ **Resolved (§1.6–1.7):** the boundary is
   *measured*; confidence is advisory in v1 (D4); any *enforcement* (CI lint) is deferred
   to v2, informed by the stability study (D1).
6. ~~Conformance suite location?~~ **Resolved (§8.1):** two suites in the platform repo
   (`autobdd-base-test`, `autobdd-framework-test`), each gating its tag.
