function // { # Define a nop function
  param($nop)
  { // } > $null
  return
}
// <# Call an embedded powershell from JScript

var ws = WScript.CreateObject('Wscript.Shell');
var hideWindow = 0;
var waitExit = true;
var command = 'powershell -NoProfile -File "' + WScript.ScriptFullName + '"';
var exitCode = ws.run(command, hideWindow, waitExit);
WScript.Quit(exitCode);

/* Start of JScript comment
#>
Remove-Item -Path Function:\//  # Remove a nop function
#### Start of powershell script

## Clear ssh-agent identities
##
## > schtasks /create /tn "Clear ssh-agent identities" /tr "wscript /NoLogo /E:JScript c:\path\to\clear_ssh_key.ps1" /sc daily /st 09:00:00

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function log {
  param(
    [Parameter(ValueFromPipeline=$true,Mandatory=$true)]
    [string]$message
  )
  $logFile = "${env:TEMP}\clear_ssh_identities.log"
  $timestamp = Get-Date -Format "o"
  "[{0}] {1}" -f $timestamp,$message | Out-File -Append $logFile
}

$addCommand = 'C:\Windows\System32\OpenSSH\ssh-add.exe'

if (-not (Test-Path -LiteralPath $addCommand)) {
  log ("ssh-add command not found at {0}" -f $addCommand)
  exit 1
}

$listProcess = (Start-Process $addCommand -ArgumentList '-l' -NoNewWindow -Wait -PassThru)
if ($listProcess.ExitCode -ne 0) {
  log "The agent has no identities."
} else {
  Start-Process $addCommand -ArgumentList '-D' -NoNewWindow -Wait
  log "All identities removed."
}

#### End of powershell script
# End of JScript comment */
