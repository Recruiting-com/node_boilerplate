BIN = ./node_modules/.bin
package_name = node_boilerplate
tarball_name = $(package_name).tar.gz
temp_directory = /tmp/builds/jobing
application_path = ~/www/jobing
project_path = .
src_path = $(project_path)/src
dist_path = $(project_path)/dist
server_name = $(env_server_name)
server_user = $(env_server_user)
ssh = ssh $(server_user)@$(server_name)

test:
	npm test

install:
	npm install

build:
	mkdir -p $(dist_path)
	rsync -av --progress $(src_path)/* $(dist_path)
	NODE_ENV=production $(BIN)/node-sass ./src/public/scss -o ./dist/public/dist/css --output-style compressed
	NODE_ENV=production $(BIN)/webpack

dev:
	rm -rf $(dist_path)
	$(BIN)/pm2 kill
	NODE_ENV=dev $(BIN)/node-sass ./src/public/scss -o ./src/public/dist/css
	$(BIN)/pm2 flush
	NODE_ENV=dev $(BIN)/pm2 startOrRestart ./services/pm2_dev_config.json
	foreman start -f ./services/Procfile_dev

run_remote_server_install_and_run:
	$(ssh) 'source ~/.profile; cd $(application_path)/$(package_name) && npm install --production'
	$(ssh) 'source ~/.profile; cd $(application_path)/$(package_name) && NODE_ENV=production npm run prod'

deploy:
	make install
	make build
	make test
	mkdir -p $(temp_directory)
	tar --exclude='.git' --exclude='Makefile' --exclude='./src' --exclude='./node_modules' -zcvf $(temp_directory)/$(tarball_name) $(project_path)/*
	$(ssh) 'rm -rf $(application_path)/$(tarball_name) $(application_path)/$(package_name)'
	scp -rp $(temp_directory)/$(tarball_name) $(server_user)@$(server_name):$(application_path)
	$(ssh) 'mkdir -p $(application_path)/$(package_name)'
	$(ssh) 'tar -C $(application_path)/$(package_name) -xvf $(application_path)/$(tarball_name)'
	make run_remote_server_install_and_run

test_prod_build:
	NODE_ENV=production $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --json | $(BIN)/analyze-bundle-size
