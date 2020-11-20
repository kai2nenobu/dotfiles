if [ -d "/run/WSL" ]; then
  # WSL2
  ip=$(grep -oP '(?<=nameserver ).+' /etc/resolv.conf)
  if [ $? -ne 0 ]; then
    echo "Cannot detect Host IP address" >&2
    exit
  fi
  export WSL_GATEWAY=$ip
  unset ip
else
  # WSL1
  export WSL_GATEWAY=127.0.0.1
fi
