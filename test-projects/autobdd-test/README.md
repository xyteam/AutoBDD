# autobdd-test

#### purposes:
1. smoke test and demo the automagic power of xyteam/autobdd test framework;
2. serve as a template for setting up a new autobdd test project.

> **Version sync (v3.0.0):** This repo is part of the four-repo project set aligned
> on **3.0.0** (AutoBDD framework + docker image `xyteam/autobdd:3.0.0`,
> AutoBDD-example, autobdd-test, xySikulixApi) — all verified to work together.
> `.env`'s `AutoBDD_Ver=3.0.0` selects the matching image. This is the base going
> forward; a future effort consolidates the repos and upgrades dependencies together.

#### requirement:
1. docker,
2. docker-compose
3. git
4. vnc client/viewer

#### demo setup:
1. mkdir -p $HOME/Projects
2. git clone https://github.com/xyteam/autobdd-test.git $HOME/Projects/autobdd-test

#### test and report:
results are grouped by test suite under `test-results/`:

```
test-results/
├── e2e-test/
│   ├── single-runner-report/       # cucumber html - single-runner (test-1nit)
│   ├── parallel-runner-report/       # cucumber html - parallel runner (test-autobdd-libs)
│   └── auto-runner-report/    # cucumber html - auto-runner
├── cypress-test/             # cypress run.log + video/screenshot artifacts
├── jest-test/                # jest run.log
├── pytest-test/              # pytest run.log
└── k6-test/                  # k6 run.log
```

##### open result files per suite
each suite produces a result file to inspect:

| suite | result file | how to view |
|-------|-------------|-------------|
| e2e-test | `e2e-test/auto-runner-report/index.html` | open in a browser (cucumber html report) |
| e2e-test | `e2e-test/parallel-runner-report/index.html` | open in a browser |
| e2e-test | `e2e-test/single-runner-report/index.html` | open in a browser |
| cypress-test | `cypress-test/run.log` (and `cypress-test/*.mp4` video) | open log in a text editor |
| jest-test | `jest-test/run.log` | open in a text editor |
| pytest-test | `pytest-test/run.log` | open in a text editor |
| k6-test | `k6-test/run.log` | open in a text editor |

##### sample report output
a representative green-run output per suite (what each report/`run.log` looks like) is
available as a gist: https://gist.github.com/xywang68/79d2410ac7c7b7607a87216b0ea35ee2

##### e2e test
```
docker-compose run --rm autobdd-test-run "make e2e-test"
```

#### performance test
###### k6 performance test
```
docker-compose run --rm autobdd-test-run "make k6-test"
```
#### unit test
###### jest
```
docker-compose run --rm autobdd-test-run "make jest-test"
```
###### cypress
```
docker-compose run --rm autobdd-test-run "make cypress-test"
```
###### python3
```
docker-compose run --rm autobdd-test-run "make pytest-test"
```
#### test all in one-shot
```
docker-compose run --rm autobdd-test-run "xvfb-runner.sh make test-all"
```

#### test development env

###### start dev container:
```
docker-compose up -d autobdd-test-dev
```
###### ssh access to dev container:
```
ssh -o StrictHostKeyChecking=no localhost -p 2224
default password is *ubuntu*
```
###### vnc viewer access to dev container:
launch remmina (or another vnc client):
```
remmina -c vnc://localhost:5924
```
(default password is *ubuntu*)
###### run single test from ssh shell:
```
cd e2e-test/test-something
single-runner.sh features/test_image.feature
single-runner.sh features/test_ocr.feature:7
```
Observe browser GUI from vnc viewer

