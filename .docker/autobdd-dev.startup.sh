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
    sed -i "s|%USER%|$USER|" /etc/supervisor/conf.d/supervisord.conf
    sed -i "s|%HOME%|$HOME|" /etc/supervisor/conf.d/supervisord.conf
    echo "$USER:$PASSWORD" | chpasswd
    unset PASSWORD

    # HOME
    # cd /root && tar cf - ./Projects/AutoBDD/node_modules | (cd $HOME && tar xf -)
    tar_dir="./Projects/AutoBDD/node_modules"
    parallel "tar -cf - ${tar_dir}/{} | (cd $HOME && tar xf -)" ::: "$(ls -A1 ${tar_dir})"
    cp -r /root/{.gtkrc-2.0,.asoundrc} ${HOME}
    [ -d "/dev/snd" ] && chgrp -R adm /dev/snd
    # prepare sshd
    mkdir -p /run/sshd
    mkdir -p $HOME/Projects
    mkdir -p $HOME/.config/pcmanfm/LXDE/
    ln -sf /usr/local/share/doro-lxde-wallpapers/desktop-items-0.conf $HOME/.config/pcmanfm/LXDE/
    if [ "$HOSTOS" == "Linux" ]; then
    chown -R $USERID:$GROUPID $HOME
    else
    chown -R $USER:$USER $HOME
    fi
    # set bash_profile
    cat /root/.bashrc >> $HOME/.bash_profile && chown $USER:$USER $HOME/.bash_profile
fi
# add display and npm settings to bash_profile
cat >> $HOME/.bash_profile << END_bash_profile
export DISPLAY=:1
npm config set script-shell /bin/bash
cd ~/Projects/AutoBDD
. .autoPathrc.sh
END_bash_profile

# start supervisord
exec /bin/tini -- /usr/local/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

