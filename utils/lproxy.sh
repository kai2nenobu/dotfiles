#!/bin/sh

export http_proxy=http://localhost:8888
export HTTP_PROXY=http://localhost:8888
export https_proxy=http://localhost:8888
export HTTPS_PROXY=http://localhost:8888

# Bypass docker machine ip
if type docker-machine > /dev/null 2>&1; then
  ip=$(docker-machine ip)
  export no_proxy="$ip,$no_proxy"
  export NO_PROXY="$ip,$NO_PROXY"
fi
