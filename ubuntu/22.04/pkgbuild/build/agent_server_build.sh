#!/usr/bin/expect -f

# Set variables
set password "password"

# Change directory and run sudo dpkg-buildpackage for agent-server
spawn sh -c "cd /home/dat/pkgbuild/agent-server/ && sudo dpkg-buildpackage -b -uc -us"
expect "Password:"
send "$password\r"

interact
