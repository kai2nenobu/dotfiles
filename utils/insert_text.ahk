;;;; Insert text via clipboard

SetTitleMatchMode, 2 ; Partial match with window title

cb_bk = %ClipboardAll%
Clipboard = %1%
Sleep, 100

;; paste to an active window
If (WinActive("emacs") && WinActive("ahk_exe vcxsrv.exe")) {
    Send, ^y
} Else If(WinActive("ahk_exe powershell.exe")) {
    Send, !{Space}ep
} Else {
    Send, ^v
}

Sleep, 100
Clipboard = %cb_bk%
