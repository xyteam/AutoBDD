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
    sed -i "s/1024x768/$RESOLUTION/" /usr/local/bin/xvfb.sh
fi

USER=${USER:-root}
HOME=/root
if [ "$USER" != "root" ]; then
    echo "* enable custom user: $USER"
    useradd --create-home --shell /bin/bash --user-group --groups adm,sudo $USER
    if [ -z "$PASSWORD" ]; then
        echo "  set default password to \"ubuntu\""
        PASSWORD=ubuntu
    fi
    export HOME=/home/$USER
    echo "$USER:$PASSWORD" | chpasswd
    cp -r /root/{.gtkrc-2.0,.asoundrc} ${HOME}
    [ -d "/dev/snd" ] && chgrp -R adm /dev/snd
    unset PASSWORD
fi
sed -i "s|%USER%|$USER|" /etc/supervisor/conf.d/supervisord.conf
sed -i "s|%HOME%|$HOME|" /etc/supervisor/conf.d/supervisord.conf

# prepare sshd
mkdir -p /run/sshd

# home folder
mkdir -p $HOME/.config/pcmanfm/LXDE/
ln -sf /usr/local/share/doro-lxde-wallpapers/desktop-items-0.conf $HOME/.config/pcmanfm/LXDE/
chown -R $USER:$USER $HOME

# set bash_profile
cat /root/.bashrc >> $HOME/.bash_profile && chown $USER:$USER $HOME/.bash_profile
cat >> $HOME/.bash_profile << END_bash_profile
npm config set script-shell /bin/bash
export DISPLAY=:1
cd $HOME/Projects/AutoBDD && \
source .autoPathrc.sh
END_bash_profile

# start supervisord
exec /bin/tini -- /usr/local/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

