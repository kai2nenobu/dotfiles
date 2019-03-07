@echo off

if "%1" equ "add" (
  if "%~2" neq "" (
    echo %~2>> "%USERPROFILE%\.fzf-cd"
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
  "%EDITOR%" "%USERPROFILE%\.fzf-cd"
  goto end
)
notepad "%USERPROFILE%\.fzf-cd"
goto end

:query
rem NOTE:
rem
rem If you have a problem caused by character-set, modify below part like:
rem   'type ^"%USERPROFILE%\.fzf-cd^" ^| iconv -f char -t utf-8 ^| fzf'
rem
for /f "delims=" %%i in ('type ^"%USERPROFILE%\.fzf-cd^" ^| iconv -f cp932 -t utf-8 ^| fzf ^| iconv -f utf-8 -t cp932') do (
  cd /d "%%i"
  break
)

:end
