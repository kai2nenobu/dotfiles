@if (@X)==(@Y) @end /* Harmless hybrid line that begins a JScript comment

::--- Batch section within JScript comment that calls the internal JScript ----
@echo off
cscript //E:JScript //nologo "%~f0" %*
exit /b

----- End of JScript comment, beginning of normal JScript  ------------------*/
var ws = new ActiveXObject("Wscript.Shell");
var command = 'wsl bash -l -c "xset -r 49 && exec';
for (var i = 0; i < WScript.Arguments.Count(); i++) {
  command += (' ' + WScript.Arguments(i));
}
command += '"';

// Launch command in WSL
ws.run(command, 0, false);
