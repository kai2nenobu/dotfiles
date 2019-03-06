@echo off

if "%1" equ "add" (
  if "%~2" neq "" (
    echo %~2 >> "%USERPROFILE%\.peco-cd"
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
  "%EDITOR%" "%USERPROFILE%\.peco-cd"
  goto end
)
notepad "%USERPROFILE%\.peco-cd"
goto end

:query
rem NOTE:
rem
rem If you have a problem caused by character-set, modify below part like:
rem   'type ^"%USERPROFILE%\.peco-cd^" ^| iconv -f char -t utf-8 ^| peco'
rem
for /f "delims=" %%i in ('type ^"%USERPROFILE%\.peco-cd^" ^| peco') do (
  cd "%%i"
  break
)

:end
