#!/bin/bash

set -euC

### Linux向け初期セットアップスクリプト


### Functions
fetch_dotfiles() {
  dotfiels_url=https://github.com/kai2nenobu/dotfiles/archive/master.tar.gz
  dotfiles_dir="$HOME/dotfiles"
  mkdir -p "$dotfiles_dir"
  curl -sSL --retry 5 "$dotfiels_url" | \
    tar xzf - --strip-component=1 --directory="$dotfiles_dir"
}

### Main

if [ ! -d "$HOME/dotfiles" ]; then
  fetch_dotfiles
fi

echo 'Done!'
