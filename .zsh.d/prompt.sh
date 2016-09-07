setopt prompt_subst

export _prompt_user_host='%B%F{green}%n@%m%f%b'
export _prompt_pwd='%B%F{blue}%~%f%b'

export _prompt_vcs_branch
function _precmd_vcs_branch {
  if git rev-parse --abbrev-ref HEAD &> /dev/null; then
    _prompt_vcs_branch=" %F{green}($(git rev-parse --abbrev-ref HEAD))%f"
  elif svn info . &> /dev/null; then # svn command not found, or not in working copy
    local branch=$(svn info . | grep Relative | grep -E -o '\^/([^/]+/)*(trunk|branches/[^/]+)')
    if [ $? -eq 0 ]; then
      _prompt_vcs_branch=" %F{green}($branch)%f"
    else
      _prompt_vcs_branch=''
    fi
  else
    _prompt_vcs_branch=''
  fi
}

export _prompt_return_code
function _precmd_return_code {
  if [ $? -ne 0 ]; then
    _prompt_return_code="%F{red}<%?>%f"
  else
    _prompt_return_code=''
  fi
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd _precmd_vcs_branch
add-zsh-hook precmd _precmd_return_code

PROMPT='${_prompt_user_host}${_prompt_return_code}$ '
RPROMPT='[${_prompt_pwd}${_prompt_vcs_branch}]'
