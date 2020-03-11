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

PS1=''
PS1="$PS1"'\[\033[01;32m\]'       # GREEN
PS1="$PS1"'\u@\h'                 # user@host
PS1="$PS1"'\[\033[1;31m\]'        # RED
PS1="$PS1"'`_prompt_exit_code`'   # <exit code>
PS1="$PS1"'\[\033[00m\]'          # RESET COLOR
PS1="$PS1"':'                     # :
PS1="$PS1"'\[\033[01;34m\]'       # BLUE
PS1="$PS1"'\w'                    # current working directory
PS1="$PS1"'\[\033[1;33m\]'        # YELLOW
PS1="$PS1"'`__git_ps1`'           # git info (if available)
PS1="$PS1"'\[\033[00m\]'          # RESET COLOR
PS1="$PS1"'\n\$ '                 # newline and $
