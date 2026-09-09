# AutoBDD v3.0.0

**AutoBDD v3.0.0** (`package.json` `3.0.0`, docker image `xyteam/autobdd:3.0.0`).

> **Purpose.** This is the **continuation of AutoBDD v2.4.0** — a runtime re-baseline
> built on top of the v2.4.0 base. It modernizes the toolchain and runtime (Ubuntu
> 22.04 · Node 20 · Java 17 · WebdriverIO 9 · Oculix 4.0.0) and improves the
> on-screen image-match experience.

#### Runtime (v3.0.0)

* Ubuntu 22.04, Node 20, Java 17, Chrome + chromedriver 152 on PATH.
* WebdriverIO **9** (cucumber); runs invoked with `docker compose` (Compose v2).
* **Oculix 4.0.0** for screen image matching and OCR (`oculixapi-4.0.0-linux.jar`,
  SikuliX-compatible API over java-bridge on Java 17); native libs baked to
  `/opt/oculix-natives` with `LD_LIBRARY_PATH` set.
* Dynamic driver-version reporting (read from the actual `chromedriver`).

#### Image-match UX

* **Restored flash-on-match**: a successful `findTargetImage` flashes the found area
  (default ~1 s, tunable via `--flash`) as a **red border over clear content** — no
  opaque fill — so the area stays visible under Xvfb.
* **Flash in the step screenshot**: the frame captured during a `FindImageTarget` step
  becomes that step's screenshot and carries the step-name watermark at the bottom,
  **green for passed / red for failed** steps, matching other steps.
* **Baked (image) mode**: `test-projects/autobdd-test/docker-compose.docker.yml` runs
  autobdd-test purely off the local image (no working-tree mount).

#### Simple to use

* AutoBDD lets you focus on your test; everything else works out for you.
* Download [AutoBDD-example](https://github.com/xyteam/AutoBDD-example) and try it.
* Rename AutoBDD-example as your own project.

#### Under the hood

##### Platform

* Linux base (Ubuntu 22.04)
  * xvfb desktop environment — real web browser (Chrome via chromedriver), real file system, keyboard-mouse-screen control
  * development tools (nodejs 20, python, java 17, etc.)
* Screen, Keyboard and Mouse libraries
  * oculix 4.0.0 (screen image matching and OCR, sikulix-compatible)
  * robot-js (keyboard and mouse)

##### Framework

* Automation tools
  * CI/CD runner — parallel test runner, automatic cucumber + junit report generator
  * local development runner — full GUI (WYSIWYT), auto project mount, docker compose up/down control
* Popular 3rd-party libraries
  * webdriverio (v9, on Node 20)
  * cucumber
  * HTML report with step screenshots (green/red pass-fail watermarks + image-match markers) and test-case movie
  * rich pre-canned cucumber steps (150+)
* Framework-provided libraries
  * keyboard-mouse control (cucumber BDD statements and JS library)
  * remote access (remote desktop, remote command console, remote filesystem)

#### Special mentions

* Demo-App application and pre-canned Cucumber-JS steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
* Image-recognizing library is provided by **[Oculix](https://github.com/)**, a SikuliX-compatible engine
* Keyboard-and-mouse library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
* Framework-control libraries are taken from **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)**
* Many other open-source npm libraries are listed in **package.json**.
