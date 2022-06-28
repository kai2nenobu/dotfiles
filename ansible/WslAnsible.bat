@echo off
setlocal enabledelayedexpansion

REM
REM Ansible PlaybookをWSLで実行する
REM
REM 前提条件
REM - Windows 10 Pro / Windows Server 2019以上
REM - バージョン1803以上

set HERE=%~dp0

REM エクスプローラからの起動（ダブルクリック）を検知する
echo "%cmdcmdline%" | findstr /I /C:"cmd.exe /c" >NUL
if %ERRORLEVEL% equ 0 (
    set LAUNCH_FROM_EXPLORER=true
)

REM wsl.exe を使う場合（既定のディストリで実行するよ）
wsl.exe bash -c "cd $(wslpath -ua '%HERE%'); export PATH=\"${HOME}/.local/bin:${HOME}/.poetry/bin:$PATH\"; export ANSIBLE_LOG_PATH=./logs/ansible.$(date +%%Y%%m%%d_%%H%%M%%S).log; LANG=ja_JP.UTF-8 poetry run task apply %*"

REM LxRunOffline を使う場合（-n で指定したディストリで実行するよ）
REM LxRunOffline.exe run -n Ubuntu-18.04 -c "cd $(wslpath -ua '%USERPROFILE%\repo\setupper\ansible'); ansible-playbook -vvv -i hosts config.yml"

if defined LAUNCH_FROM_EXPLORER (
    REM バッチを終了する前に待機する
    set /p=ENTERで閉じます...
)

endlocal
