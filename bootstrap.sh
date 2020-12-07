#!/bin/bash

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

HERE=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)

sh "${HERE}/.bootstrap/ansible.sh"

if [ -n "$CODESPACES" ]; then
  # shellcheck source=./.bootstrap/codespace.bash
  source "${HERE}/.bootstrap/codespace.bash"
fi
