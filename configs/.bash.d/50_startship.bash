if ! _find_command starship; then
  _log "Not found 'starship' in PATH" && return
fi

eval "$(starship init bash)"
