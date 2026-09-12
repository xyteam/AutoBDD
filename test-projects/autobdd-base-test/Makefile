# autobdd-base-test — no-browser conformance suite for xyteam/autobdd-base.
#
#   make docker-run jobs="base-test"    # CI gate: suite inside the base image
#   make base-test                      # run the suite directly (inside the container)
#   make docker-run-bash                # shell inside the base image
#
# There is only a run service; dev (ssh + VNC desktop) is driven by extra
# `docker compose run` parameters — see README.md.

# export dynamic env for docker compose (not shell-substitutable in .env)
export USER ?= $(shell whoami)
export HOSTOS ?= $(shell uname -s)
export USERID ?= $(shell id -u)
export GROUPID ?= $(shell id -g)
export PASSWORD ?= ubuntu

.PHONY: docker-run docker-run-bash clean base-test test-all

docker-run:
	@echo make $@
	docker compose run --rm autobdd-base-test "make ${jobs}"

docker-run-bash:
	@echo make $@
	docker compose run --rm autobdd-base-test "/bin/bash"

clean:
	@echo make $@
	rm -rf test-results/* 2>/dev/null || true

base-test:
	@echo make $@
	bash base-test/run.sh

test-all: clean base-test
	@echo make $@
