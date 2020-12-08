# add display and npm settings to bash_profile
export DISPLAY=:1
npm config set script-shell /bin/bash

# strip all node_modules/.bin in PATH
PATH=$(echo "${PATH//:/$'\n'}" | grep -v node_modules\/.bin | paste -sd ":" -)

cd ~/Projects/AutoBDD
. .autoPathrc.sh
