Set-StrictMode -Version Latest

function remove_win_ps_modules {
  <#
  .SYNOPSIS
  Remove Windows Powershell Module paths from PSModulePATH environment variable
  #>
  $newPath = $env:PSModulePATH -split ';',"`n" | where { $_ -notmatch "WindowsPowerShell" } | Join-String -Separator ';'
  $env:PSModulePATH = $newPath
}
remove_win_ps_modules

Set-PSReadLineOption -EditMode Emacs
Set-PSReadLineOption -HistoryNoDuplicates:$True

## Load aliases
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here 'ps_alias.ps1')

function Enable-Proxy {
  $url = 'http://localhost:8888'
  $env:http_proxy = $url
  $env:https_proxy = $url
  $env:no_proxy = 'localhost'
  $PSDefaultParameterValues = @{ "*:Proxy"=$url }
}

function Disable-Proxy {
  $env:http_proxy = ''
  $env:https_proxy = ''
  $env:no_proxy = ''
  $PSDefaultParameterValues = @{}
}

function fd_insert_file {
  $file = fd | fzf --prompt "Choose file: " --exit-0
  [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt() # Rewrite Prompt
  if (-not [string]::IsNullOrEmpty($file)) {
    [Microsoft.PowerShell.PSConsoleReadLine]::Insert($file)
  }
}
Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+f' -ScriptBlock { fd_insert_file }

function pet_insert {
  $commandLine = (pet search)
  [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt() # Rewrite Prompt
  if (-not [string]::IsNullOrEmpty($commandLine)) {
    [Microsoft.PowerShell.PSConsoleReadLine]::Insert($commandLine)
  }
}
Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+p' -ScriptBlock { pet_insert }

function ghq_set_location {
  ghq list --full-path `
    | Invoke-Fzf -Layout reverse -Info inline -Height 20 -Exit0 `
    | %{ Set-Location -LiteralPath $_ }
  [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine() # Rewrite Prompt
}

function fzf_integration {
  $psFzfModule = (Get-Module -ListAvailable PSFzf)
  if (-not $psFzfModule) {
    return # Nothing to do
  }
  "Use PSFzf ({0})" -f $psFzfModule.Path
  Import-Module $psFzfModule
  Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+t' -PSReadlineChordReverseHistory 'Ctrl+r'
  Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+g' -ScriptBlock { ghq_set_location }
}

fzf_integration

Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Paradox

Set-StrictMode -Off
