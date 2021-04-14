HOOK_ROOT=$(dirname "$(readlink -e "$0")")
HOOK_NAME=$(basename "$0")
GIT_ROOT=$(git rev-parse --show-toplevel)

LOCAL_HOOK="${GIT_ROOT}/.git/hooks/${HOOK_NAME}"
REPO_HOOK="${GIT_ROOT}/.githooks/${HOOK_NAME}"
GLOBAL_HOOKS="${HOOK_ROOT}/${HOOK_NAME}.d"

# shellcheck source=./utils.bash
. "${HOOK_ROOT}/utils.bash"

run_local_hook() {
  if [ -x "$LOCAL_HOOK" ]; then
    debug ">> Run ${LOCAL_HOOK}"
    "$LOCAL_HOOK" "$@"
  fi
}

run_repo_hook() {
  if [ -x "$REPO_HOOK" ]; then
    debug ">> Run ${REPO_HOOK}"
    "$REPO_HOOK" "$@"
  fi
}

run_global_hooks() {
  find "$GLOBAL_HOOKS" -type f | while read -r hook; do
    if [ -x "$hook" ]; then
      debug ">> Run ${hook})"
      "$hook" "$@"
    fi
  done
}

run_local_hook "$@"
run_repo_hook "$@"
run_global_hooks "$@"
