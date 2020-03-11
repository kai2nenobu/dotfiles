if ! _find_command fzf; then
  _log "Not found 'fzf' in PATH" && return
fi

fzf_history() {
  declare l=$(HISTTIMEFORMAT=  history | tac |  awk '{for(i=2;i<NF;i++){printf("%s%s",$i,OFS=" ")}print $NF}' | fzf --query "$READLINE_LINE" --prompt 'Choose history: ' --no-sort -0 -1)
  READLINE_LINE="$l"
  READLINE_POINT=${#l}
}
bind -x '"\C-r": fzf_history'

fzf_cd_recursive() {
  cd "$(find -name '.git' -prune -o -type d -printf '%P\n' | fzf --prompt 'Choose directory: ' -0 -1)"
}
bind -x '"\C-x\C-d": fzf_cd_recursive'

if [ -n "$CMDER_USER_CONFIG" ]; then
  fzf_cmder_history() {
    declare l=$(cat "${CMDER_USER_CONFIG}/.history" | fzf --tac --query "$READLINE_LINE" --prompt 'Choose history: ' --no-sort -0 -1)
    READLINE_LINE="$l"
    READLINE_POINT=${#l}
  }
  bind -x '"\C-x\C-r": fzf_cmder_history'
fi
