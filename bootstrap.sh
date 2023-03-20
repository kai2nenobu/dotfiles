#!/bin/bash

### 環境をセットアップするスクリプト
### なるべくいろんな環境をセットアップするスクリプトにしたいところ。

HERE=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)

"${HERE}/.bootstrap/ansible.sh"
