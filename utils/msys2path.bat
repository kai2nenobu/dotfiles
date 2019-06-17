@echo off

set LOCAL_MSYS2_PATH=C:\tools\msys64\mingw64\bin;C:\tools\msys64\usr\bin

if "%1" equ "enable" (
  goto enable
) else if "%1" equ "disable" (
  goto disable
)
goto usage

:usage
echo Enable or disable MSYS2 PATH in this session
echo.
echo Usage:
echo   %0 [enable ^| disable]
goto end

:enable
REM Append MSYS2 PATH
echo Enable MSYS2 (%LOCAL_MSYS2_PATH%)
set PATH=%PATH%;%LOCAL_MSYS2_PATH%
goto end

:disable
REM Remove MSYS2 PATH from PATH variable
echo Disable MSYS2 (%LOCAL_MSYS2_PATH%)
call set PATH=%%PATH:;%LOCAL_MSYS2_PATH%=%%
goto end

:end
set LOCAL_MSYS2_PATH=
