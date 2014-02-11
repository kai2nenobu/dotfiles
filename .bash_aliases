# some more aliases
alias ll='ls -l'
alias lla='ls -Al'
alias la='ls -A'
alias l='ls -CF'
alias rm='rm -i'
alias less='less -r'
alias apti='sudo apt-get install'
alias apts='apt-cache search'
alias aptsh='apt-cache show'
alias e='emacs'
alias ec='emacsclient'
alias tmux='tmux -2'
alias psg='ps aux | grep'
alias acroread='UBUNTU_MENUPROXY= LIBOVERLAY_SCROLLBAR=0 acroread'
alias t='tmux attach || tmux'
alias du1='du -h --max-depth 1'

if which git > /dev/null; then
  alias g='git'
  alias gs='git status'
  alias gl='git log'
  alias gld='git log --decorate --graph'
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
