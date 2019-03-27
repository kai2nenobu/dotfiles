@if (@X)==(@Y) @end /* Harmless hybrid line that begins a JScript comment

::--- Batch section within JScript comment that calls the internal JScript ----
@echo off
cscript //E:JScript //nologo "%~f0" %*
AutoHotkey.exe "%~p0\focus-wsl-emacs.ahk"
exit /b

----- End of JScript comment, beginning of normal JScript  ------------------*/
var ws = new ActiveXObject("Wscript.Shell");
var arg = WScript.Arguments.Item(0);
var commandLine = '"emacsclient ' + '\\"$(wslpath -ua \'' + arg + '\')\\""';
// Launch emacsclient in WSL
ws.run('wsl bash -c ' + commandLine, 0, false);
