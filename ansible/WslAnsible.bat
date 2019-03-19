@echo off

REM
REM Ansible PlaybookをWSLで実行する
REM
REM 前提条件
REM - Windows 10 Pro以上
REM - バージョン1803以上

set HERE=%~dp0

wslconfig /s "Debian"
REM wsl.exe を使う場合（既定のディストリで実行するよ）
wsl.exe bash -c "cd $(wslpath -ua '%HERE%'); ansible-playbook -vvv -i hosts config.yml %*"
wslconfig /s "Ubuntu-18.04"

REM LxRunOffline を使う場合（-n で指定したディストリで実行するよ）
REM LxRunOffline.exe run -n Ubuntu-18.04 -c "cd $(wslpath -ua '%USERPROFILE%\repo\setupper\ansible'); ansible-playbook -vvv -i hosts config.yml"

set /p=ENTERで閉じます...
