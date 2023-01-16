# shellcheck shell=bash

# ~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
# exists.
# see /usr/share/doc/bash/examples/startup-files for examples.
# the files are located in the bash-doc package.

# the default umask is set in /etc/profile; for setting the umask
# for ssh logins, install and configure the libpam-umask package.
umask 022

# set PATH so it includes user's private bin if it exists
private_paths=("$HOME/bin" "$HOME/utils")
for p in "${private_paths[@]}"; do
  [ -d "$p" ] && export PATH="$p:$PATH"
done

# OS specific settings
case $(uname -o) in
  "Cygwin")
    # Add cygwin specific bin dir to PATH recursivey
    if [ -d "${HOME}/cygwin-bin" ]; then
      PATH="$(find "${HOME}/cygwin-bin" -type d | tr '\n' ':')$PATH"
    fi
    # Ignore CR in shell scripts
    export SHELLOPTS='igncr'
    export JAVA_OPTS='-Dfile.encoding=UTF-8'
    ;;
esac

# Load RVM into a shell session *as a function*
if [ -s "${HOME}/.rvm/scripts/rvm" ]; then
  source "${HOME}/.rvm/scripts/rvm"
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

# evm path
if [ -d "${HOME}/.evm" ]; then
  export PATH="${HOME}/.evm/bin:$PATH"
fi

# set enviroment
export PATH=${HOME}/.local/bin:$PATH
export EDITOR=emacsclient
export VISUAL=emacsclient
export LESS='-R'
#export LESSOPEN='| /usr/share/source-highlight/src-hilite-lesspipe.sh %s'
export BAT_PAGER='less -RF'

# if pyenv is installed
if [ -e "$HOME/.pyenv/bin/pyenv" ]; then
  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="$PYENV_ROOT/bin:$PATH"
  eval "$(pyenv init --path)"
fi

# PATH to Golang
test -d /usr/local/go/bin && export PATH=$PATH:/usr/local/go/bin

# if go directory exists
if [ -e "$HOME/go" ]; then
  export GOPATH="$HOME/go"
  export PATH="$GOPATH/bin:$PATH"
fi

# Node.js global packages
test -d "${HOME}/.node/bin" && export PATH="$PATH:${HOME}/.node/bin"

# added by Nix installer
if [ -e "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
  . "$HOME/.nix-profile/etc/profile.d/nix.sh"
fi

if [ -d "$HOME/.poetry" ]; then
  export PATH="$HOME/.poetry/bin:$PATH"
  which python3 &> /dev/null && alias poetry='python3 $HOME/.poetry/bin/poetry'
fi

# Volta integration
if [ -d "$HOME/.volta" ]; then
  export VOLTA_HOME="$HOME/.volta"
  export PATH="$VOLTA_HOME/bin:$PATH"
fi

if [ -e "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
fi

if [ -x "$HOME/.tfenv/bin/tfenv" ]; then
  export PATH="$HOME/.tfenv/bin:$PATH"
fi

# Ubuntu make installation of Ubuntu Make binary symlink
if [ -d "$HOME/.local/share/umake/bin" ]; then
  PATH="$HOME/.local/share/umake/bin:$PATH"
fi

# Homebrew
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# Keyboard layout by xkb
if type xkbcomp > /dev/null 2>&1; then
  xkbcomp -I"${HOME}/.config/xkb" "${HOME}/.config/xkb/keymap/my.xkb" "$DISPLAY" 2> /tmp/xkb.log
fi

# Integrate with 1password ssh agent
if [ -S "$HOME/.1password/agent.sock" ]; then
  export SSH_AUTH_SOCK="$HOME/.1password/agent.sock"
fi

# devbox
if [ -e "${HOME}/.nix-profile/etc/profile.d/nix.sh" ]; then . "${HOME}/.nix-profile/etc/profile.d/nix.sh"; fi # added by Nix installer

echo "Load .profile"

# Local Variables:
# mode: sh
# sh-shell: bash
# End:
