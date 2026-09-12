# autobdd-base-test

No-browser conformance suite for **`xyteam/autobdd-base`** (layers L0 + L1).

It proves the base image is usable **on its own** — as a screen-only automation substrate
and as the public platform any framework (ours or a foreign one) builds on. There is no
browser, no WebdriverIO and no Cucumber here; the whole suite is scripts shelling out to
the base's public interface, the frozen **CLI seam** documented in
[`docs/CONTRACT.md`](../../docs/CONTRACT.md).

## Image

The suite runs the **locally built** image — the compose sets `pull_policy: never`, so it
never fetches from Docker Hub implicitly. Build it first, or pre-pull it:

```bash
# build (from the AutoBDD repo root)
docker build --build-arg AUTOBDD_VERSION=<v> -t xyteam/autobdd-base:<v> -f .docker/autobdd-base.dockerfile .
# …or use a published one you have already pulled
docker pull xyteam/autobdd-base:<v>
```

## Run

```bash
# CI gate — the suite inside the base image
make docker-run jobs="base-test" AutoBDD_Ver=dev

# shell inside the base image
make docker-run-bash AutoBDD_Ver=dev

# ssh + VNC desktop (the base's L0 layer) — extra `docker compose run` parameters
AutoBDD_Ver=dev docker compose run --rm \
  --entrypoint /root/autobdd-dev.startup.sh \
  -p 2225:22 -p 5925:5900 \
  -e VNC_PASSWORD= -e RESOLUTION=1920x1200x24 \
  autobdd-base-test
# then:  ssh $USER@localhost -p 2225   (password "ubuntu")   ·   vncviewer localhost:5925
```

There is a **single run service** (`autobdd-base-test`); nothing is started or left
running in the background — every mode is just `docker compose run` with different
parameters.

## What it checks

| Section | Coverage |
|---|---|
| **L0 — OS + essentials** | Xvfb/openbox/x11vnc/sshd, Java **17**, Node, Python, ImageMagick, ffmpeg, aosd-cat, xdotool, `findTargetImage`, baked Oculix natives on `LD_LIBRARY_PATH`, **and that no wdio/cucumber leaks into the base**. |
| **L0 — X display + desktop** | Xvfb serves the display at the requested geometry; openbox runs; x11vnc listens on `:5900`. |
| **L1 — screen-engine CLI seam** | `findTargetImage` against `docs/CONTRACT.md`: Screen OCR mode, image match (score/OCR/center), the full JSON key set, `--textHint` gating, `--maxSim` ceiling, `notFound`, and `--imageAction=click` recording the clicked point. |
| **L1 — keyboard/mouse substrate** | `xdotool` moves the pointer on the Xvfb display. |

Exit code is non-zero if any check fails; the runner prints a pass/fail tally.

## Layout

```
Makefile                       host + in-container targets
docker-compose.yml             one run service (autobdd-base-test)
dev/autobdd-run.startup.sh     run-container user bootstrap
base-test/run.sh               the suite
```
