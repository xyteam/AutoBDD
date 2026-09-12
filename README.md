# AutoBDD

**AutoBDD** — a BDD automation framework that drives the **screen** (image matching +
OCR), not just the DOM. `package.json` `3.0.0`.

## What this repository is (and isn't)

This repo is the **framework source and the build source of the AutoBDD docker
images**. You do **not** need to clone it to use AutoBDD.

* The images are built here and **published to Docker Hub**:
  **`xyteam/autobdd-base`** and **`xyteam/autobdd-framework`**. **`xyteam/autobdd`**
  is kept as a **deprecated alias** of `autobdd-framework` (same image, two tags), so
  existing consumers keep working.
* The image is **Ubuntu 24.04** based.
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

## Two images, two layers

The product is published as two tags that are also two **layers** of one stack:

| Tag | Layers | Contains | Use when |
|---|---|---|---|
| **`xyteam/autobdd-base`** | **L0** OS + essentials, X display + desktop (Xvfb/openbox/x11vnc) · **L1** screen engine (Java 17 + Node + the Oculix bridge) | **no browser, no WebdriverIO** | you want **screen-only** automation, or you are building **your own framework** on top |
| **`xyteam/autobdd-framework`** | L0 + L1 **+ L2** | Chrome + matching chromedriver · WebdriverIO · Cucumber · the AutoBDD step library | you want the ready-made BDD framework and HTML reports |

`xyteam/autobdd:<v>` is a **deprecated alias** of `xyteam/autobdd-framework:<v>`.

The base's **public interface** is a frozen CLI + JSON seam — `findTargetImage` —
documented in [`docs/CONTRACT.md`](docs/CONTRACT.md). A foreign framework shells out to it
instead of importing our code, so the base is usable **on its own** (screen-only mode).

**Philosophy:** image/action steps first; web/DOM steps are an assist. The engine sees
pixels and text, so the same steps cover web pages, canvas, native apps, and anything else
on screen.

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

> From the next release the product is published as two tags — **`xyteam/autobdd-base`**
> (screen-only) and **`xyteam/autobdd-framework`** (the full product), with
> **`xyteam/autobdd`** as a **deprecated alias**. See **Two images, two layers** above and
> [`docs/CONTRACT.md`](docs/CONTRACT.md) for the base's public seam.

The Node version is chosen to support both the WebdriverIO version and the
bundled internal demo-app.

## Try it and see the report

This repo ships two suites:

* **`test-projects/autobdd-base-test`** — a **no-browser** conformance suite for the
  **base** image (L0/L1 + the frozen CLI seam). Fast; no Chrome required:
  ```bash
  cd test-projects/autobdd-base-test
  AutoBDD_Ver=<v> make docker-run jobs="base-test"
  ```
  Dev (interactive shell, or ssh + VNC desktop) is extra `docker compose run`
  parameters — e.g. `docker compose run --rm --entrypoint /root/autobdd-dev.startup.sh
  -p 2225:22 -p 5925:5900 autobdd-base-test`; see the suite's README.
* **`test-projects/autobdd-framework-test`** — the full framework suite. Run it to see
  AutoBDD's reports for yourself — step screenshots (with green/red pass-fail watermarks
  and image-match markers), per-scenario movies, and the HTML report:

```bash
cd test-projects/autobdd-framework-test
AutoBDD_Ver=3.0.0 ABDD_PROJECT=autobdd-framework-test \
  USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
  make docker-run jobs="clean e2e-test"
# then open test-results/e2e-test/*/index.html
```

## Under the hood

* **Base** (`xyteam/autobdd-base`): Ubuntu 24.04 · Java 17 · Node 20 · Xvfb/openbox/x11vnc ·
  the Oculix 4.0.0 screen engine exposed as the `findTargetImage` CLI seam.
* **Framework** (`xyteam/autobdd-framework`): base + Chrome and a **matching chromedriver**
  on PATH, WebdriverIO 9 (Cucumber), the AutoBDD step library.
* Runs with `docker compose` (Compose v2).
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
