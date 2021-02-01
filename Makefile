.PHONY: dockerrun test
# docker
docker-run:
	@echo make $@
	cd .docker && docker-compose run --rm autobdd-run "make $(jobs)" || exit $?
	cd -

autobdd-clean-all: autobdd-clean-image autobdd-clean-nodejs autobdd-clean-ubuntu
autobdd-clean-ubuntu:
	@echo make $@
	if docker images --filter=reference="xyteam/autobdd-ubuntu:*" | grep autobdd; then \
		docker images --filter=reference="xyteam/autobdd-ubuntu:*" -q | xargs docker rmi -f; \
	fi
autobdd-clean-nodejs:
	@echo make $@
	if docker images --filter=reference="xyteam/autobdd-nodejs:*" | grep autobdd; then \
		docker images --filter=reference="xyteam/autobdd-nodejs:*" -q | xargs docker rmi -f; \
	fi
autobdd-clean-image:
	@echo make $@
	if docker images --filter=reference="xyteam/autobdd:*" | grep autobdd; then \
		docker images --filter=reference="xyteam/autobdd:*" -q | xargs docker rmi -f; \
	fi

autobdd-build-all: autobdd-ubuntu autobdd-nodejs autobdd-image
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
autobdd-run-bash:
	cd .docker && make autobdd-run-bash || exit $?
autobdd-up:
	cd .docker && make autobdd-up || exit $?
autobdd-down:
	cd .docker && make autobdd-down || exit $?
autobdd-push:
	cd .docker && make autobdd-push || exit $?
autobdd-pull:
	cd .docker && make autobdd-pull || exit $?
