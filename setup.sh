#!/bin/sh

### プロジェクトをセットアップするスクリプト
###   $ ./setup.sh
###

DIR=$(dirname "$0")

## フックスクリプトにシンボリックリンクをはる

PRE_COMMIT_HOOK=$DIR/.git/hooks/pre-commit
ln -s -f ../../hooks/pre-commit "$PRE_COMMIT_HOOK"
