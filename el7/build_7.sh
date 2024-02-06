#!/bin/bash

docker exec -it --user root rpm_env_rhel7 chown -R moon.moon /home/moon/rpmbuild/
docker exec -it --user moon rpm_env_rhel7 ./tmp/build_7.sh
