@echo off
setlocal enabledelayedexpansion

set "cdfile=%USERPROFILE%\.fzf-cd"

if "%1" equ "add" (
  if "%~2" neq "" (
    echo %~2>> "%cdfile%"
    goto end
  )
  goto usage
)
if "%1" equ "edit" (
  goto edit
)
if "%1" neq "" (
  goto usage
)
goto query

:usage
echo %0 [add PATH ^| edit]
goto end

:edit
if "%EDITOR%" neq "" (
  "%EDITOR%" "%cdfile%"
  goto end
)
notepad "%cdfile%"
goto end

:query
rem NOTE:
rem
rem If you have a problem caused by character-set, modify below part like:
rem   'type ^"%cdfile%^" ^| iconv -f char -t utf-8 ^| fzf'
rem
for /f "delims=" %%i in ('type ^"%cdfile%^" ^| fzf --prompt "Choose directory: " -0 -1') do (
  rem End local here to change current directory
  endlocal
  cd /d "%%i"
  break
)

:end
