# assig framework path
export FrameworkPath=$(pwd)
PATH=${PATH}:${FrameworkPath}/framework/scripts

# strip all node_modules/.bin in PATH
PATH=$(echo "${PATH//:/$'\n'}" | grep -v node_modules\/.bin | paste -sd ":" -)

# assign current node_modules/.bin to PATH
if [ -f ./node_modules/.bin/npm-path ]; then
  export PATH=$(./node_modules/.bin/npm-path)
fi
