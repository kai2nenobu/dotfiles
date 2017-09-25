@echo off

rem
rem プロジェクトをセットアップするスクリプト
rem   > sudo .setup.bat
rem

cd /d %~dp0


rem フックスクリプトのシンボリックリンクを作成する

set PRE_COMMIT_HOOK=.git\hooks\pre-commit

IF EXIST %PRE_COMMIT_HOOK% ( del %PRE_COMMIT_HOOK% )
mklink %PRE_COMMIT_HOOK% ..\..\hooks\pre-commit
