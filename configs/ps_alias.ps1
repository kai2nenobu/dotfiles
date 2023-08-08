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

$_customCaVariables = @(
  'AWS_CA_BUNDLE',
  'REQUESTS_CA_BUNDLE',
  'CURL_CA_BUNDLE'
)

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
  foreach ($var in $_customCaVariables) {
    Set-Item "env:${var}" $CustomCert
  }
}

function Disable-Proxy {
  $env:http_proxy = ''
  $env:https_proxy = ''
  $env:no_proxy = ''
  $PSDefaultParameterValues = @{}
  # Custom certificate
  foreach ($var in $_customCaVariables) {
    Set-Item "env:${var}" ''
  }
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
  column = @();
  diff = @();
  find = @();
  grep = @('--color');
  head = @();
  od = @();
  sed = @();
  sort = @();
  tail = @();
  vim = @();
}
$tool_hash.Keys | ForEach-Object {
  ## エイリアスがあれば削除する
  Get-Command -ea SilentlyContinue $_ -CommandType Alias | ForEach-Object { Remove-Item -Force "alias:$_" }
  ## 動的に関数定義
  Set-Item -Path "function:global:$_" -Value {
    $name = $MyInvocation.MyCommand.Name  # 関数名を取得する
    $exe = "${GIT_DIR}\usr\bin\${name}.exe"
    $opts = $tool_hash[$name]
    $has_input = $input.MoveNext()
    # 標準入力のあるなしで分岐
    if ($has_input) {
      $input.Reset() # reset an enumerator position to the beginning
      $input | &$exe @opts $args
    } else {
      # no input
      &$exe @opts $args
    }
  }
}

# zoxide integration
if (Get-Command -ea SilentlyContinue zoxide) {
  Invoke-Expression (& { $hook = if ($PSVersionTable.PSVersion.Major -ge 6) { 'pwd' } else { 'prompt' } (zoxide init powershell --hook $hook) -join "`n" })
}

# exa integration
if (Get-Command -ea SilentlyContinue exa) {
  Get-Item alias:ls -ea SilentlyContinue | Remove-Item
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

if (Get-Command -ea SilentlyContinue just) {
  # 補完を有効にする
  Invoke-Expression (just --completions powershell | Out-String)
  # ユーザレベルのjustfileを実行する
  # https://just.systems/man/en/chapter_66.html
  function justu () {
    just --justfile "${env:HOME}/.user.justfile" --working-directory . $args
  }
}

# aws-vault integration
if (get-command -ea SilentlyContinue aws-vault -CommandType Application -TotalCount 1) {
  Set-Alias av aws-vault
}
# AWS CLI completion (https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-completion.html)
if (Get-Command -ea SilentlyContinue aws_completer) {
  Register-ArgumentCompleter -Native -CommandName aws -ScriptBlock {
    param($commandName, $wordToComplete, $cursorPosition)
      $env:COMP_LINE=$wordToComplete
      if ($env:COMP_LINE.Length -lt $cursorPosition){
        $env:COMP_LINE=$env:COMP_LINE + " "
      }
      $env:COMP_POINT=$cursorPosition
      aws_completer.exe | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
      }
      Remove-Item Env:\COMP_LINE
      Remove-Item Env:\COMP_POINT
  }
}


function docker-aws() {
  <#
  .SYNOPSIS
    Execute AWS CLI in docker container (Use aws-vault to pass credentials to a container)
  #>
  if ($env:AWS_PROFILE) {
    $prof = $env:AWS_PROFILE
    $command_args = $Args
  }
  if ($Args -contains '--profile') {
    # read "--profile" option from arguments and remove it
    $this_is_profile = $false
    $command_args = [System.Collections.ArrayList]::new()
    foreach ($arg in $Args) {
      if ($arg -eq '--profile') {
        # next arg is a profile name
        $this_is_profile = $true
        continue
      }
      if ($this_is_profile) {
        $prof = $arg
        $this_is_profile = $false
        continue
      } else {
        [void]$command_args.Add($arg)
      }
    }
  }
  if (-not $prof) {
    Write-Error -ea Stop "Profile isn't specified!"
  }
  aws-vault exec $prof -- `
    docker run --rm -it ('REGION','ACCESS_KEY_ID','SECRET_ACCESS_KEY','SESSION_TOKEN' | % { '-e',"AWS_$_" }) amazon/aws-cli $command_args
}
