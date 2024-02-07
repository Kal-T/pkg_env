#!/usr/bin/expect -f

# Set variables
set password "password"

# Change directory and run sudo dpkg-buildpackage for manager
spawn sh -c "cd /home/dat/pkgbuild/manager/ && sudo dpkg-buildpackage -b -uc -us"
expect "Password:"
send "$password\r"

interact
