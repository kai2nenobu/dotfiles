# some more aliases
#alias ll='ls -l'
#alias la='ls -A'
#alias l='ls -CF'
alias rm='rm -i'
alias vless='/usr/share/vim/vim73/macros/less.sh'
alias less='less -r'
alias lsa='ls -a'
alias lsl='ls -l'
alias lsal='ls -al'
alias xdvi='pxdvi'
alias apti='sudo apt-get install'
alias apts='apt-cache search'
alias aptsh='apt-cache show'
alias e='emacs'
alias ec='emacsclient'
alias tmux='tmux -2'
alias psg='ps aux | grep'
alias go='gnome-open'
alias acroread='UBUNTU_MENUPROXY= LIBOVERLAY_SCROLLBAR=0 acroread'
alias t='tmux attach || tmux'
alias g='git'
alias gst='git status'
alias gl='git log'
alias gc='git commit'
alias ga='git add'
alias gco='git checkout'
alias gbr='git branch'

# system specific aliases
case $(uname -o) in
  "Cygwin")
    alias op=cygstart
    alias apt-cyg='apt-cyg -u'
    ;;
  "GNU/Linux")
    alias op=gnome-open;;
esac

echo "Load .bash_aliases."
