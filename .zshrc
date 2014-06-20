# -*- mode: sh -*-
HISTFILE="${HOME}/.zsh_history"
HISTSIZE=100000
SAVEHIST=100000

setopt appendhistory autocd extendedglob notify
setopt hist_ignore_dups hist_ignore_all_dups
setopt hist_ignore_space    # 行頭がスペースのコマンドは保存しない
setopt share_history
setopt extended_history         # history ファイルにエポックタイムを記録する
setopt auto_pushd
setopt list_packed
setopt ignore_eof           # Ctrl-dでログアウトしない
setopt no_nomatch           # グロブの展開が出来ない場合は，グロブパターンをそのまま残して
                            # エラーの報告はしない

REPORTTIME=15     # 長いコマンドを自動でtime表示

## 補完候補を移動して選択
zstyle ':completion:*:default' menu select=2
## 補完候補を詰めて表示
setopt list_packed

bindkey -e

# VCS settings
setopt prompt_subst
export my_vcs_info

function title {
    print -n "\e]0;$@\a"
    export TITLE="${(pj: :)@}"
}
precmd(){
  echo -ne "\033]0;$USER@`hostname`: $PWD\007"
  LANG=en_US.UTF-8
  if git rev-parse --abbrev-ref HEAD &> /dev/null; then
      my_vcs_info=" %F{green}($(git rev-parse --abbrev-ref HEAD))%f"
  else
      my_vcs_info=''
  fi
}

function finish {
  start=$SECONDS
  $@
  end=$SECONDS
  notify-send -t 0 'Finish command' "Take $((end - start)) seconds\n'$*'"
}

PROMPT="%B%{[32m%}%n@%m%{[m%}%b $ "
RPROMPT='[%B%{[34m%}%~%{[34m%}%b${my_vcs_info}]'

export LSCOLORS=ExFxCxdxBxegedabagacad
export LS_COLORS='di=01;34:ln=01;35:so=01;32:ex=01;31:bd=46;34:cd=43;34:su=41;30:sg=46;30:tw=42;30:ow=43;30'
zstyle ':completion:*' list-colors 'di=;34;1' 'ln=;35;1' 'so=;32;1' 'ex=31;1' 'bd=46;34' 'cd=43;34'

## key bind
bindkey '^W' kill-region
bindkey '^[h' backward-kill-word
bindkey '^[OP' run-help


# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# The following lines were added by compinstall
zstyle :compinstall filename "${HOME}/.zshrc"

autoload -Uz compinit
compinit

export LSCOLORS=ExFxCxdxBxegedabagacad
export LS_COLORS='di=01;34:ln=01;35:so=01;32:ex=01;31:bd=46;34:cd=43;34:su=41;30:sg=46;30:tw=42;30:ow=43;30'
zstyle ':completion:*' list-colors 'di=;34;1' 'ln=;35;1' 'so=;32;1' 'ex=31;1' 'bd=46;34' 'cd=43;34'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi
if [ -f ~/.zsh_aliases ]; then
    . ~/.zsh_aliases
fi

# The following lines were added by compinstall
zstyle :compinstall filename '/home/kai/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

# cdr stuff
autoload -Uz chpwd_recent_dirs cdr add-zsh-hook
add-zsh-hook chpwd chpwd_recent_dirs
zstyle ':chpwd:*' recent-dirs-max 5000
zstyle ':chpwd:*' recent-dirs-default yes
zstyle ':completion:*' recent-dirs-insert both

# confirm command exitence
function exists { which $1 &> /dev/null }

## http://masutaka.net/chalow/2011-09-28.html
## Invoke the ``dired'' of current working directory in Emacs buffer.
WID_FILE=${HOME}/.emacs.d/server_wid
function dired () {
  emacsclient -e "(dired \"${1:a}\")"
  wmctrl -i -a $(cat $WID_FILE)
}
## Chdir to the ``default-directory'' of currently opened in Emacs buffer.
function cde () {
    EMACS_CWD=`emacsclient -e "
     (expand-file-name
      (with-current-buffer
          (if (featurep 'elscreen)
              (let* ((frame-confs (elscreen-get-frame-confs (selected-frame)))
                     (num (nth 1 (assoc 'screen-history frame-confs)))
                     (cur-window-conf (cadr (assoc num (assoc 'screen-property frame-confs))))
                     (marker (nth 2 cur-window-conf)))
                (marker-buffer marker))
            (nth 1
                 (assoc 'buffer-list
                        (nth 1 (nth 1 (current-frame-configuration))))))
        default-directory))" | sed 's/^"\(.*\)"$/\1/'`

    echo "chdir to $EMACS_CWD"
    cd "$EMACS_CWD"
}


