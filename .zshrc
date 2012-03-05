HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=100000

setopt appendhistory autocd extendedglob notify
setopt hist_ignore_dups hist_ignore_all_dups
setopt share_history
setopt auto_pushd
setopt list_packed
setopt appendhistory extendedglob
setopt ignore_eof           # Ctrl-dでログアウトしない

bindkey -e

function title {
	print -n "\e]0;$@\a"
    export TITLE="${(pj: :)@}"
}
precmd(){
	echo -ne "\033]0;gnome-terminal : $USER@`hostname` : $PWD\007"
}

PROMPT="%B%{[32m%}%n@%m%{[m%}%b $ "
RPROMPT="[%B%{[34m%}%~%{[34m%}%b]"

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
zstyle :compinstall filename '/home/kai/.zshrc'

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
## select directory stack by canything
  ja(){
    local destpath=`j 2>&1 | sed -n -e '2,$p' | sed 's/^[0-9\\. ]*//' | tac | canything`
    if [ $? -eq 0 -a -n "$destpath" -a -d "$destpath" ]
    then
      cd $destpath
    fi
  }


  function percol_select_history() {
    local tac_cmd
    which gtac &> /dev/null && tac_cmd=gtac || tac_cmd=tac
    BUFFER=$($tac_cmd $HISTFILE | sed 's/^: [0-9]*:[0-9]*;//' \
      | percol --match-method regex --query "$LBUFFER")
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
  search-thesis-by-percol(){
    MENDELEY_DIR=~/Dropbox/Mendeley
    SELECTED_FILE=$(ls $MENDELEY_DIR | grep "\.pdf$" | percol --match-method regex)
    if [ $? -eq 0 ]; then
      gnome-open ${MENDELEY_DIR}/$SELECTED_FILE
    fi
  }

## select document form Dropbox directory
  search-document-by-percol(){
    DOCUMENT_DIR=~/Dropbox/document
    SELECTED_FILE=$(find $DOCUMENT_DIR | sed -e "s#$DOCUMENT_DIR##" | \
      grep -E "\.(pdf|txt|odp|odt|ods)$" | percol --match-method regex)
    if [ $? -eq 0 ]; then
      gnome-open ${DOCUMENT_DIR}/$SELECTED_FILE
    fi
  }

## complete a content of current directory by canything
  insert-file-by-percol(){
    LBUFFER=$LBUFFER$(ls -A | percol --match-method regex | tr '\n' ' ' | \
      sed 's/[[:space:]]*$//') # delete trailing space
    zle -R -c
  }
  zle -N insert-file-by-percol
  bindkey '^[c' insert-file-by-percol

fi

## kill one directory from path name
## http://www.jmuk.org/diary/index.php/2007/06/08/0/
  backward-kill-directory(){
    WORDCHARS_TMP=$WORDCHARS
    WORDCHARS='*?_-.[]~=&;!#$%^(){}<>'
    zle backward-kill-word
    WORDCHARS=$WORDCHARS_TMP
  }
  zle -N backward-kill-directory
  bindkey '^[^' backward-kill-directory

echo "Load .zshrc."

