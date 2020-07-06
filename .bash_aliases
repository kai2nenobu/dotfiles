# -*- mode: sh -*-

# general aliases
alias ls='ls --color=auto --show-control-chars'
alias ll='ls -AlhF'
alias l='ls -AF'

alias rm='rm -i'
alias grep='grep --color=auto'
alias less='less -R'
alias gdiff='git diff'

alias du1='du -h --max-depth 1'
alias updatedb='time updatedb --localpaths="$HOME" --prunepaths="$(find ${HOME} -name .git) ${HOME}/AppData"'

alias psg='ps aux | grep'

alias httpd-python='python -m SimpleHTTPServer 80'
alias httpd-python3='python -m http.server 80'
alias httpd-ruby='ruby -run -e httpd . -p 80'

# openssl / ssh
alias fingerprint='ssh-keygen -l -f'

# repair broken prompt (like after cat a binary file)
alias clear2="echo -e '\ec'"

# Javaのコメントと空行を削除（結構適当）
alias delcomment='grep -E -v -e "^[[:space:]]*$" -e "^[[:space:]]*/[*/]" -e "^[[:space:]]*\\*/?"'

# ldapsearchの検索結果をBASE64でデコードする
# バイナリデータをデコードするとめちゃくちゃになるので注意
# ref. http://www.perlmonks.org/bare/?node_id=963814
# ref. http://stackoverflow.com/questions/475074/regex-to-parse-or-validate-base64-data
function ldapdecode() {
  perl -MMIME::Base64 -n -00 -e 's/\n //g;s/:: (\S+)/": " . decode_base64($1)/eg;print'
}

# UTF-8 BOMの付け外し
alias append_bom="sed '1s/^\(\xef\xbb\xbf\)\?/\xef\xbb\xbf/'"
alias remove_bom="sed '1s/^\xef\xbb\xbf//'"

# docker aliases
alias d='docker'
alias dm='docker-machine'
alias dc='docker-compose'

## 指定したdocker-machineを起動すると、共に環境変数を設定する
function docker-env() {
  local machine=${1:-default}
  docker-machine ls | grep "$machine" | grep 'Running' || \
    docker-machine start "$machine"
  eval "$(docker-machine env "$machine")"
}

## dockerイメージ内で稼働しているサービスにアクセスできる "IP:PORT" を出力する関数
function d-address() {
  local name=${1:?Specify a name of docker image}
  local port=${2:?Specify a port number}
  printf "%s:%s" \
         $(docker-machine ip) \
         $(docker port "$(docker ps -q -f name=$name)" "$port" | cut -d: -f2)
}

## dockerイメージのタグ一覧を出力する（Docker Hubのイメージのみ対応）
function docker-tags() {
  local name=${1:?Specify a name of docker image}
  curl -s "https://registry.hub.docker.com/v1/repositories/$name/tags" | jq -r '.[].name'
}

# Print 256 colors
function print256colours() {
  # https://askubuntu.com/questions/821157/print-a-256-color-test-pattern-in-the-terminal/821163#821163
  bash -c "$(curl -s 'https://gist.githubusercontent.com/HaleTom/89ffe32783f89f403bba96bd7bcd1263/raw/e50a28ec54188d2413518788de6c6367ffcea4f7/print256colours.sh')"
}

# git aliases
alias g='git'
alias gs='git status --short --branch'
alias gst='git stash'
alias gl='git log'
alias gla='git log --decorate --graph --all'
alias glo='git log --decorate --graph --all --oneline'
alias gd='git diff --histogram'
alias gc='git commit'
alias ga='git add'
alias gco='git checkout'
alias gb='git branch'
alias gp='git pull'
alias gn='git now --all --stat'
alias gam='git commmit --amend --no-edit'
# git svn
alias gsb='git svn branch'
alias gsc='git svn dcommit'
alias gsi='git svn info'
alias gsl='git svn log'
alias gsr='git svn rebase'
alias gss='git svn status'
alias gsf='git svn fetch'

function git-start() {
  local user=
  local email=
  local message="First empty commit"
  while getopts :u:e:m: OPT; do
    case $OPT in
      u|+u)
        user="$OPTARG"
        ;;
      e|+e)
        email="$OPTARG"
        ;;
      m|+m)
        message="$OPTARG"
        ;;
      *)
        echo "usage: ${0##*/} [+-u ARG] [+-e ARG] [+-m ARG} [--] ARGS..."
        return 2
    esac
  done
  shift $(( OPTIND - 1 ))
  OPTIND=1

  git init
  [ -n "$user" ]  && git config user.name  "$user"
  [ -n "$email" ] && git config user.email "$email"
  git commit --allow-empty -m "$message"
}

# 半角カナをそのまま処理する。改行は削除される。UTF-8で出力
alias urlencode='nkf -xwMQ | sed "s/=$//" | tr -d "\n" | tr = %'
# 半角カナはそのまま処理する。UTF-8で出力
alias urldecode='nkf --url-input -xw'

alias finished="notifier 'Finished!' 'Come back here'"

alias lb='lazybones'

alias vssh='vagrant ssh'
alias vg='vagrant'

alias e='emacs'
alias ec='emacsclient -a vi'
EDITOR='emacsclient -a vi'
export USER_EMACS_DIRECTORY="${HOME}/.emacs.d"

alias emacs-clean-elc="find ${USER_EMACS_DIRECTORY} -type f -name '*.elc' | xargs --no-run-if-empty rm"

