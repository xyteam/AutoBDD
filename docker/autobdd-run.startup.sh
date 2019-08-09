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
  HOME=/home/$USER
  echo "$USER:$PASSWORD" | chpasswd
fi
cat /root/.bashrc >> $HOME/.bash_profile && chown $USER:$USER $HOME/.bash_profile
cd /root && tar cf - ./Projects | (cd $HOME && tar xf -) && chown -R $USER:$USER $HOME
sudo -E su $USER -m -c "cd $HOME/Projects/AutoBDD && . .autoPathrc.sh && ./framework/scripts/autorunner.py $@"

