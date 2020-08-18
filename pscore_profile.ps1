Set-StrictMode -Version Latest

Set-PSReadLineOption -EditMode Emacs
Set-PSReadLineOption -HistoryNoDuplicates:$True

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

function ghq_set_location {
  ghq list --full-path `
    | Invoke-Fzf -Info inline -Height 20 -Exit0 `
    | %{ Set-Location -LiteralPath $_ }
  [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt() # Rewrite Prompt
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

Set-StrictMode -Off
