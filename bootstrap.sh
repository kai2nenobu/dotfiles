#!/bin/bash

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

sh "${HERE}/.bootstrap/ansible.sh"

if [ -n "$CODESPACES" ]; then
  source "${HERE}/.bootstrap/codespace.bash"
fi
