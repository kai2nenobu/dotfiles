#!/bin/bash

set -eu

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

setup_dotter() {
  url="https://github.com/SuperCuber/dotter/releases/download/v0.12.14/dotter"
  mkdir -p ~/.local/bin
  curl -fsSL -o ~/.local/bin/dotter "$url"
  chmod 755 ~/.local/bin/dotter
  printf 'packages = ["default"]\n' > .dotter/local.toml
  dotter deploy --force
}

HERE=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)

setup_dotter
"${HERE}/.bootstrap/ansible.sh"
