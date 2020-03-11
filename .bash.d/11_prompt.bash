function _prompt_exit_code() {
  local last_exit_code=$?
  if [ $last_exit_code -eq 0 ]; then
    echo ''
  else
    echo "<$last_exit_code>"
  fi
}

if ! type __git_ps1 &> /dev/null; then
  git_prompt='/c/Program Files/Git/etc/profile.d/git-prompt.sh'
  if [ -f "$git_prompt" ]; then
    . "$git_prompt"
  else
    function __git_ps1() {
      : # 空実装
    }
  fi
fi

PS1='\[\033[01;32m\]\u@\h\[\033[00m\]\[\033[1;31m\]`_prompt_exit_code`\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\[\033[1;33m\]`__git_ps1`\[\033[00m\]\n\$ '