function emacs-extract-init() {
  sed -n -e '/^#+BEGIN_SRC emacs-lisp/,/^#+END_SRC/ p' "${USER_EMACS_DIRECTORY}/org-init.d/init.org" | \
    sed -e '/^#+BEGIN_SRC emacs-lisp.*:tangle no/,/^#+END_SRC/ d' | \
    sed -e '/^#+BEGIN_SRC emacs-lisp/ d' -e '/^#+END_SRC/ d' > "${USER_EMACS_DIRECTORY}/org-init.d/init.el"
  emacs --batch --eval "(byte-compile-file (expand-file-name \"org-init.d/init.el\" user-emacs-directory))"
}

function emacs-sync-cask() {
  CASK_FILE="${USER_EMACS_DIRECTORY}/Cask"
  if [ ! -f "${CASK_FILE}" ]; then
    echo "${CASK_FILE} does not exist." >&2
    exit 1
  fi
  set -- $(sed -n -r 's@\(depends-on "([^"]+)"\)@\1@ p' "${CASK_FILE}")
  emacs --batch --eval \
"(progn
  (set-language-environment \"Japanese\")
  (prefer-coding-system 'utf-8)
  (require 'package)
  (add-to-list 'package-archives '(\"org\" . \"http://orgmode.org/elpa/\") t)
  (add-to-list 'package-archives '(\"melpa\" . \"http://melpa.org/packages/\") t)
  (package-initialize)
  (package-refresh-contents)
  (mapc #'package-install
        (mapcar #'intern argv))
  )" \
    "$@"
}

if type winpty &> /dev/null; then
  alias irb='winpty irb.cmd'
  alias kotlinc='winpty kotlinc.bat'
fi

if type powershell &> /dev/null && type cygpath &> /dev/null; then
  function sudo-bash() {
    argList=$(printf ",'%s'" "$@")
    argList=${argList:1}
    powershell -NoProfile -Command "Start-Process '$(cygpath -am /)/bin/bash' -ArgumentList $argList -Verb runas"
  }

  function sudo-sh() {
    argList=$(printf ",'%s'" "$@")
    argList=${argList:1}
    powershell -NoProfile -Command "Start-Process '$(cygpath -am /)/bin/sh' -ArgumentList $argList -Verb runas"
  }
fi

# system specific aliases
case $(uname -o) in
  "Cygwin")
    alias open=cygstart
    alias apti='apt-cyg install'
    alias apts='apt-cyg listall'
    alias aptsh='apt-cyg show'
    alias ipconfig='ipconfig /all | nkf'

    function putclip() {
      cat "$@" > /dev/clipboard
    }
    function getclip() {
      cat /dev/clipboard
    }
    function domaincontroller() {
      # ログイン中のドメインコントローラ名を表示する
      local script=$(mktemp --tmpdir 'XXXXXXXXXX.vbs')
      trap "rm -f $script" EXIT SIGINT
      cat > "$script" <<EOF
Set objDomain = GetObject("LDAP://rootDSE")
Wscript.Echo objDomain.Get("dnsHostName")
EOF
      cscript /Nologo $(cygpath --windows "$script")
    }
    ;;
  "GNU/Linux")
    alias open=xdg-open
    alias apti='sudo apt-get install'
    alias apts='apt-cache search'
    alias aptsh='apt-cache show'
    ;;
  "Msys")
    alias ssh='winpty ssh'
    alias scp='winpty scp'
    alias ssh-add='winpty ssh-add'
esac

function milliseconds() {
  expr $(date +%s%N) / 1000000
}

# tool install
alias install-rbenv='git clone https://github.com/sstephenson/rbenv.git ~/.rbenv && git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build'
alias install-gvm='curl -fsSL get.gvmtool.net | bash'
alias install-sdkman='curl -fsSL http://get.sdkman.io | bash'
alias install-evm="sudo mkdir -p /usr/local/evm && sudo chown $USER: /usr/local/evm && curl -fsSL https://raw.github.com/rejeep/evm/master/go | bash"
alias install-cask='curl -fsSL https://raw.github.com/cask/cask/master/go | python'
alias install-gibo='curl -fsSL https://raw.github.com/simonwhitaker/gibo/master/gibo -o ~/bin/gibo && chmod +x ~/bin/gibo && gibo -u'
install-nkf() {
  local tmpdir=$(mktemp --tmpdir --directory)
  # execute in subprocess
  (
  cd "$tmpdir"
  curl -fsSL -o nkf.tar.gz 'https://osdn.net/frs/redir.php?m=jaist&f=%2Fnkf%2F64158%2Fnkf-2.1.4.tar.gz'
  tar -xvf nkf.tar.gz
  cd nkf-2.1.4
  make
  make install
  )
  rm -rf "$tmpdir"
}
install-git-secrets() {
  (
  cd /tmp
  rm -rf git-secrets
  git clone 'https://github.com/awslabs/git-secrets.git'
  cd git-secrets
  make install PREFIX=~/.local
  )
}
install-ghq() {
  local location=~/.local/bin
  local version=1.1.4
  local zip=$(mktemp)
  mkdir -p "$location"
  curl -L -o "$zip" "https://github.com/x-motemen/ghq/releases/download/v${version}/ghq_linux_amd64.zip"
  unzip -j "$zip" ghq_linux_amd64/ghq -d "$location"
  rm -f "$zip"
}


# project specific .gitignore
function ignore-gradle() {
  cat <<EOF
/bin/
/build/
/target/
/.gradle/

# Eclipse
/.classpath
/.project
/.settings/
EOF
}

echo "Load .bash_aliases."
