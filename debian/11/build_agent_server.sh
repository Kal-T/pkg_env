#!/bin/bash

docker exec -it --user dat rpm_env_debian11 chown -R dat.dat /home/dat/pkgbuild/
docker exec -it --user dat rpm_env_debian11 ./home/dat/pkgbuild/build/agent_server_build.sh

