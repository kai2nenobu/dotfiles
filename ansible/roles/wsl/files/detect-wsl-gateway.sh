# shellcheck shell=sh
if [ -d "/run/WSL" ]; then
  # WSL2
  ip=${WSL_GATEWAY:-127.0.0.1}
else
  # WSL1
  ip=127.0.0.1
fi

export WSL_GATEWAY=$ip
export DISPLAY=$ip:0
unset ip
