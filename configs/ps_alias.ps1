<# Utilities #>
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

function Enable-Proxy {
  [CmdletBinding()]
  Param(
    [string]$CustomCert=''
  )
  $url = 'http://localhost:8888'
  $env:http_proxy = $url
  $env:https_proxy = $url
  $env:no_proxy = '127.0.0.1,localhost,kubernetes.docker.internal'
  $PSDefaultParameterValues = @{ "*:Proxy"=$url }
  # Custom certificate
  $env:AWS_CA_BUNDLE = $CustomCert
  $env:REQUESTS_CA_BUNDLE = $CustomCert
  $env:CURL_CA_BUNDLE = $CustomCert
}

function Disable-Proxy {
  $env:http_proxy = ''
  $env:https_proxy = ''
  $env:no_proxy = ''
  $PSDefaultParameterValues = @{}
  # Custom certificate
  $env:AWS_CA_BUNDLE = ''
  $env:REQUESTS_CA_BUNDLE = ''
  $env:CURL_CA_BUNDLE = ''
}

<# Alias configuration #>

# git
Set-Alias g git
function gs() {
  git status --short --branch $args
}
function gst() {
  git stash $args
}
#function gl() {
#  git log $args
#}
function gla() {
  git log --decorate --graph --all $args
}
function glo() {
  git log --decorate --graph --all --oneline $args
}
function gd() {
  git diff --histogram $args
}
#function gc() {
#  git commit $args
#}
function ga() {
  git add $args
}
function gco() {
  git checkout $args
}
function gb() {
  git branch $args
}
#function gp() {
#  git pull $args
#}
function gn() {
  git now --all --stat $args
}
function gam() {
  git commmit --amend --no-edit $args
}

# docker
Set-Alias d docker
Set-Alias dc docker-compose
Set-Alias dm docker-machine
Set-Alias kc kubectl

# Terraform
Set-Alias tf terraform

## Unix tools
$GIT_DIR = 'C:\Program Files\Git'
# コマンド名とオプションの連想配列
$tool_hash = @{
  find = @();
  grep = @('--color');
  head = @();
  sed = @();
  tail = @();
}
$tool_hash.Keys | ForEach-Object {
  ## 動的に関数定義
  Set-Item -Path "function:global:$_" -Value {
    $name = $MyInvocation.MyCommand.Name  # 関数名を取得する
    $exe = "${GIT_DIR}\usr\bin\${name}.exe"
    $opts = $tool_hash[$name]
    $input | & $exe @opts $args
  }
}

# zoxide integration
if (Get-Command -ea SilentlyContinue zoxide) {
  Invoke-Expression (& { $hook = if ($PSVersionTable.PSVersion.Major -ge 6) { 'pwd' } else { 'prompt' } (zoxide init powershell --hook $hook) -join "`n" })
}

# exa integration
if (Get-Command -ea SilentlyContinue exa) {
  Remove-Item alias:ls
  Set-Alias -Name ls -Value exa
  function l() {
    exa -aF $args
  }
  function lt() {
    exa -aF --tree --icons $args
  }
  function ll() {
    exa -alhF --icons $args
  }
}
