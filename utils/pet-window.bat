@echo off

set DIR=%~dp0

rem
rem Search a snippet by pet and insert it.
rem

for /f "usebackq tokens=1 delims=" %%i in (`pet search`) do (
    AutoHotkey "%DIR%\insert_text.ahk" "%%i"
)
