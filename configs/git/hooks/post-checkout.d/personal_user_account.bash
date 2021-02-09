#!/bin/bash

## Configure personal account when a personal repository is cloned.
##
## $1: the ref of the previous HEAD
## $2: the ref of the new HEAD (which may or may not have changed)
## $3: a flag indicating whether the checkout was a branch checkout (changing branches, flag=1)
##     or a file checkout (retrieving a file from the index, flag=0)
##

CURRENT_DIR=$(dirname "$(readlink -e "$0")")

# shellcheck source=../utils.bash
. "${CURRENT_DIR}/../utils.bash"

MY_NAME='Tsunenobu Kai'
MY_EMAIL='kai2nenobu@gmail.com'
PERSONAL_REPOS='(github\.com|gitlab\.com|gitlab\.kaichan\.info)'
NULLSHA=0000000000000000000000000000000000000000

is_personal_repo() {
  # Check remote repository is a personal or not
  git remote get-url origin | grep -E "$PERSONAL_REPOS" &> /dev/null
}

prev_sha=$1
if [ "$prev_sha" != "$NULLSHA" ]; then
  # This checkout is not "git clone"
  exit 0
fi

if is_personal_repo; then
  name=$(git config user.name)
  if [ "$name" != "$MY_NAME" ]; then
    log "Change user.name to $MY_EMAIL"
    git config user.name "$MY_NAME"
  fi

  email=$(git config user.email)
  if [ "$email" != "$MY_EMAIL" ]; then
    log "Change user.email to $MY_EMAIL"
    git config user.email "$MY_EMAIL"
  fi
fi
