#!/bin/bash

docker exec -it --user root rpm_env_amzn2 chown -R dat.dat /home/dat/rpmbuild/
docker exec -it --user dat rpm_env_amzn2 rpmbuild -ba /home/dat/rpmbuild/SPECS/jobarranger.spec
docker exec -it --user dat rpm_env_amzn2 rpmbuild -ba /home/dat/rpmbuild/SPECS/jobarranger-manager.spec

