#!/bin/bash

docker exec -it --user root rpm_env_rhel6 chown -R moon.moon /home/moon/rpmbuild/
docker exec -it --user moon rpm_env_rhel6 ./tmp/low_build_6.sh
