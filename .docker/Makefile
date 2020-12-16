install:
	sudo apt update -y
	sudo apt install -y docker.io docker-compose
	sudo usermod -aG docker $$USER
	newgrp docker
autobdd-ubuntu:
	docker-compose build --compress --force-rm --parallel autobdd-ubuntu
autobdd-nodejs:
	docker-compose build --compress --force-rm --parallel autobdd-nodejs
autobdd-image:
	docker-compose build --compress --force-rm --parallel autobdd
autobdd-up:
	docker-compose up -d autobdd-dev
autobdd-down:
	docker-compose down
autobdd-push:
	docker-compose push
