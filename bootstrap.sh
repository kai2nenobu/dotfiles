#!/bin/bash

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

HERE=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)

#sh "${HERE}/.bootstrap/ansible.sh"

if [ -n "$CODESPACES" ] || [ -n "$REMOTE_CONTAINERS" ]; then
  # shellcheck source=./.bootstrap/container.bash
  source "${HERE}/.bootstrap/container.bash"
fi
