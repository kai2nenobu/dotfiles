## Globally ignored rule
# shellcheck disable=SC2155

if ! _find_command navi; then
  _log "Not found 'navi' in PATH" && return
fi

## Copy from $(navi widget bash)
_navi_call() {
    local result="$(navi "$@" </dev/tty)"
    if [ -z "${result}" ]; then
        result="$(navi --print </dev/tty)"
    fi
    printf "%s" "$result"
}

_navi_widget() {
    local -r input="${READLINE_LINE}"
    local -r last_command="$(echo "${input}" | navi fn widget::last_command)"

    if [ -z "${last_command}" ]; then
        local -r output="$(_navi_call --print --fzf-overrides '--no-select-1')"
    else
        local -r find="$last_command"
        local -r replacement="$(_navi_call --print --query "${last_command}")"
        local -r output="${input//$find/$replacement}"
    fi

    READLINE_LINE="$output"
    READLINE_POINT=${#READLINE_LINE}
}

bind -x '"\C-x\C-n": _navi_widget'
