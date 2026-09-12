#!/bin/bash
# autobdd-base-test — run-container startup.
# Creates the host user inside the (base) container, then execs the command from the
# project directory. Mirrors test-projects/autobdd-framework-test/dev/autobdd-run.startup.sh but
# without the framework/node_modules refresh (the base has no framework tree).
USER=${USER:-root}
HOME=/root
if [ "$USER" != "root" ]; then
    echo "* enable custom user: $USER"
    if [ "$HOSTOS" == "Linux" ]; then
        groupadd --force --gid $GROUPID $USER
        useradd --uid $USERID --gid $GROUPID --create-home --shell /bin/bash --groups adm,sudo $USER
    else
        useradd --create-home --shell /bin/bash --user-group --groups adm,sudo $USER
    fi
    export HOME=/home/$USER

    PASSWORD=${PASSWORD:-ubuntu}
    echo "$USER:$PASSWORD" | chpasswd
    unset PASSWORD

    # bring over root's dotfiles (but never the Projects tree)
    cd /root; tar cf - $(ls -A1 -I Projects -I .xvfb-locks . 2>/dev/null) | (cd $HOME; tar xf -)

    # DEV MODE: the working tree is bind-mounted; otherwise copy the baked third_party.
    if [ "$AUTOBDD_DEV_MOUNT" != "1" ] && [ ! -d "$HOME/Projects/AutoBDD/third_party" ]; then
        echo "updating Projects/AutoBDD"
        (cd /root; tar -cf - Projects/AutoBDD | (cd $HOME; tar xf -))
    fi

    if [ "$HOSTOS" == "Linux" ]; then
      chown -R ${USERID:-0}:${GROUPID:-0} $HOME 2>/dev/null || true
    else
      chown -R $USER:$USER $HOME
    fi
    mkdir -p /run/sshd
fi

RUN_DIR="$HOME/Projects/AutoBDD/test-projects/${ABDD_PROJECT:-autobdd-base-test}"
exec sudo -EH -u "$USER" /bin/bash -c "cd '$RUN_DIR' 2>/dev/null; $*"
