# don't put duplicate lines in the history. See bash(1) for more options
# don't overwrite GNU Midnight Commander's setting of `ignorespace'.
HISTCONTROL=$HISTCONTROL${HISTCONTROL+,}ignoredups
# ... or force ignoredups and ignorespace
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=100000                  # myown

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "$debian_chroot" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\n\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\n\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if [ -f /etc/bash_completion ] && ! shopt -oq posix; then
    . /etc/bash_completion
fi

## peco integration
if which peco &> /dev/null && [ -n "$ConEmuBuild" ]; then
  peco_history() {
    declare l=$(HISTTIMEFORMAT=  history | tac |  awk '{for(i=2;i<NF;i++){printf("%s%s",$i,OFS=" ")}print $NF}'   |  peco --query "$READLINE_LINE")
    READLINE_LINE="$l"
    READLINE_POINT=${#l}
  }
  bind -x '"\C-r": peco_history'

  peco_cd_recursive() {
    cd "$(find -name '.git' -prune -o -type d -printf '%P\n' | peco)"
  }
  bind -x '"\C-x\C-d": peco_cd_recursive'
fi

## fzf integration
if which fzf &> /dev/null && [ -n "$ConEmuBuild" ]; then
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

fi

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="${HOME}/.sdkman"
[[ -s "${HOME}/.sdkman/bin/sdkman-init.sh" ]] && source "${HOME}/.sdkman/bin/sdkman-init.sh"