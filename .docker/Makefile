install-docker:
	@echo make $@
	sudo apt update -y
	sudo apt install -y docker.io docker compose
	sudo usermod -aG docker $$USER
	newgrp docker

# autobdd-base: L0 (OS + essentials) + L0 (X display + desktop) + L1 (screen engine)
autobdd-base:
	@echo make $@
	docker compose build autobdd-base

# autobdd-framework: the product (base + L2: Chrome/chromedriver, Node, wdio, cucumber, AutoBDD)
autobdd-framework:
	@echo make $@
	docker compose build autobdd-framework

# back-compat target name
autobdd-image: autobdd-framework

autobdd-run-bash:
	@echo make $@
	docker compose run --rm autobdd-run "/bin/bash"

autobdd-up:
	@echo make $@
	docker compose up -d autobdd-dev

autobdd-logs:
	@echo make $@
	docker compose logs autobdd-dev

autobdd-logs-f:
	@echo make $@
	docker compose logs -f autobdd-dev

autobdd-down:
	@echo make $@
	docker compose down

# push autobdd-base + autobdd-framework, and the deprecated alias autobdd (= framework)
autobdd-push:
	@echo make $@
	docker compose push autobdd-base
	docker compose push autobdd-framework
	docker tag xyteam/autobdd-framework:${AUTOBDD_VERSION} xyteam/autobdd:${AUTOBDD_VERSION}
	docker push xyteam/autobdd:${AUTOBDD_VERSION}

autobdd-pull:
	@echo make $@
	docker compose pull
