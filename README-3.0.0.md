# AutoBDD 3.0.0 — the framework line (frozen)

> **This release is unchanged and stays published.** Tag `v3.0.0`, its GitHub Release and
> the image `xyteam/autobdd-framework:3.0.0` (plus the `xyteam/autobdd` alias) are exactly
> as shipped. The repository's `master` is now the **4.0.0 base** line — for that, see
> **[README.md](README.md)**.

3.0.0 is the last release of the **framework** line: the base substrate **plus** a browser,
WebdriverIO, Cucumber and the AutoBDD step library, with HTML reports. If you want a
ready-made BDD framework that drives both the DOM and the screen, this is the release you
want. If you want the screen substrate on its own — to build your own framework or agent
on — use 4.0.0.

---

## What's in it

| Tag | Contents | Use when |
|---|---|---|
| **`xyteam/autobdd:3.0.0`** | the product image as 3.0.0 shipped it: Ubuntu 22.04 · Node 20 · Java 17 · Chrome + matching chromedriver on `PATH` · WebdriverIO 9 (Cucumber) · the AutoBDD step library · Oculix 4.0.0 | the ready-made BDD framework and HTML reports |
| `xyteam/autobdd-framework:3.0.0` | the same content under the naming the later two-image split introduced | consumers of the newer naming |

3.0.0 predates the base/framework split: it published **three** images from one compose file —
`xyteam/autobdd-ubuntu` → `xyteam/autobdd-nodejs` → **`xyteam/autobdd`** — so the product tag
was, and is, `xyteam/autobdd:3.0.0`. The substrate underneath is the same idea 4.0.0
describes (a display plus the Oculix engine); what 3.0.0 adds on top is the browser, the
runner and the BDD layer.

### Version history

| Release | Chrome | WebdriverIO | Node | Runtime |
|---------|--------|-------------|------|---------|
| **v2.3.0** | 96 | 7 | 12 | original pinned runtime (Node 12.22.7 + Chrome 96) |
| **v2.4.0** | modern (latest stable at build) | 7 | 14 | re-activated v2.3.0 line; builds against current Chrome; matching browser driver baked in |
| **v3.0.0** | modern (latest stable at build) | 9 | 20 | runtime re-baseline: Node 20 + Java 17 + WebdriverIO 9 + Oculix 4.0.0 — **frozen, this document** |
| v4.0.0 | — | — | 24 | the **base** line — see [README.md](README.md) |

Tags use a `v`-prefix (`v2.4.0`, `v3.0.0`); the `1.0.x`/`2.1.0` tags predate that convention.

---

## Use it

A test repository pulls the published image and runs its own compose — **no AutoBDD
framework clone required**:

```bash
cd ~/Projects/AutoBDD-example
AutoBDD_Ver=3.0.0 ABDD_PROJECT=AutoBDD-example \
  USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
  docker compose run --rm autobdd-example-run "make e2e-test"
# (see the test repo's docker-compose.yml / README for its exact run service)
```

The desktop and remote access work the same way as in the base image: start
`/root/autobdd-dev.startup.sh` to get the GUI desktop on VNC `5900` and ssh on `22`.

```bash
docker run -d --name autobdd \
  -p 5900:5900 -p 2222:22 -e RESOLUTION=1920x1200x24 \
  xyteam/autobdd-framework:3.0.0 /root/autobdd-dev.startup.sh
vncviewer localhost:5900
```

### The screen interface 3.0.0 was built on

Inside, the framework drives the same screen seam this repository still ships, under its
**v1 name and arguments**:

```bash
findTargetImage --imagePath=logo.png --imageAction=click
findTargetImage --ocrPath="Submit" --ocrDetail=word
```

Those names still work in 4.0.0 as a deprecated alias, which means a 3.0.0 consumer can move
to the 4.0.0 base image without changing a single call. The canonical vocabulary and the
full mapping are in [`docs/CONTRACT.md`](docs/CONTRACT.md) §2 and §2b — the v1 reference
tables remain at §2c.

### What it adds on top

* **Chrome + a matching chromedriver** on `PATH`, so a WebdriverIO session drives a real
  browser while the screen engine drives everything outside it.
* **WebdriverIO 9 (Cucumber)** and the AutoBDD step library, so a scenario is written in
  BDD terms rather than in screen coordinates.
* **Reports:** HTML with step screenshots (green/red pass/fail watermarks and image-match
  markers) and per-scenario movies. Run the framework suite in this repo to see them:

  At that tag the suite lives in `test-projects/autobdd-test`, so check the tag out first:

  ```bash
  git checkout v3.0.0
  cd test-projects/autobdd-test
  AutoBDD_Ver=3.0.0 ABDD_PROJECT=autobdd-test \
    USER=$(whoami) PASSWORD=ubuntu HOSTOS=Linux USERID=$(id -u) GROUPID=$(id -g) \
    make docker-run jobs="clean e2e-test"
  # then open test-results/e2e-test/*/index.html
  ```

---

## Rebuilding 3.0.0 from source

`master` is the 4.0.0 base line, so build from the tag — and note that **3.0.0's build
system is a different one**: a three-stage compose build in `.docker/`, not the two
Dockerfiles 4.0.0 uses (`.docker/autobdd-base.dockerfile` /
`.docker/autobdd-framework.dockerfile` did not exist yet). Follow that tag's own files:

```bash
git checkout v3.0.0
cd .docker                       # .env pins AUTOBDD_VERSION=3.0.0
make autobdd-ubuntu              # -> xyteam/autobdd-ubuntu:3.0.0
make autobdd-nodejs              # -> xyteam/autobdd-nodejs:3.0.0
make autobdd-image               # -> xyteam/autobdd:3.0.0   (the product image)
```

The stages are ordered: each builds `FROM` the previous tag, which is why they must be built
in that sequence. `make autobdd-up` starts the dev desktop (`autobdd-dev`) and
`make autobdd-run-bash` a run container, both from the product image.

---

## Credits

* Browser control: **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)**,
  with the demo app and pre-canned Cucumber-JS steps adapted from
  **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**.
* Screen image matching / OCR: **[oculix-org/Oculix](https://github.com/oculix-org/Oculix)** —
  OculiX carries the SikuliX lineage
  ([RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)) forward in its own project.
* Keyboard/mouse: **[octalmage/robotjs](https://github.com/octalmage/robotjs)**.
