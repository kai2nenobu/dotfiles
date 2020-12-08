#!/bin/bash

set -eu

win_ssh=$(wslpath -ua "$(wslvar USERPROFILE)")/.ssh
wsl_ssh=~/.ssh

find "$win_ssh" -name '*config' | \
  while read -r config; do
    # shellcheck disable=SC2001  # 変数展開はむずいのでsed使ってます
    relative_path=$(echo "$config" | sed 's@^.*/\.ssh/\(.*\)$@\1@')
    target_config=$wsl_ssh/$relative_path
    parent_dir=${target_config%/*}
    if [ ! -e "$parent_dir" ]; then
      mkdir "$parent_dir" && chmod 700 "$parent_dir"
    fi
    # shellcheck disable=SC2016  # '$WSL_GATEWAY' は意図的なやつです
    sed -e 's@C:/Windows/System32/OpenSSH/connect\.exe@connect@g' \
        -e 's@ssh\.exe@ssh@g'\
        -e 's@C:/Users/@/mnt/c/Users/@g' \
        -e 's@localhost:8888@$WSL_GATEWAY:8888@g' \
        "$config" > "$target_config"
    chmod 600 "$target_config"
  done
