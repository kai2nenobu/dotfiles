@echo off

REM
REM Ansible Playbook��WSL�Ŏ��s����
REM
REM �O�����
REM - Windows 10 Pro�ȏ�
REM - �o�[�W����1803�ȏ�

set HERE=%~dp0

wslconfig /s "Debian"
REM wsl.exe ���g���ꍇ�i����̃f�B�X�g���Ŏ��s�����j
wsl.exe bash -c "cd $(wslpath -ua '%HERE%'); ansible-playbook -vvv -i hosts config.yml %*"
wslconfig /s "Ubuntu-18.04"

REM LxRunOffline ���g���ꍇ�i-n �Ŏw�肵���f�B�X�g���Ŏ��s�����j
REM LxRunOffline.exe run -n Ubuntu-18.04 -c "cd $(wslpath -ua '%USERPROFILE%\repo\setupper\ansible'); ansible-playbook -vvv -i hosts config.yml"

set /p=ENTER�ŕ��܂�...
