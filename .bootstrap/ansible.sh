#!/bin/sh

### Bootstrap ansible with python3
###
### Prerequisite:
###   OS: Ubuntu 18.04 or later

SUDO='sudo -E'
# Not use sudo if root
[ "$(id -u)" = 0 ] && SUDO=

if [ -e /etc/os-release ]; then
  . /etc/os-release
fi

if [ "$ID" = "ubuntu" ]; then
  # Install requirements
  $SUDO apt update && $SUDO env DEBIAN_FRONTEND=noninteractive apt install -y python3 curl
  # Download ansible venv
  URL=https://dotfiles.kaichan.info/venv
  venv_name="${ID}-${VERSION_ID}-ansible-venv.tar.gz"
  venv_location=/opt/ansible-venv
  $SUDO mkdir -p "$venv_location"
  curl -sSL "${URL}/${venv_name}" | $SUDO tar zx --directory "$venv_location"
else
  ## Other than Ubuntu
  $SUDO apt update
  $SUDO env DEBIAN_FRONTEND=noninteractive apt install -y \
        software-properties-common python3-pip python3-setuptools
  $SUDO pip3 install ansible pywinrm
fi
