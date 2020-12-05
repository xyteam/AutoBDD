install:
	sudo apt update
	sudo apt install docker.io docker-compose
	sudo groupadd docker
	sudo usermod -aG docker $USER
	newgrp docker
autobdd:
	docker-compose build --compress --force-rm --parallel
down:
	docker-compose down
push:
	docker-compose push
