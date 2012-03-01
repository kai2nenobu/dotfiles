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

# Cygwin mount
if [ $(uname -o) = "Cygwin" ]; then
  #mount -c /
  mount "$USERPROFILE" /home/$USERNAME
fi

# set enviroment
export PATH=${HOME}/cygwin-bin:/usr/local/texlive/2011/bin/i386-linux:${HOME}/local/bin:$PATH
export LD_LIBRARY_PATH=~/.emacs.d/lib:$LD_LIBRARY_PATH
export EDITOR=emacsclient
export VISUAL=emacsclient
export TERM=xterm-256color
export EXPERIMENT_MAIL='kai@gavo.t.u-tokyo.ac.jp'

echo "Load .profile"
