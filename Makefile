.PHONY: dockerrun test
docker-run:
	@echo make $@
	cd .docker && docker-compose run --rm autobdd-run "make $(jobs)" || exit $?
	cd -
autobdd-ubuntu:
	cd .docker && make autobdd-ubuntu || exit $?
	cd -
autobdd-nodejs:
	cd .docker && make autobdd-nodejs || exit $?
	cd -
autobdd-image:
	cd .docker && make autobdd-image || exit $?
	cd -
autobdd-test:
	cd ../autobdd-test && \
	docker-compose run --rm autobdd-test-run "xvfb-runner.sh make test-all" || exit $?
	cd -
