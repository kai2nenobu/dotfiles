# ~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
# exists.
# see /usr/share/doc/bash/examples/startup-files for examples.
# the files are located in the bash-doc package.

# the default umask is set in /etc/profile; for setting the umask
# for ssh logins, install and configure the libpam-umask package.
umask 022

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# OS specific settings
case $(uname -o) in
  "Cygwin")
    # Add cygwin specific bin dir to PATH recursivey
    if [ -d ${HOME}/cygwin-bin ]; then
      export PATH=$(find ${HOME}/cygwin-bin -type d | tr '\n' ':')$PATH
    fi
    unset tmp temp # Use chocolatey in Cygwin
    ;;
esac

# Load RVM into a shell session *as a function*
if [[ -s ${HOME}/.rvm/scripts/rvm ]]; then
  source $HOME/.rvm/scripts/rvm;
fi

# rbenv
if [ -d "${HOME}/.rbenv" ]; then
  export PATH="$HOME/.rbenv/bin:$PATH"
  eval "$(rbenv init -)"
fi

# Cask path
if [ -d "${HOME}/.cask" ]; then
  export PATH="${HOME}/.cask/bin:$PATH"
fi

# set enviroment
export PATH=${HOME}/.local/bin:$PATH
export EDITOR=emacsclient
export VISUAL=emacsclient
export TERM=xterm-256color
export EXPERIMENT_MAIL='kai@gavo.t.u-tokyo.ac.jp'
export LESS='-R'
#export LESSOPEN='| /usr/share/source-highlight/src-hilite-lesspipe.sh %s'

#THIS MUST BE AT THE END OF THE FILE FOR GVM TO WORK!!!
[[ -s "${HOME}/.gvm/bin/gvm-init.sh" ]] && source "${HOME}/.gvm/bin/gvm-init.sh"

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

echo "Load .profile"
