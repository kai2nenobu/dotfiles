#!/bin/bash
CONFIG=Dropbox/program_config
old_dir=$PWD
filelist="texmf .hatena .keysnail .percol.d .Xmodmap .bash_aliases .bashrc
.ispell_default .latexmkrc .mayu .profile .rsense .screenrc .tmux.conf
.zsh_aliases .zshrc .aspell.conf .aspell.en.pws .aspell.en.prepl"

cd $HOME

for file in $filelist; do
    ln -f -s "${CONFIG}/${file}" .
done

cd $old_dir

