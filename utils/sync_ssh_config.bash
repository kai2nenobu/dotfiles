#!/bin/bash

set -eu

win_ssh=$(wslpath -ua $(wslvar USERPROFILE))/.ssh
wsl_ssh=~/.ssh

find "$win_ssh" -name '*config' | \
  while read config; do
    relative_path=$(echo "$config" | sed 's@^.*/\.ssh/\(.*\)$@\1@')
    target_config=$wsl_ssh/$relative_path
    parent_dir=${target_config%/*}
    if [ ! -e "$parent_dir" ]; then
      mkdir "$parent_dir" && chmod 700 "$parent_dir"
    fi
    sed -e 's@C:/Windows/System32/OpenSSH/connect\.exe@connect@g' \
        -e 's@ssh\.exe@ssh@g'\
        -e 's@C:/Users/@/mnt/c/Users/@g' \
        "$config" > "$target_config"
    chmod 600 "$target_config"
  done
