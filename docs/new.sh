#!/bin/bash

### Linux向け初期セットアップスクリプト


### Functions
fetch_dotfiles() {
  DOTFIELS_URL=https://github.com/kai2nenobu/dotfiles/archive/master.tar.gz
  curl -sSL --retry 5 "$DOTFIELS_URL"
}

### Main

if [ ! -d "$HOME/dotfiles" ]; then
  fetch_dotfiles
fi

echo 'Done!'
