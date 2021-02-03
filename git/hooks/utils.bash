debug() {
  if [ -n "${HOOK_DEBUG:-}" ]; then
    echo "$@" >&2
  fi
}

log() {
  echo "$@" >&2
}
