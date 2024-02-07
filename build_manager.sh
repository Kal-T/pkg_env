#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 version_number"
    exit 1
fi

manager_src_name="jobarranger-manager-$1"

# Check if the tar.gz file already exists
# if [ -f "./src/$manager_src_name.tar.gz" ]; then
#     echo "The $manager_src_name.tar.gz file already exists. Skipping compression."
#     cd ./src
# else
#     rm -rf ./src/*gz
#     # if [[ "$src_folder" != "$manager_src_name" ]]; then
#     #     mv ./src/$src_folder ./src/$manager_src_name
#     # fi
#     cd ./src
#     tar cvzf "$manager_src_name.tar.gz" $manager_src_name/
# fi


# cp -f "$manager_src_name.tar.gz" ../el8/rpmbuild/SOURCES/
# cp -f "$manager_src_name.tar.gz" ../el9/rpmbuild/SOURCES/

# end

# cd ..

# if [ $? -eq 0 ]; then
#     ./el8/build_8.sh
# else
#     echo "Return code: $?"
#     exit 69
# fi

# if [ $? -eq 0 ]; then
#     ./el9/build_9.sh
# else
#     echo "el8 failed. Return code: $?"
#     exit 69
# fi

# if [ $? -eq 0 ]; then
#     rm -rf ./exports/el8/*
#     rm -rf ./exports/el9/*

#     cp -r el8/rpmbuild/RPMS/x86_64/ ./exports/el8/
#     cp -r el9/rpmbuild/RPMS/x86_64/ ./exports/el9/
# else
#     echo "el9 failed. Return code: $?"
# fi

if [ -d "./src/$manager_src_name" ]; then
    cp -R ./src/$manager_src_name/* ./debian/11/pkgbuild/manager/src/
else
    echo "There is no source in $manager_src_name directory. Cannot copy for manager source file."
fi

if [ $? -eq 0 ]; then
    ./debian/11/build_manager.sh
else
    echo "debian11 failed. Return code: $?"
    exit 69
fi

if [ $? -eq 0 ]; then
    rm -rf ./exports/debian/11/*

    cp ./debian/11/pkgbuild/*.deb ./exports/debian/11/
else
    echo "Debian failed. Return code: $?"
fi