
function fzy_select_history() {
  local tac
  local SELECTED
  exists gtac && tac="gtac" || { exists tac && tac="tac" || { tac="tail -r" } }
  SELECTED=$(history -n 1 | eval $tac | fzy --query "$LBUFFER")
  if [ $? -ne 0 ]; then       # When percol fails
    zle -R -c               # refresh
    return 1
  fi
  BUFFER=$SELECTED
  CURSOR=$#BUFFER         # move cursor
  zle -R -c               # refresh
}
zle -N fzy_select_history
bindkey '^R' fzy_select_history