if which percol &> /dev/null; then
  ## select git log
  function percol_git_log() {
    local SELECTED
    local git_log_format='%h %ad | %s'    # %h should be at the top
    # select by percol
    SELECTED=$(git --no-pager log --pretty=format:${git_log_format} --date short | \
      percol --match-method migemo)
    if [ $? -ne 0 ]; then       # When percol fails
      zle -R -c                 # abort and refresh
      return 1
    fi
    # extract commit hash
    SELECTED=$(echo "$SELECTED" | grep -o '^[0-9a-f]\+')
    # insert hash to BUFFER
    if [ $(echo "$SELECTED" | wc -l) -eq 2 ]; then
      SELECTED=$(echo -n "$SELECTED" | sed ':loop; N; $!b loop; ;s/\n/../g')
    else
      SELECTED=$(echo -n "$SELECTED" | tr '\n' ' ')
    fi
    LBUFFER=${LBUFFER}${SELECTED}
    zle -R -c
  }
  zle -N percol_git_log
  bindkey '^Xg' percol_git_log

  ## select cd history
  function percol_cdr() {
    local SELECTED
    SELECTED=$(cdr -l | percol --match-method migemo)
    if [ $? -ne 0 ]; then       # When percol fails
      zle -R -c                 # abort and refresh
      return 1
    fi
    BUFFER="cd $(echo $SELECTED | sed 's/^[[:digit:]]\+ \+//')"
    zle -R -c
    zle accept-line
  }
  zle -N percol_cdr
  bindkey '^[r' percol_cdr

## select directory stack by canything
  ja(){
    local destpath=`j 2>&1 | sed -n -e '2,$p' | sed 's/^[0-9\\. ]*//' | tac | canything`
    if [ $? -eq 0 -a -n "$destpath" -a -d "$destpath" ]
    then
      cd $destpath
    fi
  }

  function percol_git_ls_files() {
    local SELECTED
    if ! git rev-parse &> /dev/null; then
      zle -M "Not a git repository (or any of the parent directories)"
      return 2
    fi
    SELECTED=$(git ls-files | percol --match-method migemo | tr '\n' ' ')
    if [ $? -ne 0 ]; then       # When percol fails
      zle -M "Percol exits abnormally"
      zle -R -c               # refresh
      return 1
    fi
    BUFFER=$LBUFFER$SELECTED
    CURSOR=$#BUFFER         # move cursor
    zle -R -c               # refresh
  }
  zle -N percol_git_ls_files
  bindkey '^Xf' percol_git_ls_files

  function percol_select_history() {
    local tac
    local SELECTED
    exists gtac && tac="gtac" || { exists tac && tac="tac" || { tac="tail -r" } }
    SELECTED=$(history -n 1 | eval $tac | percol --match-method migemo --query "$LBUFFER")
    if [ $? -ne 0 ]; then       # When percol fails
      zle -R -c               # refresh
      return 1
    fi
    BUFFER=$SELECTED
    CURSOR=$#BUFFER         # move cursor
    zle -R -c               # refresh
  }
  zle -N percol_select_history
  bindkey '^R' percol_select_history

## select ~/.zsh_history by canything
  # export ZSH_HISTORY=${HOME}/.zsh_history
  # history-canything-search(){
  #   BUFFER=$(tac $ZSH_HISTORY | sed -r 's/^:[ 0-9]+:[0-9];//' | canything -i)
  # }
  # zle -N history-canything-search
  # bindkey '^R' history-canything-search

## select thesis from mendeley directory by canything
  function search-thesis-by-percol(){
    THESIS_DIR="\
${HOME}/Dropbox/Mendeley
${HOME}/Dropbox/works/tex_workspace"
    SELECTED_FILE=$(echo $THESIS_DIR | xargs find | grep "\.pdf$" | grep -v '/img/' | percol --match-method migemo)
    if [ $? -eq 0 ]; then
      $OPEN $SELECTED_FILE
    fi
  }
  alias  st='search-thesis-by-percol'

