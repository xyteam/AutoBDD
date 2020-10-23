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

# add npm settings to bash_profile
cat >> $HOME/.bash_profile << END_bash_profile
npm config set script-shell /bin/bash
END_bash_profile
chown $USER:$USER $HOME/.bash_profile

# run test by taking autorun.py parameters
sudo -E su $USER -m -s /bin/bash -c "cd $HOME/Projects/AutoBDD && . .autoPathrc.sh && ./framework/scripts/autorunner.py $@"

