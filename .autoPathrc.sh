# assig framework path
export FrameworkPath=$(pwd)
PATH=${PATH}:${FrameworkPath}/framework/scripts

# assign current node_modules/.bin to PATH
if [ -f ./node_modules/.bin/npm-path ]; then
  export PATH=$(./node_modules/.bin/npm-path)
fi
