# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
[ -z "$PS1" ] && return

# Load scripts in .bash.d
for script in ~/.bash.d/*.bash; do
  source "$script"
done

echo "Load .bashrc"
