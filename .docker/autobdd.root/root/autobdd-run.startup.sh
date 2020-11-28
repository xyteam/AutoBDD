#!/bin/bash

USER=${USER:-root}
HOME=/root
if [ "$USER" != "root" ]; then
    # USER
    echo "* enable custom user: $USER"
    if [ "$HOSTOS" == "Linux" ]; then
        useradd --uid $USERID --gid $GROUPID --create-home --shell /bin/bash --groups adm,sudo $USER
    else
        useradd --create-home --shell /bin/bash --user-group --groups adm,sudo $USER
    fi
    export HOME=/home/$USER

    # PASSWORD
    if [ -z "$PASSWORD" ]; then
        echo "  set default password to \"ubuntu\""
        PASSWORD=ubuntu
    fi
    echo "$USER:$PASSWORD" | chpasswd
    unset PASSWORD

    # HOME
    # user dirs and files
    cd /root; tar cf - $(ls -A1 -I Projects -I .xvfb-locks .) | (cd $HOME; tar xf -)
    [ ! -d "$HOME/Projects/AutoBDD/framework" ] \
        && (echo "updating Projects/AutoBDD" && cd /root; tar -cf - Projects/AutoBDD | (cd $HOME; tar xf -)) \
        || (echo "only updating Projects/AutoBDD/node_modules" && cd /root; tar cf - Projects/AutoBDD/node_modules | (cd $HOME; tar xf -))
    # update file ownership inside docker
    if [ "$HOSTOS" == "Linux" ]; then
      chown -R $USERID:$GROUPID $HOME
    else
      chown -R $USER:$USER $HOME
    fi

    # OTHER
    [ -d "/dev/snd" ] && chgrp -R adm /dev/snd
    mkdir -p /run/sshd
fi

# set ABDD_PROJECT from .env in .bash_profile
if [[ ! -z "$ABDD_PROJECT" ]]; then
cat >> $HOME/.bash_profile <<EOL
    export ABDD_PROJECT=$ABDD_PROJECT
    cd test-projects/\$ABDD_PROJECT
    if [[ -x .abdd_startup.sh ]]; then
        . .abdd_startup.sh
    fi
    if [[ ! -z "$ABDD_STARTUP_SCRIPT" ]] && [[ -x "$ABDD_STARTUP_SCRIPT" ]]; then
        . $ABDD_STARTUP_SCRIPT
    fi
EOL
fi

sudo -EH -u $USER /bin/bash -c "cd; . .bash_profile; $@"
