@echo off

set http_proxy=http://localhost:8888
set https_proxy=http://localhost:8888

REM Bypass docker machine ip
where docker-machine > nul
if %ERRORLEVEL% equ 0 (
    docker-machine start
    for /f "tokens=*" %%i in ('docker-machine ip') do (
        if defined no_proxy (
            set no_proxy=%%i,%no_proxy%
        ) else (
            set no_proxy=%%i
        )
    )
)
