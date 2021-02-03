#!/bin/sh

set -eu

exec 1>&2

if command -v git-secrets > /dev/null 2>&1; then
  echo '>> Run git secrets'
  git secrets --pre_commit_hook -- "$@"
fi