## select document form Dropbox directory
  function search-document-by-percol(){
    DOCUMENT_DIR="\
${HOME}/Dropbox/document
${HOME}/Dropbox/excel
${HOME}/Dropbox/lecture"
    SELECTED_FILE=$(echo $DOCUMENT_DIR | xargs find | \
      grep -E "\.(pdf|txt|odp|odt|ods|docx?|xlsx?|pptx?)$" | percol --match-method migemo)
    if [ $? -eq 0 ]; then
      # $OPEN ${DOCUMENT_DIR}/$SELECTED_FILE
      open $SELECTED_FILE
    fi
  }
  alias sd='search-document-by-percol'
  zle -N search-document-by-percol
  bindkey '^Xd' search-document-by-percol

  ## Complete file name by percol
  autoload -Uz split-shell-arguments
  autoload -Uz modify-current-argument
  function complete-filename-by-percol() {
    local CANDIDATES=""
    local FILE=""
    local DIR=""
    local AMOUNT=""
    local SELECTED=""
    local ARG=""
    local ARG_EXPAND=""
    local NEW_ARG=""
    local OLD_CURSOR=$CURSOR
    local OLD_IFS=$IFS

    ## Discriminate cursor position
    split-shell-arguments
    if [ $(($REPLY % 2)) -eq 0 ]; then # Cursor is on an argument
      ARG=$reply[$REPLY]
      CURSOR=$(($CURSOR + ${#reply[$REPLY]} - $REPLY2 + 1)) # Move to next to right end of an argument
    else
      zle backward-char
      split-shell-arguments
      if [ $(($REPLY % 2)) -eq 0 ]; then # Cursor is on right end of an argument
        ARG=$reply[$REPLY]
      fi    # Else argment is empty
      zle forward-char
    fi   #### If $ARG is ".", this function might not work well. ####
    # Expand special keys and $HOME
    ARG_EXPAND=$(echo -n "$ARG" | sed -e "s@~/@${HOME}/@" -e 's@\\\([[!#$&() ]\)@\1@g' \
      -e 's@\\\([]*;<>^{|}~]\)@\1@g' -e "s@\\\\'@'@g")

    ## List files
    if [ "$ARG_EXPAND" = "" ] || [ -d "$ARG_EXPAND" ]; then # $ARG_EXPAND is a unique directory
      DIR=${ARG_EXPAND%/}
      FILE=""
      CANDIDATES=$(ls -A $DIR 2> /dev/null)
    else    # Divide an argument into DIR and FILE
      if echo $ARG_EXPAND | grep '/' &> /dev/null; then
        DIR=${ARG_EXPAND%/*}
      else
        DIR=""
      fi
      FILE=${ARG_EXPAND##*/}
      CANDIDATES=$(ls -d ${ARG_EXPAND}* 2> /dev/null | sed "s@${DIR}/@@")
    fi
    AMOUNT=$(echo $CANDIDATES | wc -l)
    if [ "$CANDIDATES" = "" ]; then # $CANDIDATES has no candidates
      CURSOR=$OLD_CURSOR
      zle -M "No candidates."
      return 2
    elif [ $AMOUNT -eq 1 ]; then # $CANDIDATES has a unique candidate
      SELECTED=$CANDIDATES
    elif [ $AMOUNT -ge 2 ]; then  # $CANDIDATES has many candidates
      # select by percol
      SELECTED=$(echo -n $CANDIDATES | percol --match-method migemo)
      if [ $? -ne 0 ]; then   # When percol fail
        CURSOR=$OLD_CURSOR
        zle -R -c
        return 1
      fi
    fi

    ## Insert file(s) to command line
    # Escape special keys an $HOME
    SELECTED=$(echo -n $SELECTED | sed  -e 's@\([[!#&() ]\)@\\\1@g' \
      -e 's@\([]*;<>^{|}~]\)@\\\1@g' -e "s@'@\\\\'@g" -e "s@${HOME}/@~/@g")
    DIR=$(echo -n $DIR | sed  -e 's@\([[!"#&() ]\)@\\\1@g' \
      -e 's@\([]*;<>^{|}~]\)@\\\1@g' -e "s@'@\\\\'@g" -e "s@${HOME}/@~/@g")
    # Separate with newline only
    IFS="
"
    if [ "$DIR" = "" ] && [ "$FILE" = "" ]; then # An argument is empty
      for file in $(echo -n $SELECTED); do
        LBUFFER="$LBUFFER$file "
      done
    elif [ "$DIR" = "" ]; then
      for file in $(echo -n $SELECTED); do
        NEW_ARG="$NEW_ARG$file "
      done
      modify-current-argument $NEW_ARG
      CURSOR=$(($CURSOR + ${#NEW_ARG} - ${#ARG}))
    else  # $DIR is not empty
      for file in $(echo -n $SELECTED); do
        NEW_ARG="$NEW_ARG${DIR}/$file "
      done
      modify-current-argument $NEW_ARG
      CURSOR=$(($CURSOR + ${#NEW_ARG} - ${#ARG}))
    fi
    IFS=$OLD_IFS
    zle backward-delete-char  # Delete a trailing white space
    zle -R -c
  }
  zle -N complete-filename-by-percol
  bindkey '^J' complete-filename-by-percol

  # https://github.com/mooz/percol
  # Here is an interactive version of pgrep
  function ppgrep() {
    if [[ $1 == "" ]]; then
      PERCOL=percol
    else
      PERCOL="percol --query $1"
    fi
    ps aux | eval $PERCOL | awk '{ print $2 }'
  }

  # and here is an interactive version of pkill
  function ppkill() {
    if [[ $1 =~ "^-" ]]; then
      QUERY=""            # options only
    else
      QUERY=$1            # with a query
      shift
    fi
    ppgrep $QUERY | xargs kill $*
  }

  function percol-tmux-select-pane() {
    local selected
    selected=$(tmux list-panes -s -F '#{window_index} #{pane_index} #{pane_title}' | percol)
    local window=$(echo $selected | cut -f1 -d " ")
    local pane=$(echo $selected | cut -f2 -d " ")
    tmux select-window -t $window
    tmux select-pane -t $pane
  }

fi

## kill one directory from path name
## http://www.jmuk.org/diary/index.php/2007/06/08/0/
  function backward-kill-directory(){
    WORDCHARS_TMP=$WORDCHARS
    WORDCHARS='*?_-.[]~=&;!#$%^(){}<>'
    zle backward-kill-word
    WORDCHARS=$WORDCHARS_TMP
  }
  zle -N backward-kill-directory
  bindkey '^[^' backward-kill-directory

change-directory-bookmark(){
  local BOOKMARK="\
/etc
${HOME}/.emacs.d
${HOME}/Dropbox/works/tex_workspace
${HOME}/Dropbox/document
${HOME}/Dropbox/program_config
${HOME}/repo"
  local TARGET=$(echo $BOOKMARK | percol)
  if [ $? -eq 0 ]; then
    cd "$TARGET"
  fi
}
alias cdb='change-directory-bookmark'

## tmux
if which tmux &> /dev/null; then
  ## tmux start
  ## http://stillpedant.hatenablog.com/entry/2012/11/30/214017
  function tmux-start() {
    BUFFER=" { tmux list-sessions >& /dev/null && tmux attach } || tmux"
    zle accept-line
  }
  zle -N tmux-start
  bindkey '^X^T' tmux-start

  ## pane move
  function tmux-select-pane(){
    tmux select-pane -t .+
  }
  zle -N tmux-select-pane
  bindkey '^T' tmux-select-pane

  function tmux-select-pane-reverse(){
    tmux select-pane -t .-
  }
  zle -N tmux-select-pane-reverse
  bindkey '^U^T' tmux-select-pane-reverse

  ## for tmux complete
  ## http://d.hatena.ne.jp/syohex/20120626/1340715334
  _tmux_pane_words() {
    local expl
    local -a w
    if [[ -z "$TMUX_PANE" ]]; then
      _message "not running inside tmux!"
      return 1
    fi
    w=( ${(u)=$(tmux capture-pane \; show-buffer \; delete-buffer)} )
    _wanted values expl 'words from current tmux pane' compadd -a w
  }

  zle -C tmux-pane-words-prefix   complete-word _generic
  zle -C tmux-pane-words-anywhere complete-word _generic
  bindkey '^[/' tmux-pane-words-prefix
  bindkey '^[?' tmux-pane-words-anywhere
  zstyle ':completion:tmux-pane-words-(prefix|anywhere):*' completer _tmux_pane_words
  zstyle ':completion:tmux-pane-words-(prefix|anywhere):*' ignore-line current
  zstyle ':completion:tmux-pane-words-anywhere:*' matcher-list 'b:=*'
fi

if which mosh &> /dev/null; then
  ## mosh を ssh と同様に補完する
  compdef mosh=ssh
fi

# 自動で tmux を起動する
if which tmux &> /dev/null && [ -z $TMUX ]; then
  if tmux has-session &> /dev/null; then
    if tmux list-sessions 2>& /dev/null | grep -v '(attached)' &> /dev/null; then
      # detach 状態の tmux がある場合は attach する
      tmux attach
    fi
    # detach 状態の tmux が存在しない場合は新しい tmux セッションは作成しない
  else
    # tmux セッションが１つもない場合は新しく起動する
    tmux
  fi
fi

echo "Load .zshrc."
