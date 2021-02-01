install-docker:
	@echo make $@
	sudo apt update -y
	sudo apt install -y docker.io docker-compose
	sudo usermod -aG docker $$USER
	newgrp docker
autobdd-ubuntu:
	@echo make $@
	docker-compose build --compress --force-rm --parallel autobdd-ubuntu
autobdd-nodejs:
	@echo make $@
	docker-compose build --compress --force-rm --parallel autobdd-nodejs
autobdd-image:
	@echo make $@
	docker-compose build --compress --force-rm --parallel autobdd
autobdd-run-bash:
	@echo make $@
	docker-compose run --rm autobdd-run "/bin/bash"
autobdd-up:
	@echo make $@
	docker-compose up -d autobdd-dev
autobdd-down:
	@echo make $@
	docker-compose down
autobdd-push:
	@echo make $@
	docker-compose push
autobdd-pull:
	@echo make $@
	docker-compose pull
