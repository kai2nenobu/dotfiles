Set-StrictMode -Version Latest


### Utilties

function Msys2-Path {
  <#
  .SYNOPSIS
  Enable or Disable MSYS2
  #>
  [CmdletBinding()]
  Param(
    [switch]$Enable,
    [switch]$Disable,
    [switch]$Prepend=$false
  )
  $local_msys2_path='C:\tools\msys64\mingw64\bin;C:\tools\msys64\usr\bin'
  if (-not ($Enable -xor $Disable)) {
    Write-Error('Specify one of "-Enable" or "-Disable".')
    return
  }
  if ($Enable) {
    if ($Prepend) {
      $env:PATH = $local_msys2_path + ';' + $env:PATH
    } else {
      $env:PATH = $env:PATH + ';' + $local_msys2_path
    }
    'Enable MSYS2 PATH!'
  }
  if ($Disable) {
    $regex = ';?' + [regex]::Escape($local_msys2_path) + ';?'
    $env:PATH = $env:PATH -replace $regex,''
    'Disable MSYS2 PATH!'
  }
}

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
# Don't save space-prefixed commands. ref: https://github.com/PowerShell/PowerShell/issues/10403#issuecomment-523833700
Set-PSReadLineOption -AddToHistoryHandler {
  param($line)
  $line -notmatch '^\s+|AsPlainText'
}

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

function navi_snippet {
  $commandLine = (navi --print)
  [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt() # Rewrite Prompt
  if (-not [string]::IsNullOrEmpty($commandLine)) {
    [Microsoft.PowerShell.PSConsoleReadLine]::Insert($commandLine)
  }
}
Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+n' -ScriptBlock { navi_snippet }

function ghq_set_location {
  ghq list --full-path `
    | Invoke-Fzf -Layout reverse -Info inline -Height 20 -Exit0 `
    | %{ Set-Location -LiteralPath $_ }
  [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine() # Rewrite Prompt
}

function directory_set_location {
  <#
  .SYNOPSIS
  ghqとpcdのディレクトリ一覧から選択したディレクトリに移動する。
  #>
  $ghq_dirs = @(ghq list --full-path)
  $pcd_dirs = @(Get-Content "$env:USERPROFILE\.fzf-cd")
  $ghq_dirs + $pcd_dirs | Invoke-Fzf -Layout reverse -Info inline -Height 20 -Exit0 `
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
  Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+d' -ScriptBlock { directory_set_location }
  Set-PSReadLineKeyHandler -Key 'Ctrl+Spacebar' -ScriptBlock { Invoke-FzfTabCompletion }
}

fzf_integration

# Import-Module posh-git
# Import-Module oh-my-posh
# Set-Theme Paradox

## Enable starship
Get-Command -ea SilentlyContinue starship > $null `
  && Invoke-Expression (&starship init powershell)

# パイプのエンコーディングをUTF-8にする
# ref. https://news.mynavi.jp/itsearch/article/hardware/5170
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Set-StrictMode -Off
