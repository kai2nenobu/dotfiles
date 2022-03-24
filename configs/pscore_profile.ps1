#Set-StrictMode -Version Latest


### Utilties

function remove_win_ps_modules {
  <#
  .SYNOPSIS
  Remove Windows Powershell Module paths from PSModulePATH environment variable
  #>
  $newPath = $env:PSModulePATH -split ';',"`n" | where { $_ -notmatch "WindowsPowerShell" } | Join-String -Separator ';'
  $env:PSModulePATH = $newPath
}
remove_win_ps_modules

## PSReadLine
Set-PSReadLineOption -EditMode Emacs
Set-PSReadLineKeyHandler -Key "Ctrl+/" -Function Undo
Set-PSReadLineKeyHandler -Key "Ctrl+i" -Function Complete
Set-PSReadLineOption -HistoryNoDuplicates:$True
# Don't save space-prefixed commands. ref: https://github.com/PowerShell/PowerShell/issues/10403#issuecomment-523833700
Set-PSReadLineOption -AddToHistoryHandler {
  param($line)
  $line -notmatch '^\s+|AsPlainText'
}
if ((Get-Module -Name PSReadLine).Version -ge [System.Version]"2.1.0") {
  # https://docs.microsoft.com/en-us/powershell/scripting/whats-new/what-s-new-in-powershell-72?view=powershell-7.2#psreadline-21-predictive-intellisense
  # fish風のオートサジェスト機能を有効にする
  Set-PSReadLineOption -PredictionSource History
}

## Load aliases
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here 'ps_alias.ps1')

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

function _navi_widget {
  $in = $null
  [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$in, [ref]$null)
  if ([string]::IsNullOrEmpty($in)) {
    $last_command = ""
  } else {
    $last_command = ("$in" | navi fn widget::last_command) -join ""
  }
  if ([string]::IsNullOrEmpty($last_command)) {
    $output = (navi --print)
  } else {
    $find = "${last_command}_NAVIEND"
    $replacement = (navi --print --query "$last_command")
    $output = $in
    if (-not [string]::IsNullOrEmpty($replacement)) {
      $output = "${in}_NAVIEND"
      $output = $output.Replace($find, $replacement)
    }
  }
  [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt() # Rewrite Prompt
  if (-not [string]::IsNullOrEmpty($output)) {
    [Microsoft.PowerShell.PSConsoleReadLine]::Delete(0, $in.Length)
    [Microsoft.PowerShell.PSConsoleReadLine]::Insert($output)
  }
}
Set-PSReadLineKeyHandler -Chord 'Ctrl+x,Ctrl+n' -ScriptBlock { _navi_widget }

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

## Integrate with tfenv
if (Test-Path -LiteralPath "${env:USERPROFILE}/.tfenv/bin/tfenv") {
  function global:terraform {
    # Environment level
    $tfversion = $env:TFENV_TERRAFORM_VERSION
    if (-not $tfversion) {
      # Project level
      $tfversion = Get-Content -ea SilentlyContinue "${PWD}/.terraform-version"
      if (-not $tfversion) {
        # User level
        $tfversion = Get-Content -ea SilentlyContinue "${env:USERPROFILE}/.tfenv/version"
      }
    }
    if ($tfversion) {
      $tf_exec = "${env:USERPROFILE}/.tfenv/versions/${tfversion}/terraform.exe"
    } else {
      # Fallback to the terraform in PATH
      $tf_exec = Get-Command -ea Stop -Name terraform -CommandType Application
    }
    &"$tf_exec" $Args
  }
}

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
