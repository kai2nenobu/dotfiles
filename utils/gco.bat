@echo off

::: Select a git branch and check out it
for /f "usebackq tokens=1 delims=" %%i in (`git branch ^| cut --bytes=3- ^| fzf --prompt "Choose branch: " -0 -1`) do @git checkout "%%i"
