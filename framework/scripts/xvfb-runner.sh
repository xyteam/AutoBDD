#!/bin/bash

# allow settings to be updated via environment
: "${xvfb_lockdir:=$HOME/.xvfb-locks}"
: "${xvfb_display_min:=100}"
: "${xvfb_display_max:=599}"
: "${xvfb_resolution:=1920x1200x24}"

# assuming only one user will use this, let's put the locks in our own home directory
# avoids vulnerability to symlink attacks.
mkdir -p -- "$xvfb_lockdir" || exit

i=$xvfb_display_min     # minimum display number
while (( i < xvfb_display_max )); do
  if [ -f "/tmp/.X$i-lock" ]; then                # still avoid an obvious open display
    (( ++i )); continue
  fi
  exec 5>"$xvfb_lockdir/$i" || continue           # open a lockfile
  if flock -x -n 5; then                          # try to lock it
    exec xvfb-run --server-num="$i" --server-args="-screen 0 $xvfb_resolution" "$@" || exit  # if locked, run xvfb-run
  fi
  (( i++ ))
done
