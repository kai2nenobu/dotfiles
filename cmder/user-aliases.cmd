;= @echo off
;= rem Call DOSKEY and use this file as the macrofile
;= %SystemRoot%\system32\doskey /listsize=1000 /macrofile=%0%
;= rem In batch mode, jump to the end of the file
;= goto:eof
;= Add aliases below here
e.=explorer .
ls=ls --show-control-chars -F --color $*
l=ls -AF --show-control-chars -F --color $*
ll=ls -AlhF --show-control-chars -F --color $*
pwd=cd
clear=cls
history=cat "%CMDER_ROOT%\config\.history"
unalias=alias /d $1
vi=vim $*
cmderr=cd /d "%CMDER_ROOT%"

hoge=echo hoge

g=git $*
gs=git status --short --branch $*
gst=git stash $*
gl=git log $*
gla=git log --decorate --graph --all $*
glo=git log --decorate --graph --all --oneline $*
gd=git diff --histogram $*
gc=git commit $*
ga=git add $*
gco=git checkout $*
gb=git branch $*
gp=git pull $*
gn=git now --all --stat $*
gam=git commmit --amend --no-edit $*
