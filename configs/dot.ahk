EnvGet, ProgramFiles32, ProgramFiles(x86)
EnvGet, ProgramFiles64, ProgramFiles
if (!ProgramFiles32)
    ProgramFiles32 := ProgramFiles64

;;; Win+s : Launch cmd as Administrator
#s::Run, powershell -NoProfile -Command "Start-Process cmd -Verb runas"

;;; Win+Ctrl+u : Update all chocolatey packages
^#u::Run, powershell -NoProfile -Command "Start-Process cmd -ArgumentList /K`,choco`,upgrade`,-y`,all -Verb runas"

;;; Ctrl+F11
^F11::
;;; Toggle KeePassXC Window
    if (WinExist("ahk_exe KeePassXC.exe") && WinActive("ahk_exe KeePassXC.exe")) {
        WinMinimize
    } else {
        Run % ProgramFiles64 . "\KeePassXC\KeePassXC.exe"
        Sleep, 250
        WinGetActiveTitle, active_title
        ;; ロック中ならロック解除する
        if InStr(active_title, "ロック") {
            Send, +{Enter}
        }
    }
    Return

;;; Ctrl+F12
^F12::Run, cmd /C "start /MAX powershell -NoProfile -NoLogo -ExecutionPolicy RemoteSigned -File %USERPROFILE%\utils\PetWindow.ps1"
