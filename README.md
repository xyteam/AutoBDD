# AutoBDD v3.0.0

**AutoBDD** — a BDD automation framework. `package.json` `3.0.0` · docker image
`xyteam/autobdd:3.0.0`.

## What this repository is (and isn't)

This repo is the **framework source and the build source of the AutoBDD docker
image**. You do **not** need to clone it to use AutoBDD.

* The images are built here and **published to Docker Hub**:
  `xyteam/autobdd:3.0.0` (plus its base layers `xyteam/autobdd-nodejs:3.0.0`,
  `xyteam/autobdd-ubuntu:3.0.0`).
* **Test repositories pull and run the image directly** — e.g.
  [AutoBDD-example](https://github.com/xyteam/AutoBDD-example) runs its suite against
  `xyteam/autobdd:<version>` with no framework clone required.
* **Clone only to inspect/build the AutoBDD docker image.**

```bash
# a test repo selects the published image via AutoBDD_Ver and runs its own compose;
# no AutoBDD framework clone is required
cd ~/Projects/AutoBDD-example
AutoBDD_Ver=3.0.0 ABDD_PROJECT=AutoBDD-example \
  USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
  docker compose run --rm autobdd-example-run "make e2e-test"
# (see the test repo's docker-compose.yml / README for its exact run service)
```

## The key difference: AutoBDD sees the screen

Most browser-automation tools drive the DOM through selectors. **AutoBDD can see
anything and test anything** because it operates on the **screen** using:

* **sample images you provide** — find, click, and assert on any on-screen image
  (screen image matching), and
* **text** — read and act on on-screen text (OCR).

That means it is not limited to DOM elements: it works for web pages, canvas /
non-DOM content, native apps, and any pixel you can see — image-in, action-out.

## Version differences

| Release | Chrome | WebdriverIO | Node | Runtime |
|---|---|---|---|---|
| **v2.3.0** | 96 | 7 | 12 | original pinned runtime (Node 12.22.7 + Chrome 96) |
| **v2.4.0** | modern (latest stable, e.g. 153) | 7 | 14 | re-activated v2.3.0 line; builds against current Chrome; matching browser driver baked into the image |
| **v3.0.0** | modern (latest stable, e.g. 153) | 9 | 20 | runtime re-baseline: Node 20 + Java 17 + WebdriverIO 9 + Oculix 4.0.0 (image matching/OCR) |

The Node version is chosen to support both the WebdriverIO version and the
bundled internal demo-app.

## Try it and see the report

This repo ships its own test suite under **`test-projects/autobdd-test`**. Run it
to see AutoBDD's reports for yourself — step screenshots (with green/red pass-fail
watermarks and image-match markers), per-scenario movies, and the HTML report:

```bash
cd test-projects/autobdd-test
AutoBDD_Ver=3.0.0 ABDD_PROJECT=autobdd-test \
  USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
  make docker-run jobs="clean e2e-test"
# then open test-results/e2e-test/*/index.html
```

## Under the hood (v3.0.0)

* Ubuntu 22.04 · Node 20 · Java 17 · Chrome + chromedriver on PATH.
* WebdriverIO 9 (cucumber); runs with `docker compose` (Compose v2).
* Oculix 4.0.0 for screen image matching and OCR.
* Reports: HTML with step screenshots (pass/fail watermarks) and test movies.

## Credits

* Screen image matching / OCR: **[oculix-org/Oculix](https://github.com/oculix-org/Oculix)** —
  the engine AutoBDD uses to see the screen. OculiX carries the SikuliX lineage
  ([RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)) forward in its own project.
* Keyboard/mouse: **[octalmage/robotjs](https://github.com/octalmage/robotjs)**.
* Demo app and pre-canned Cucumber-JS steps adapted from
  **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**.
* Framework control from
  **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)**.
