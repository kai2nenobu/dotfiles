#!/bin/sh -x
# 一応 Ubuntu 用ということにしよう
# ~/Dropbox がある前提で。
DropboxDir=${HOME}/Dropbox
ConfDir=${DropboxDir}/program_config
FontDir=${DropboxDir}/fonts

## make symbolic link to configuration files.
## ただのファイルなら Destination で別名を指定することができるはず
ConfFiles=".aspell.conf .aspell.en.prepl .aspell.en.pws
.bash_aliases .bashrc .latexmkrc .mayu .offlineimaprc
.profile .rsense .tmux.conf .Xmodmap .zsh_aliases .zshrc"
for ConfFile in $ConfFiles; do
    ln -f -s ${ConfDir}/${ConfFile} ${HOME}/${ConfFile}
done

## make symbolic link to directory
## ディレクトリの場合、Destination で別名にすることができない。
## ln -f -s ${DropboxDir}/.emacs.d ${HOME}/.emacs.d にすると無限ループになるので注意
ln -f -s ${DropboxDir}/.emacs.d ${HOME}
ln -f -s ${DropboxDir}/bin ${HOME}

dirs=".keysnail .lookup .percol.d"
for dir in $dirs; do
    ln -f -s ${ConfDir}/${dir} ${HOME}
done


# ## configureation of mayu
# ## sudo の仕方がわからない
# if ! which mayu > /dev/null 2>&1; then
#     echo -n "Input mayu user name:"
#     read MAYUUSER
#     sudo echo 'uinput' >> /etc/modules   # Add uinput to the Linux Kernel
#     sudo cat ${ConfDir}/mayurc | sed -e "s/hoge/$MAYUUSER/" > /etc/init.d/mayu
#     sudo chmod +x /etc/init.d/mayu
#     sudo update-rc.d mayu start 10 2 . stop 10 0 1 3 4 5 6 .
# fi

## install fonts
UserFontDir=${HOME}/.fonts
mkdir $UserFontDir
for FontFile in $(find $FontDir -name '*.ttf'); do
    cp -n $FontFile $UserFontDir
done

# ## keybind setting
# gconftool --set '/apps/gnome_settings_daemon/keybindings/email' --type string '<Mod4>m'
# gconftool --set '/apps/gnome_settings_daemon/keybindings/home' --type string '<Mod4>e'
# gconftool --set '/apps/gnome_settings_daemon/keybindings/screensaver' --type string '<Mod4>l'
# gconftool --set '/apps/gnome_settings_daemon/keybindings/search' --type string '<Mod4>f'
# gconftool --set '/apps/gnome_settings_daemon/keybindings/www' --type string '<Mod4>b'
# gconftool --set '/desktop/gnome/keybindings/custom0/name' --type string 'mv_window'
# gconftool --set '/desktop/gnome/keybindings/custom0/action' --type string '/home/kai/bin/mov_window.sh'
# gconftool --set '/desktop/gnome/keybindings/custom0/binding' --type string '<Mod4>v'
# gconftool --set '/desktop/gnome/keybindings/custom1/name' --type string 'Terminal'
# gconftool --set '/desktop/gnome/keybindings/custom1/action' --type string 'gnome-terminal --working-directory=$HOME --geometry 110x35'
# gconftool --set '/desktop/gnome/keybindings/custom1/binding' --type string '<Mod4>t'

## To use ibus in Emacs
cat >> ${HOME}/.Xresources <<EOF
# To use ibus in Emacs
Emacs*useXIM: false
EOF




