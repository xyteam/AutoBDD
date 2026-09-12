# autobdd-base-test — no-browser conformance suite for xyteam/autobdd-base.
#
#   make docker-run jobs="base-test"    # CI gate: suite inside the base image
#   make base-test                      # run the suite directly (inside the container)
#   make docker-run-bash                # shell inside the base image
#   make docker-up / docker-down        # interactive ssh+VNC desktop (ports 2225/5925)

# export dynamic env for docker compose (not shell-substitutable in .env)
export USER ?= $(shell whoami)
export HOSTOS ?= $(shell uname -s)
export USERID ?= $(shell id -u)
export GROUPID ?= $(shell id -g)
export PASSWORD ?= ubuntu

.PHONY: docker-run docker-run-bash docker-up docker-logs docker-logs-f docker-down docker-ssh clean base-test test-all

docker-run:
	@echo make $@
	docker compose run --rm autobdd-base-test-run "make ${jobs}"

docker-run-bash:
	@echo make $@
	docker compose run --rm autobdd-base-test-run "/bin/bash"

docker-up:
	@echo make $@
	docker compose up -d autobdd-base-test-dev

docker-logs:
	@echo make $@
	docker compose logs autobdd-base-test-dev

docker-logs-f:
	@echo make $@
	docker compose logs -f autobdd-base-test-dev

docker-down:
	@echo make $@
	docker compose down

docker-ssh:
	ssh $$USER@localhost -p 2225 || exit $?

clean:
	@echo make $@
	rm -rf test-results/* 2>/dev/null || true

base-test:
	@echo make $@
	bash base-test/run.sh

test-all: clean base-test
	@echo make $@
