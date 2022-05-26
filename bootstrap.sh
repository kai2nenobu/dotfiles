#!/bin/bash

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

HERE=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)

if [ -n "$CODESPACES" ] || [ -n "$REMOTE_CONTAINERS" ]; then
  # shellcheck source=./.bootstrap/container.bash
  source "${HERE}/.bootstrap/container.bash"
else
  sh "${HERE}/.bootstrap/ansible.sh"
fi
