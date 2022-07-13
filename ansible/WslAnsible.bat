@echo off
setlocal enabledelayedexpansion

REM
REM Ansible Playbook��WSL�Ŏ��s����
REM
REM �O�����
REM - Windows 10 Pro / Windows Server 2019�ȏ�
REM - �o�[�W����1803�ȏ�

set HERE=%~dp0

REM �G�N�X�v���[������̋N���i�_�u���N���b�N�j�����m����
echo "%cmdcmdline%" | findstr /I /C:"cmd.exe /c" >NUL
if %ERRORLEVEL% equ 0 (
    set LAUNCH_FROM_EXPLORER=true
)

REM wsl.exe ���g���ꍇ�i����̃f�B�X�g���Ŏ��s�����j
wsl.exe bash -c "cd $(wslpath -ua '%HERE%'); export PATH=\"${HOME}/.local/bin:${HOME}/.poetry/bin:$PATH\"; export ANSIBLE_LOG_PATH=./logs/ansible.$(date +%%Y%%m%%d_%%H%%M%%S).log; LANG=ja_JP.UTF-8 poetry run task apply %*"

REM LxRunOffline ���g���ꍇ�i-n �Ŏw�肵���f�B�X�g���Ŏ��s�����j
REM LxRunOffline.exe run -n Ubuntu-18.04 -c "cd $(wslpath -ua '%USERPROFILE%\repo\setupper\ansible'); ansible-playbook -vvv -i hosts config.yml"

if defined LAUNCH_FROM_EXPLORER (
    REM �o�b�`���I������O�ɑҋ@����
    set /p=ENTER�ŕ��܂�...
)

endlocal
