.PHONY: dockerrun test
# docker
docker-run:
	@echo make $@
	cd .docker && docker compose run --rm autobdd-run "make $(jobs)" || exit $?
	cd -

autobdd-clean-all: autobdd-clean-base autobdd-clean-framework
autobdd-clean-base:
	@echo make $@
	if docker images --filter=reference="xyteam/autobdd-base:*" | grep autobdd; then \
		docker images --filter=reference="xyteam/autobdd-base:*" -q | xargs docker rmi -f; \
	fi
autobdd-clean-framework:
	@echo make $@
	if docker images --filter=reference="xyteam/autobdd-framework:*" | grep autobdd; then \
		docker images --filter=reference="xyteam/autobdd-framework:*" -q | xargs docker rmi -f; \
	fi

autobdd-build-all: autobdd-base autobdd-framework
autobdd-base:
	cd .docker && make autobdd-base || exit $?
	cd -
autobdd-framework:
	cd .docker && make autobdd-framework || exit $?
	cd -
# back-compat alias: the product image is now autobdd-framework
autobdd-image: autobdd-framework
autobdd-framework-test:
	cd test-projects/autobdd-framework-test && \
	make docker-run jobs="clean e2e-test cypress-test jest-test pytest-test k6-test" || exit $?
	cd -
autobdd-bash:
	cd .docker && make autobdd-run-bash || exit $?
autobdd-up:
	cd .docker && make autobdd-up || exit $?
autobdd-logs:
	cd .docker && make autobdd-logs || exit $?
autobdd-logs-f:
	cd .docker && make autobdd-logs-f || exit $?
autobdd-ssh:
	ssh-keygen -f "$${HOME}/.ssh/known_hosts" -R "[localhost]:2222"
	ssh $$USER@localhost -p 2222 || exit $?
autobdd-down:
	cd .docker && make autobdd-down || exit $?
autobdd-push:
	cd .docker && make autobdd-push || exit $?
autobdd-pull:
	cd .docker && make autobdd-pull || exit $?
