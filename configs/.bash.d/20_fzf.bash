## Globally ignored rule
# shellcheck disable=SC2155

if ! _find_command fzf; then
  _log "Not found 'fzf' in PATH" && return
fi

if _is_windows && ! _inside_windows_terminal; then
  _log "Terminal is not Windows Terminal. Not use fzf" && return
fi

## 履歴を絞り込む
_fzf_history() {
  declare l=$(HISTTIMEFORMAT='' history | tac |  awk '{for(i=2;i<NF;i++){printf("%s%s",$i,OFS=" ")}print $NF}' | fzf --query "$READLINE_LINE" --prompt 'Choose history: ' --no-sort -0 -1)
  READLINE_LINE="$l"
  READLINE_POINT=${#l}
}
bind -x '"\C-r": _fzf_history'

## 作業ディレクトリの以下のディレクトリに移動する
_fzf_cd_recursive() {
  cd "$(find . -name '.git' -prune -o -type d -printf '%P\n' | fzf --prompt 'Choose directory: ' -0 -1)" || return
}
bind -x '"\C-x\C-d": _fzf_cd_recursive'

## 作業ディレクトリの以下のファイルを補完する
_fzf_complete_file() {
  local find_cli
  if _find_command fd; then
    find_cli='fd --path-separator /'
  else
    find_cli='find'
  fi
  declare file=$(MSYS2_ARG_CONV_EXCL="*" ${find_cli} | fzf --prompt 'Choose file: ' --no-sort -0 -1)
  READLINE_LINE="$READLINE_LINE$file"
  READLINE_POINT=${#READLINE_LINE}
}
bind -x '"\C-x\C-f": _fzf_complete_file'

if [ -n "$CMDER_USER_CONFIG" ]; then
  ## Cmderの履歴を絞り込む
  _fzf_cmder_history() {
    declare l=$(fzf --tac --query "$READLINE_LINE" --prompt 'Choose history: ' --no-sort -0 -1 < "${CMDER_USER_CONFIG}/.history")
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
      cd "$dir" || return
    fi
  }
  bind -x '"\C-x\C-g": _fzf_ghq_cd'
fi

export FZF_DEFAULT_OPTS="--exact --reverse --inline-info \
  --bind ctrl-k:kill-line,ctrl-m:accept,ctrl-v:page-down,alt-v:page-up,ctrl-space:toggle+down"
