# shellcheck shell=sh
wsl=
if [ -d /run/WSL ]; then
  wsl=WSL2
elif [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]; then
  wsl=WSL1
fi

docker=
if [ -f /.dockerenv ]; then
  docker=$(printf '\uF308')  # nf-linux-docker
fi

platform=
if [ -f /etc/os-release ]; then
  id=$(sed -n '/^ID=/ s/ID=//p' /etc/os-release)
  case "$id" in
    "centos")
      platform=$(printf '\uF304');;  # nf-linux-centos
    "debian")
      platform=$(printf '\uF306');;  # nf-linux-debian
    "redhat")
      platform=$(printf '\uF316');;  # nf-linux-redhat
    "ubuntu")
      platform=$(printf '\uF31B');;  # nf-linux-ubuntu
    *)
      platform=$(printf '\uF31A');;  # nf-linux-tux
  esac
fi

export RUNTIME_ICON
RUNTIME_ICON="$wsl$docker$platform"
unset wsl docker platform
