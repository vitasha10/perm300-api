# Всё написано в основном репозитории - репозитории фронта - [https://github.com/vitasha10/perm300-frontend](https://github.com/vitasha10/perm300-frontend)

## Getting Started

* VPS 2 cpu, 4 ram, nvme (for all, not only for that repository)
* Ubuntu 22.04
* Install Docker. [Instruction](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04)
* SSH VPS: ```docker network create -d bridge network-perm300```
* Database:
```
docker run -d --name perm300api-postgres \
        -p 3051:5432 \
        -e POSTGRES_USER=perm300 \
        -e POSTGRES_DB=perm300 \
        -e POSTGRES_PASSWORD=perm300 \
        -v  "$PWD/newApi/dbData":/var/lib/postgresql/data \
        --network network-perm300 \
        --restart unless-stopped \
        postgres:15
```
* [GitHub this rep](https://github.com/VWperm/dialog-with-manager) => Settings => Secrets and variables => Actions
* Change ```DEPLOY_HOST```, ```DEPLOY_PASS```, ```DEPLOY_USER``` to new VPS.
* [GitHub this rep](https://github.com/VWperm/dialog-with-manager) => Actions => CI (left bar) => Run workflow => Run workflow \
  Or use command to run without actions:
```
docker build . --tag perm300api:latest
docker stop perm300api || true  && docker rm perm300api || true
docker run -p 3050:4000 -d --name=perm300api  --network network-perm300 --restart unless-stopped perm300api:latest
```
* [GitHub this rep](https://github.com/VWperm/dialog-with-manager) => Actions => last action
* Wait or open. If in 2-3 minutes become green => Success!
* Go to ```http://{new-host-ip}:3050/```
* If working go to ssh vps
* **If error with Database go below to Questions paragraph**
* Move ssl certificates form previous VPS to ```/root/perm300.crt``` and ```/root/perm300.key```
* [Install Nginx](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04)
* Create config:
```
sudo nano /etc/nginx/sites-available/perm300.tech.conf
```