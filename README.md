# AutoBDD v2.4.0

#### AutoBDD v3: converted to webdriverio

> **Current runtime (v3.0.0-node20, Phase 5 re-baseline):** Ubuntu 22.04 · Node 20 ·
> Java 17 · Chrome 152 + chromedriver 152 · WebdriverIO **9** · Oculix 4.0.0 image
> matching/OCR. Docker image tag **`xyteam/autobdd:3.0.0-node20`**. Runs are invoked
> with `docker compose` (Compose v2).

#### Changelog (v3.0.0-node20 / Phase 5)

* **Runtime re-baseline**: Ubuntu 22.04, Node 20 LTS, Java 17, modern Chrome + chromedriver
  on PATH, WebdriverIO **9** (cucumber). Dockerfiles/`Makefile`s switched from the
  deprecated `docker-compose` to `docker compose` (Compose v2).
* **Oculix 4.0.0**: image recognition / OCR is provided by the vendored
  `oculixapi-4.0.0-linux.jar` (SikuliX-compatible API), with its native libs baked to
  `/opt/oculix-natives` and `LD_LIBRARY_PATH` set. `findTargetImage` runs over the
  java-bridge on Java 17.
* **Restored flash-on-match**: when a screen image target is found, `findTargetImage`
  flashes a marker on the found area (default ~1 s, tunable via `--flash`). The marker
  is a **red border over clear content** (option 1) — no opaque fill — so the found
  area stays visible under Xvfb (which has no compositor to blend a translucent alpha).
* **Flash in the step screenshot**: the flash frame captured during a `FindImageTarget`
  step is used as that step's screenshot and carries the step-name watermark at the
  **bottom**, colored **green for passed steps / red for failed steps**, matching the
  standard aosd watermark on other steps.
* **Dynamic driver version reporting**: `chromeDriverVersion` is read from the actual
  `chromedriver --version` instead of a stale hard-coded Chrome-version map, so reports
  show the real driver version (e.g. `Chrome Driver 152.0.7977.82`).
* **Baked (image) mode**: `test-projects/autobdd-test/docker-compose.docker.yml` runs
  autobdd-test purely off the local image (no working-tree mount). The image's baked
  framework is copied to `~/Projects/AutoBDD` at container start.

> **Purpose.** The goal of this release is to **re-activate the AutoBDD v2.3.0 line
> into a working, reproducible state** that serves as the corrected base going
> forward. The earlier label "v3.0.0" was applied prematurely to this codebase;
> it has been re-versioned here as **v2.4.0** to keep the version history honest.
> A future **v3.0.0** (runtime re-baseline on Node 20 / WebdriverIO 9) continues
> from this base.

AutoBDD is a BDD Automation Framework — Powerful, Flexible and Easy-to-Use:

* Powerful — automate anything you can see and operate on any desktop, local or remote, Web or non-Web.
* Flexible — runs on any local desktop, cloud system or CI/CD system, single thread or in parallel.
* Easy-To-Use — write test cases in plain English, single-command execution anywhere.

#### Simple to use

* AutoBDD lets you focus on your test; everything else works out for you.
* Download [AutoBDD-example](https://github.com/xyteam/AutoBDD-example) and try it.
* Rename AutoBDD-example as your own project.

#### Under the hood

##### Platform

* Linux base (Ubuntu 20.04)
  * xvfb desktop environment — real web browser, real file system, keyboard-mouse-screen control
  * development tools (nodejs, python, java, etc.)
* Screen, Keyboard and Mouse libraries
  * sikulixapi (screen and images)
  * robot-js (keyboard and mouse)
  * tesseract-ocr (screen or browser image to text)

##### Framework

* Automation tools
  * CI/CD runner — parallel test runner, automatic cucumber + junit report generator
  * local development runner — full GUI (WYSIWYT), auto project mount, docker-compose up/down control
* Popular 3rd-party libraries
  * webdriverio (v7, on Node 12)
  * cucumber-js
  * HTML report with step screenshots and test-case movie
  * rich pre-canned cucumber steps (150+)
* Framework-provided libraries
  * keyboard-mouse control (cucumber BDD statements and JS library)
  * remote access (remote desktop, remote command console, remote filesystem)

  * Linux Base (Ubuntu 22.04)
    
    * xvfb desktop environment
    
      *  real web browser (Chrome, via chromedriver on PATH)
    
      *  real file system
    
      *  keyboard-mouse-screen control
    
    * development tools (nodejs 20, python, java 17, etc.)

  * Screen, Keyboard and Mouse Libraries
    
    * oculix 4.0.0 (screen image matching and OCR, sikulix-compatible)
    
    * robot-js (keyboard and mouse)

##### Framework:

  * Automation Tools
    
    * CI/CD Runner
    
      * parellel test runner
    
      * automatic cucumber and junit report generator
    
      * pre-canned runner control -- runner will handle docker image download and running automagically
    
    * Local Development Runner
    
      * full GUI - WYSIWYT -- what you see is what you test
    
      * auto project mount - WYWIWYT -- what you write is what you test
    
      * pre-canned runner control -- runner can be controlled with 2 simple docker-compose commands (up and down)
  
    * Popular 3rd Party Libraries
  
    * webdriverio (v9, on Node 20)
  
    * cucumber
  
    * HTML report with step screenshots (with green/red pass-fail watermarks and
      image-match markers) and test case movie
  
    * very rich pre-canned cucumber steps (over 150 steps)
  
  * Framework Provided Libries
  
    * keyboard-mouse control
  
      * in cucumber BDD statements
  
      * in js library
  
    * remote access
  
      * remote desktop
  
      * remote command console
  
      * remote filesystem access
    
#### Special mentions

* Demo-App application and pre-canned Cucumber-JS steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
* Image-recognizing library is taken from **[RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)**
* Keyboard-and-mouse library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
* Framework-control libraries are taken from **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)**
* Many other open-source npm libraries are listed in **package.json**.
