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
  grep = @('--color');
  head = @()
  tail = @()
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
