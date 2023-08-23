Home := EnvGet("USERPROFILE")

;;; Win+s : Launch cmd as Administrator
#s::Run 'powershell -NoProfile -Command "Start-Process cmd -Verb runas"'

;;; Win+Ctrl+u : Update all chocolatey packages
^#u::Run 'powershell -NoProfile -Command "Start-Process cmd -ArgumentList /K`,choco`,upgrade`,-y`,all -Verb runas"'

;;; Ctrl+F9 : Copy mail address(es)
;^F9::Run 'powershell.exe -NoProfile -NoLogo -ExecutionPolicy RemoteSigned -File ' . Home . '\utils\mailsearch.ps1'
^F9::Run 'cmd /c ' Home '\utils\mailsearch.bat'

;;; Ctrl+F11
;;; Toggle KeePassXC Window
^F11::
{
    if (WinExist("ahk_exe KeePassXC.exe") && WinActive("ahk_exe KeePassXC.exe")) {
        WinMinimize
    } else {
        Run 'C:\Program Files\KeePassXC\KeePassXC.exe'
        Sleep 500
        ;; ロック中ならロック解除する
        if InStr(WinGetTitle("A"), "ロック") {
            Send "+{Enter}"
        }
    }
    Return
}

;;; Ctrl+F12
^F12::Run 'cmd /C "start /MAX powershell -NoProfile -NoLogo -ExecutionPolicy RemoteSigned -File %USERPROFILE%\utils\NaviWindow.ps1"'
