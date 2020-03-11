if ! _find_command fzf; then
  _log "Not found 'fzf' in PATH" && return
fi

## 履歴を絞り込む
_fzf_history() {
  declare l=$(HISTTIMEFORMAT=  history | tac |  awk '{for(i=2;i<NF;i++){printf("%s%s",$i,OFS=" ")}print $NF}' | fzf --query "$READLINE_LINE" --prompt 'Choose history: ' --no-sort -0 -1)
  READLINE_LINE="$l"
  READLINE_POINT=${#l}
}
bind -x '"\C-r": _fzf_history'

## 作業ディレクトリの以下のディレクトリに移動する
_fzf_cd_recursive() {
  cd "$(find -name '.git' -prune -o -type d -printf '%P\n' | fzf --prompt 'Choose directory: ' -0 -1)"
}
bind -x '"\C-x\C-d": _fzf_cd_recursive'

if [ -n "$CMDER_USER_CONFIG" ]; then
  ## Cmderの履歴を絞り込む
  _fzf_cmder_history() {
    declare l=$(cat "${CMDER_USER_CONFIG}/.history" | fzf --tac --query "$READLINE_LINE" --prompt 'Choose history: ' --no-sort -0 -1)
    READLINE_LINE="$l"
    READLINE_POINT=${#l}
  }
  bind -x '"\C-x\C-r": _fzf_cmder_history'
fi

if _find_command ghq; then
  ## ghq管理下のリポジトリに移動する
  _fzf_ghq_cd() {
    declare dir=$(ghq list -p | fzf)
    if [ -n "$dir" ]; then
      cd "$dir"
    fi
  }
  bind -x '"\C-x\C-g": _fzf_ghq_cd'
fi
