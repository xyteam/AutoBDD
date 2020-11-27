#!/bin/bash

if [ -n "$VNC_PASSWORD" ]; then
    echo -n "$VNC_PASSWORD" > /.password1
    x11vnc -storepasswd $(cat /.password1) /.password2
    chmod 400 /.password*
    sed -i 's/^command=x11vnc.*/& -rfbauth \/.password2/' /etc/supervisor/conf.d/supervisord.conf
    unset VNC_PASSWORD
fi

if [ -n "$X11VNC_ARGS" ]; then
    sed -i "s/^command=x11vnc.*/& ${X11VNC_ARGS}/" /etc/supervisor/conf.d/supervisord.conf
fi

if [ -n "$OPENBOX_ARGS" ]; then
    sed -i "s#^command=/usr/bin/openbox.*#& ${OPENBOX_ARGS}#" /etc/supervisor/conf.d/supervisord.conf
fi

if [ -n "$RESOLUTION" ]; then
    sed -i "s/1024x768x16/$RESOLUTION/" /usr/local/bin/xvfb.sh
fi

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
    mkdir -p $HOME/.config/pcmanfm/LXDE/
    ln -sf /usr/local/share/doro-lxde-wallpapers/desktop-items-0.conf $HOME/.config/pcmanfm/LXDE/
    # update file ownership inside docker
    if [ "$HOSTOS" == "Linux" ]; then
      chown -R $USERID:$GROUPID $HOME
    else
      chown -R $USER:$USER $HOME
    fi

    # OTHER
    sed -i "s|%USER%|$USER|" /etc/supervisor/conf.d/supervisord.conf
    sed -i "s|%HOME%|$HOME|" /etc/supervisor/conf.d/supervisord.conf
    [ -d "/dev/snd" ] && chgrp -R adm /dev/snd
    mkdir -p /run/sshd
fi

# set ABDD_PROJECT from .env in .bash_profile
if [[ ! -z "$ABDD_PROJECT" ]]; then
cat >> $HOME/.bash_profile <<EOL
    export ABDD_PROJECT=$ABDD_PROJECT
    cd test-projects/\$ABDD_PROJECT
EOL
fi

# start supervisord
exec /bin/tini -- /usr/local/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

