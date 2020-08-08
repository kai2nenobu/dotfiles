#!/bin/bash

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ -n "$CODESPACES" ]; then
  source "${HERE}/.bootstrap/codespace.bash"
fi
