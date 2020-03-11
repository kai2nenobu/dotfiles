function _prompt_exit_code() {
  local last_exit_code=$?
  if [ $last_exit_code -eq 0 ]; then
    echo ''
  else
    echo "<$last_exit_code>"
  fi
}

PS1='\[\033[01;32m\]\u@\h\[\033[00m\]\[\033[1;31m\]`_prompt_exit_code`\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\n\$ '
