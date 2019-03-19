@if (@X)==(@Y) @end /* Harmless hybrid line that begins a JScript comment

::--- Batch section within JScript comment that calls the internal JScript ----
@echo off
cscript //E:JScript //nologo "%~f0" %*
exit /b

----- End of JScript comment, beginning of normal JScript  ------------------*/
var ws = new ActiveXObject("Wscript.Shell");
// Launch emacs in WSL
ws.run('wsl bash -l -c "export DISPLAY=0:0 && xset -r 49 && exec emacs -r"', 0, false);
