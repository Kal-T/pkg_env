# Procedure

Agent & Server

1 -> **compose-up.sh**(if the container is up alr, you don't need to run)<br/>
2 -> **move jobarranger source file to src and change name to jobarranger-[version number]**<br/>
3 -> **Run ./build.sh [version number]**<br/>
4 -> **exported rpms files are under /exports**<br/>

Manager

1 -> **compose-up.sh**(if the container is up alr, you don't need to run)<br/>
2 -> **move jobarranger manager source file to src and change name to jobarranger-manager-[version number]**<br/>
3 -> **Run ./build_manager.sh [version number]**<br/>
4 -> **exported rpms files are under /exports**<br/>
