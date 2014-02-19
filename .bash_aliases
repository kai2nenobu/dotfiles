# general aliases
alias ls='ls --color=auto --show-control-chars'
alias ll='ls -Al'
alias l='ls -AF'

alias rm='rm -i'
alias grep='grep --color=auto'
alias less='less -r'

alias du1='du -h --max-depth 1'
alias updatedb='time updatedb --localpaths="$(cygpath -m $HOME)" --prunepaths="$(cygpath -m $HOME)/AppData /\([^/]*/\)+.git"'

alias e='emacs'
alias ec='emacsclient'
alias tmux='tmux -2'
alias t='tmux attach || tmux'
alias psg='ps aux | grep'

# git aliases
if which git > /dev/null; then
  alias g='git'
  alias gs='git status'
  alias gl='git log'
  alias gld='git log --decorate --graph --oneline'
  alias gd='git diff'
  alias gc='git commit'
  alias ga='git add'
  alias gco='git checkout'
  alias gb='git branch'
fi

if which notifier > /dev/null; then
  alias finished="notifier 'Finished!' 'Come back here'"
fi

# system specific aliases
case $(uname -o) in
  "Cygwin")
    alias open=cygstart
    alias apt-cyg='apt-cyg -u'
    alias apti='apt-cyg -u install'
    alias apts='apt-cyg -u find'
    alias aptsh='apt-cyg -u describe'
    alias ipconfig='ipconfig /all | nkf'
    ;;
  "GNU/Linux")
    alias open=xdg-open;;
esac

echo "Load .bash_aliases."
