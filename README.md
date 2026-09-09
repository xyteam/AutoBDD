# AutoBDD v2.4.0

**AutoBDD v2.4.0** (`package.json` `2.4.0`, docker image `xyteam/autobdd:2.4.0`).

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

#### Special mentions

* Demo-App application and pre-canned Cucumber-JS steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
* Image-recognizing library is taken from **[RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)**
* Keyboard-and-mouse library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
* Framework-control libraries are taken from **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)**
* Many other open-source npm libraries are listed in **package.json**.
