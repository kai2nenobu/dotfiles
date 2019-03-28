# -*- mode: sh -*-

bindkey -e  # Enable emacs key bind

## enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
fi

## Load bash aliases
if [ -e "${HOME}/.bash_aliases" ]; then
  source "${HOME}/.bash_aliases"
fi

## Configure prompt
if [ -e "${HOME}/.zsh.d/prompt.sh" ]; then
  source "${HOME}/.zsh.d/prompt.sh"
fi
