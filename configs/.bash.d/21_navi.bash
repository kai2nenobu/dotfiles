## Globally ignored rule
# shellcheck disable=SC2155

if ! _find_command navi; then
  _log "Not found 'navi' in PATH" && return
fi

## naviで選択したスニペットをコマンドラインに挿入する
_navi_snippet() {
  declare l=$(navi --print)
  READLINE_LINE="$l"
  READLINE_POINT=${#l}
}
bind -x '"\C-x\C-n": _navi_snippet'
