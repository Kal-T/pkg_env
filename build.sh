#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 version_number"
    exit 1
fi

src_name="jobarranger-$1"

folder="./src"
for file_path in "$folder"/*; do
    src_folder=$(basename "$file_path")    
done

# # Check if the tar.gz file already exists
# if [ -f "./src/$src_name.tar.gz" ]; then
#     echo "The $src_name.tar.gz file already exists. Skipping compression."
#     cd ./src
# else
#     rm -rf ./src/*gz
#     # if [[ "$src_folder" != "$src_name" ]]; then
#     #     mv ./src/$src_folder ./src/$src_name
#     # fi
#     cd ./src
#     tar cvzf "$src_name.tar.gz" $src_name/
# fi

# cp -f "$src_name.tar.gz" ../el6/rpmbuild/SOURCES/
# cp -f "$src_name.tar.gz" ../el7/rpmbuild/SOURCES/
# cp -f "$src_name.tar.gz" ../el8/rpmbuild/SOURCES/
# cp -f "$src_name.tar.gz" ../el9/rpmbuild/SOURCES/


# cd ..

# if [ $? -eq 0 ]; then
#     ./el6/build_6.sh
# else
#     echo "file copy failed. Return code: $?"
#     exit 1
# fi

# if [ $? -eq 0 ]; then
#     ./el7/build_7.sh
# else
#     echo "el6 failed. Return code: $?"
#     exit 1
# fi

# if [ $? -eq 0 ]; then
#     ./el8/build_8.sh
# else
#     echo "el7 failed. Return code: $?"
#     exit 69
# fi

# if [ $? -eq 0 ]; then
#     ./el9/build_9.sh
# else
#     echo "el8 failed. Return code: $?"
#     exit 69
# fi

# if [ $? -eq 0 ]; then
#     rm -rf ./exports/el6/*
#     rm -rf ./exports/el7/*
#     rm -rf ./exports/el8/*
#     rm -rf ./exports/el9/*

#     cp -r el6/rpmbuild/RPMS/x86_64/ ./exports/el6/
#     cp -r el7/rpmbuild/RPMS/x86_64/ ./exports/el7/
#     cp -r el8/rpmbuild/RPMS/x86_64/ ./exports/el8/
#     cp -r el9/rpmbuild/RPMS/x86_64/ ./exports/el9/
# else
#     echo "el9 failed. Return code: $?"
# fi

echo "Debian installer package creation start..."
if [ -d "./src/$src_name" ]; then
    cp -R "./src/$src_name"/* ./debian/11/pkgbuild/agent-server/
    cp -R "./src/$src_name"/* ./ubuntu/22.04/pkgbuild/agent-server/
else
    echo "Folder $src_name does not exist. Cannot copy for agent-server source file."
fi

if [ $? -eq 0 ]; then
    ./debian/11/build_agent_server.sh
else
    echo "debian11 failed. Return code: $?"
    exit 69
fi

if [ $? -eq 0 ]; then
    ./ubuntu/22.04/build_agent_server.sh
else
    echo "ubuntu22.04 failed. Return code: $?"
    exit 69
fi

if [ $? -eq 0 ]; then
    rm -rf ./exports/debian/11/*
    rm -rf ./exports/ubuntu/22.04/*

    cp ./debian/11/pkgbuild/*.deb ./exports/debian/11/
    cp ./ubuntu/22.04/pkgbuild/*.deb ./exports/ubuntu/22.04/
else
    echo "Build failed. Return code: $?"
fi