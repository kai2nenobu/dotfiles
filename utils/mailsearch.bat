@echo off
setlocal enabledelayedexpansion

@REM Save an original code page and use Unicoe code page
for /f "tokens=2 delims=:" %%p in ('chcp') do (
    set active_cp=%%p
)
chcp 65001 > nul

set text=
for /f "usebackq tokens=1 delims=" %%i in (`type "%USERPROFILE%\.mailcap" ^| fzf --multi --header "アドレスを選択してください"`) do (
    set "address=%%i"
    REM escape special characters
    set "address=!address:<=^<!"
    set "address=!address:>=^>!"
    set "address=!address:;=^;!"
    if "!text!"=="" ( set "text=!address!" ) else ( set "text=!text!;!address!" )
)
if not "!text!"=="" echo !text! | clip
chcp %active_cp% > nul
endlocal
