;;; Win+s : Launch cmd as Administrator
#s::Run, powershell -NoProfile -Command "Start-Process cmd -Verb runas"

;;; Win+Ctrl+u : Update all chocolatey packages
^#u::Run, powershell -NoProfile -Command "Start-Process cmd -ArgumentList /K`,choco`,upgrade`,-y`,all -Verb runas"

;;; Ctrl+F12
^F12::Run, cmd /C "start /MAX powershell -File %USERPROFILE%\utils\PetWindow.ps1 -NoLogo -ExecutionPolicy RemoteSigned -NoProfile"
