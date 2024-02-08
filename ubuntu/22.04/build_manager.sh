#!/bin/bash

docker exec -it --user dat rpm_env_ubuntu22 chown -R dat.dat /home/dat/pkgbuild/
docker exec -it --user dat rpm_env_ubuntu22 ./home/dat/pkgbuild/build/manager_build.sh

