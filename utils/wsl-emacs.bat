@if (@X)==(@Y) @end /* Harmless hybrid line that begins a JScript comment

::--- Batch section within JScript comment that calls the internal JScript ----
@echo off
cscript //E:JScript //nologo "%~f0" %*
exit /b

----- End of JScript comment, beginning of normal JScript  ------------------*/
var ws = new ActiveXObject("Wscript.Shell");
var debug = WScript.Arguments.Count() > 0 && (WScript.Arguments(0) === '-d' || WScript.Arguments(0) === '--debug');
// Launch emacs in WSL
if (debug) {
  ws.run('wsl bash -l -c "xset -r 49 && emacs --debug -r"', 3, true);
} else {
  ws.run('wsl bash -l -c "xset -r 49 && exec emacs -r"', 0, false);
}
