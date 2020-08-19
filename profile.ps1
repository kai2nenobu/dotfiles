Set-PSReadLineOption -EditMode Emacs
Set-PSReadLineOption -HistoryNoDuplicates:$True

## Load aliases
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here 'ps_alias.ps1')

## Windowws Terminal
if ($env:WT_SESSION) {
  $OutputEncoding = [Text.Encoding]::UTF8
  'Use utf-8 in only Windows Terminal'
}

<# PSFzf Integartion #>
Import-Module PSFzf -ArgumentList 'Ctrl+t','Ctrl+r'

<# Git for Windows #>
$gitPath = 'C:\Program Files\Git'
if (Test-Path $gitPath) {
  "Found Git for Windows at ${gitPath}"
  $env:PATH = "${env:PATH};${gitPath}\usr\bin"
}

"Read a profile from `"$profile`""

# Chocolatey profile
$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
  Import-Module "$ChocolateyProfile"
}
