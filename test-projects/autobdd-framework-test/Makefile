testSectionBegin="=======\nTest\n-------"
testSectionEnd="----------\nDone Test\n=========="

.PHONY: docker-run test-all test clean e2e-test cypress-test jest-test pytest-test k6-test

# export dynamic env for docker compose (not shell-substitutable in .env)
export USER ?= $(shell whoami)
export HOSTOS ?= $(shell uname -s)
export USERID ?= $(shell id -u)
export GROUPID ?= $(shell id -g)
export PASSWORD ?= ubuntu

docker-run:
	@echo make $@
	docker compose run --rm autobdd-framework-test-run "xvfb-runner.sh make ${jobs}"
docker-run-bash:
	@echo make $@
	docker compose run --rm autobdd-framework-test-run "/bin/bash"
docker-up:
	@echo make $@
	docker compose up -d autobdd-framework-test-dev
docker-logs:
	@echo make $@
	docker compose logs autobdd-framework-test-dev
docker-logs-f:
	@echo make $@
	docker compose logs -f autobdd-framework-test-dev
docker-down:
	@echo make $@
	docker compose down
docker-ssh:
	ssh $$USER@localhost -p 2224 || exit $?

clean:
	@echo make $@
	@echo "cleaning auto-runner-report folder...";
	rm -rf test-results/*;
	find . -type d -name "__pycache__" -o -name ".pytest_cache" | xargs rm -rf;
	find . -type f -name "*.pyc" | xargs rm -f;
	find e2e-test -type d -name logs | xargs rm -rf;
	find e2e-test -type d -name test-results -o -name single-runner-report -o -name parallel-runner-report -o -name auto-runner-report | xargs rm -rf;
	find e2e-test -type f -name "test-*.json" | xargs rm -f;
	find e2e-test -type f -name "Passed_*.???" -o -name "Failed_*.???" -o -name "Recording_*.???" | xargs rm -f;

e2e-single-runner:
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running cucumber test with single-runner.sh (single runner)...";
	cd e2e-test/test-1nit && SCREENSHOT=3 MOVIE=1 REPORTDIR=../../test-results/e2e-test/single-runner-report single-runner.sh -x || exit $$?;
	@echo ${testSectionEnd}

e2e-parallel-runner:
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running cucumber test with parallel-runner.sh (parllel runner)...";
	cd e2e-test/test-autobdd-libs && SCREENSHOT=3 MOVIE=1 REPORTDIR=../../test-results/e2e-test/parallel-runner-report parallel-runner.sh || exit $$?;
	@echo ${testSectionEnd}

e2e-auto-runner:
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running cucumber test with auto-runner (parallel runner with cucumber report)...";
	auto-runner.py --project autobdd-framework-test --reportpath e2e-test/auto-runner-report --movie 1 -- --cucumberOpts.tags='not @Init' || exit $$?;
	find test-results/e2e-test/auto-runner-report -type f -name "*.run" | xargs cat || exit $$?;
	@echo ${testSectionEnd}

e2e-test: e2e-single-runner e2e-parallel-runner e2e-auto-runner
	@echo make $@

jest-test:
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running jest unit test...";
	mkdir -p test-results/jest-test; \
	cd js-test && npm install && \
	node_modules/.bin/jest --verbose . > ../test-results/jest-test/run.log 2>&1; \
	exit $$?;
	@echo ${testSectionEnd}

pytest-test:
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running python3 unit test...";
	mkdir -p test-results/pytest-test; \
	pip3 install --break-system-packages --user -r py-test/requirement3.txt && \
	python3 -m pytest -r A py-test > test-results/pytest-test/run.log 2>&1; \
	exit $$?;
	@echo ${testSectionEnd}

cal-app-start:
	@echo make $@
	@echo "starting up cal-app...";
	cd cal-app && npm install && npm start

cal-app-stop:
	@echo make $@
	@echo "stopping cal-app...";
	cd cal-app && npm stop

cypress-test: cal-app-start
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running cypress test...";
	mkdir -p test-results/cypress-test; \
	cd cal-app && \
	xvfb-runner.sh bash -c "node_modules/.bin/cypress install && node_modules/.bin/cypress run" > ../test-results/cypress-test/run.log 2>&1; \
	st=$$?; \
	[ -d cypress/videos ] && cp -r cypress/videos/* ../test-results/cypress-test/ 2>/dev/null; \
	[ -d cypress/screenshots ] && cp -r cypress/screenshots/* ../test-results/cypress-test/ 2>/dev/null; \
	exit $$st;
	@echo ${testSectionEnd}

# k6 is a guest tool (PRD L3: not shipped in the image), so the suite provisions it
# itself into $HOME/.local/bin on first run — pinned version + verified checksum
# (NFR-P3/P5), like the jest/pytest targets install their own tools.
K6_VERSION ?= v2.2.0
K6_SHA256  ?= b5a8003c86f35f5cd5ceef1490312c48e587696c94d998cefc6d7b3b4cb1597d

k6-test:
	@echo make $@
	@echo ${testSectionBegin};
	@echo "running k6 performance test...";
	mkdir -p test-results/k6-test; \
	K6_BIN="$$HOME/.local/bin/k6"; \
	if [ ! -x "$$K6_BIN" ]; then \
		echo "  installing k6 $(K6_VERSION) (guest tool: not shipped in the image)"; \
		mkdir -p "$$HOME/.local/bin" /tmp/k6-dl; \
		curl -fsSL -o /tmp/k6-dl/k6.tar.gz "https://github.com/grafana/k6/releases/download/$(K6_VERSION)/k6-$(K6_VERSION)-linux-amd64.tar.gz" && \
		echo "$(K6_SHA256)  /tmp/k6-dl/k6.tar.gz" | sha256sum -c - && \
		tar xzf /tmp/k6-dl/k6.tar.gz -C /tmp/k6-dl && \
		install -m 0755 "/tmp/k6-dl/k6-$(K6_VERSION)-linux-amd64/k6" "$$K6_BIN"; \
	fi; \
	cd k6-test && for f in $$(find . -type f -name "*-test.js"); do "$$K6_BIN" run "$$f"; done > ../test-results/k6-test/run.log 2>&1; \
	exit $$?;
	@echo ${testSectionEnd}

test-all: clean e2e-test cypress-test jest-test pytest-test k6-test
	@echo make $@
