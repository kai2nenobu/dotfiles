# ~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
# exists.
# see /usr/share/doc/bash/examples/startup-files for examples.
# the files are located in the bash-doc package.

# the default umask is set in /etc/profile; for setting the umask
# for ssh logins, install and configure the libpam-umask package.
#umask 022

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# OS specific settings
case $(uname -o) in
  "Cygwin")
    #mount -c /
    # mount "$USERPROFILE" /home/$USERNAME
    export OPEN=cygstart;;
  "GNU/Linux")
    export OPEN=gnome-open;;
esac

# set enviroment
export PATH=${HOME}/cygwin-bin:${HOME}/local/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/lib:${HOME}/.emacs.d/lib
export EDITOR=emacsclient
export VISUAL=emacsclient
export TERM=xterm-256color
export EXPERIMENT_MAIL='kai@gavo.t.u-tokyo.ac.jp'
export LESS='-R'
export LESSOPEN='| /usr/share/source-highlight/src-hilite-lesspipe.sh %s'

echo "Load .profile"

[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
