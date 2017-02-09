@echo off

pushd %USERPROFILE%

set DROPBOX_DIR=Dropbox
set CONF_DIR=%DROPBOX_DIR%\program_config

REM remake symbolic link to configuration files.
set CONFS=.bash_aliases .bashrc dot.nodoka .profile .tmux.conf .zsh_aliases .zshrc
for %%c in (%CONFS%) do (
    del %%c
    mklink %%c %CONF_DIR%\%%c
)

REM remake symbolic link to directory
rmdir .keysnail
rmdir .percol.d
rmdir .tmux.d
rmdir .zsh.d
rmdir bin
rmdir org

mklink /d .keysnail %CONF_DIR%\.keysnail
mklink /d .percol.d %CONF_DIR%\.percol.d
mklink /d .tmux.d %CONF_DIR%\.tmux.d
mklink /d .zsh.d %CONF_DIR%\.zsh.d
mklink /d bin %DROPBOX_DIR%\bin
mklink /d org %DROPBOX_DIR%\memo

popd
endlocal
