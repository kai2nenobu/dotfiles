if ! _find_command pyenv; then
  _log "Not found 'pyenv' in PATH" && return
fi

eval "$(pyenv init -)"
