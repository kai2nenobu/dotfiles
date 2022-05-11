# shellcheck shell=sh
if [ -d "/run/WSL" ]; then
  # Use npiperelay on WSL2
  export SSH_AUTH_SOCK="$HOME/.ssh/agent.sock"
  ss -a | grep -q "$SSH_AUTH_SOCK"
  # shellcheck disable=SC2181
  if [ $? -ne 0 ]; then
    rm -f "$SSH_AUTH_SOCK"
    ( setsid socat UNIX-LISTEN:"$SSH_AUTH_SOCK",umask=077,fork EXEC:"npiperelay.exe -ei -s //./pipe/openssh-ssh-agent",nofork & ) >/dev/null 2>&1
  fi
else
  # Use wsl-ssh-agent on WSL1
  # shellcheck disable=SC2153 # WSL_AUTH_SOCKはWindows側から引き継ぐの問題ない
  [ -n "$WSL_AUTH_SOCK" ] && export SSH_AUTH_SOCK="$WSL_AUTH_SOCK"
fi
