# assig framework path
export FrameworkPath=$(pwd)
PATH=${PATH}:${FrameworkPath}/framework/scripts

# assign node_modules/.bin to PATH
for dn in $(find $(pwd) -maxdepth 2 -type d -name node_modules); do
    if [[ ":$PATH:" != *":$dn/.bin:"* ]]; then PATH=${PATH}:$dn/.bin; fi
    export PATH
done

