#!/bin/bash

docker exec -it --user root rpm_env_rhel8 chown -R dat.dat /home/dat/rpmbuild/
# docker exec -it --user dat rpm_env_rhel8 rpmbuild -ba /home/dat/rpmbuild/SPECS/jobarranger8.spec
docker exec -it --user dat rpm_env_rhel8 rpmbuild -ba /home/dat/rpmbuild/SPECS/jobarranger-manager.spec