# shellcheck shell=bash

# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
[ -z "$PS1" ] && return

function _log() {
  echo "[$(date --iso-8601=s)]" "$@" >&2
}

# Load scripts in .bash.d
for script in ~/.bash.d/*.bash; do
  [ -e "$script" ] || continue
  _log "Loading \"$script\""
  # shellcheck disable=SC1090
  source "$script"
  _log "Complete loading \"$script\""
done

_log "Load .bashrc"
