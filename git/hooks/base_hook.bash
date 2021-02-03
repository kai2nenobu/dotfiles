HOOK_ROOT=$(dirname "$(readlink -e "$0")")
HOOK_NAME=$(basename "$0")
GIT_ROOT=$(git rev-parse --show-toplevel)

LOCAL_HOOK="${GIT_ROOT}/.git/hooks/${HOOK_NAME}"
REPO_HOOK="${GIT_ROOT}/.githooks/${HOOK_NAME}"
GLOBAL_HOOKS="${HOOK_ROOT}/${HOOK_NAME}.d"

run_local_hook() {
  if [ -x "$LOCAL_HOOK" ]; then
     "$LOCAL_HOOK" "$@"
  fi
}

run_repo_hook() {
  if [ -x "$REPO_HOOK" ]; then
     "$REPO_HOOK" "$@"
  fi
}

run_global_hooks() {
  find "$GLOBAL_HOOKS" -type f | while read -r hook; do
    if [ -x "$hook" ]; then
       "$hook" "$@"
    fi
  done
}

run_local_hook "$@"
run_repo_hook "$@"
run_global_hooks "$@"
