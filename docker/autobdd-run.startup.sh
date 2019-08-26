#!/bin/bash

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
  unset PASSWORD
fi

# home folder
cd /root && tar cf - ./Projects | (cd $HOME && tar xf -)
chown -R $USER:$USER $HOME

# set bash_profile
cat /root/.bashrc >> $HOME/.bash_profile && chown $USER:$USER $HOME/.bash_profile
cat >> $HOME/.bash_profile << END_bash_profile
npm config set script-shell /bin/bash
END_bash_profile

# run test by taking autorun.py parameters
sudo -E su $USER -m -c "cd $HOME/Projects/AutoBDD && . .autoPathrc.sh && ./framework/scripts/autorunner.py $@"

