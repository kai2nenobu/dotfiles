<# : by earthdiver1
@echo off & setlocal
set "BATFILE=%~df0"
set "PS1FILE=%BATFILE:.bat=.ps1%"
mklink /h "%PS1FILE%" "%BATFILE%" >NUL
set BATCH_ARGS=%*
if defined BATCH_ARGS set BATCH_ARGS=%BATCH_ARGS:"=\"%
if defined BATCH_ARGS set BATCH_ARGS=%BATCH_ARGS:^^=^%
PowerShell -NoProfile -ExecutionPolicy Bypass -Command "%PS1FILE%" %BATCH_ARGS%
del "%PS1FILE%"
endlocal & exit /b
: #>

function main {
  param(
    [Parameter(Mandatory=$true)] [string]$Message,
    [string]$Title = 'Notification!'
  )
  # Refer Windows Runtime
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null
  [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null

  # Read toast template xml as [Windows.Data.Xml.Dom.XmlDocument] object
  $template = @"
<toast>
    <visual>
        <binding template="ToastGeneric">
            <text hint-maxLines="1">${Title}</text>
            <text>${Message}</text>
        </binding>
    </visual>
</toast>
"@

  $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
  $xml.LoadXml($template)

  # Toast notify
  $app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
  $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show($toast)

}

main @Args

# Local Variables:
# mode: powershell
# End:
