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
autobdd-up:
	cd .docker && make autobdd-up || exit $?
autobdd-down:
	cd .docker && make autobdd-down || exit $?
autobdd-push:
	cd .docker && make autobdd-push || exit $?
