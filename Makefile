.PHONY: all autobdd
all:	autobdd
autobdd:
	$(MAKE) -C .docker
test:
	cd test-projects/autobdd-test && \
	docker-compose run --rm autobdd-test-run "xvfb-runner.sh make test-all" || exit $?
	cd -
