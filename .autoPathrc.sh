# assig framework path
export FrameworkPath=$(pwd)

# strip all node_modules/.bin in PATH
PATH=$(echo "${PATH//:/$'\n'}" | grep -v node_modules\/.bin | paste -sd ":" -)

# assign current node_modules/.bin to PATH
if [ -f ./node_modules/.bin/npm-path ]; then
  export PATH=$(./node_modules/.bin/npm-path)
fi

# create command alias to sync between src and run env
alias spr="rsync --archive --exclude .git/ --exclude node_modules/ $HOME/Projects/AutoBDD $HOME/Projects/xySikulixApi $HOME/Run"
alias srp="rsync --archive --exclude .git/ --exclude node_modules/ $HOME/Run $HOME/Projects"