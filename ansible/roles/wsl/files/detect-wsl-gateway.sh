if [ -d "/run/WSL" ]; then
  # WSL2
  ip=$(grep -oP '(?<=nameserver ).+' /etc/resolv.conf)
  if [ $? -ne 0 ]; then
    echo "Cannot detect Host IP address" >&2
    ip=127.0.0.1
  fi
else
  # WSL1
  ip=127.0.0.1
fi

export WSL_GATEWAY=$ip
export DISPLAY=$ip:0
unset ip

