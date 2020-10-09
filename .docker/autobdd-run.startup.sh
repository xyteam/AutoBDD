#!/bin/bash

USER=${USER:-root}
HOME=/root
if [ "$USER" != "root" ]; then
    echo "* enable custom user: $USER"
    if [ "$HOSTOS" == "Linux" ]; then
        useradd --uid $USERID --gid $GROUPID --create-home --shell /bin/bash --groups adm,sudo $USER
    else
        useradd --create-home --shell /bin/bash --user-group --groups adm,sudo $USER
    fi
    if [ -z "$PASSWORD" ]; then
        echo "  set default password to \"ubuntu\""
        PASSWORD=ubuntu
    fi
    export HOME=/home/$USER
    echo "$USER:$PASSWORD" | chpasswd
    cp -r /root/{.gtkrc-2.0,.asoundrc} ${HOME}
    [ -d "/dev/snd" ] && chgrp -R adm /dev/snd
    unset PASSWORD
    # home folder
    cd /root && tar cf - ./Projects | (cd $HOME && tar xf -)
    # update file permission inside docer
    if [ "$HOSTOS" == "Linux" ]; then
      chown -R $USERID:$GROUPID $HOME
    else
      chown -R $USER:$USER $HOME
    fi
    # set bash_profile
    cat /root/.bashrc >> $HOME/.bash_profile && chown $USER:$USER $HOME/.bash_profile
fi
# add npm settings to bash_profile
cat >> $HOME/.bash_profile << END_bash_profile
npm config set script-shell /bin/bash
END_bash_profile

# run test by taking autorun.py parameters
sudo -E su $USER -lm -s /bin/bash -c "cd $HOME/Projects/AutoBDD && . .autoPathrc.sh && ./framework/scripts/autorunner.py $@"

