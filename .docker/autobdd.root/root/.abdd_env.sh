# Copy this script in your project root folder.
# This script will be run as current user inside the project folder
# when autobdd-dev and autobdd-run docker container is started.
# Write any commands need to be run as user here.
# For example:

# assign node_modules/.bin to PATH
for dn in $(find $(pwd) -maxdepth 2 -type d -name node_modules); do
    if [[ ":$PATH:" != *":$dn/.bin:"* ]]; then PATH=${PATH}:$dn/.bin; fi
    export PATH
done

# e2e-test
if [[ -d e2e-test ]]; then
    cd e2e-test;
        pip install -r requirement.txt;
        npm install;
    cd - > /dev/null;
fi

# py-test
if [[ -d py-test ]]; then
    cd py-test;
        pip install -r requirement.txt;
    cd - > /dev/null;
fi