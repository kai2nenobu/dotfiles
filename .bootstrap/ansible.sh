#!/bin/sh

### Bootstrap ansible with python3
###
### Prerequisite:
###   OS: Ubuntu 18.04

SUDO='sudo -E'
# Not use sudo if root
[ "$(id -u)" = 0 ] && SUDO=

$SUDO apt update
$SUDO apt install -y software-properties-common python3-pip python3-setuptools
$SUDO pip3 install ansible pywinrm
