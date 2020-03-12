Set-PSReadLineOption -EditMode Emacs

<# Alias configuration #>
# git
Set-Alias g git
function gs() {
  Start-Process git -ArgumentList status,--short,--branch -NoNewWindow -Wait
}
function gst() {
  Start-Process git -ArgumentList stash -NoNewWindow -Wait
}
#function gl() {
#  Start-Process git -ArgumentList log -NoNewWindow -Wait
#}
function gla() {
  Start-Process git -ArgumentList log,--decorate,--graph,--all -NoNewWindow -Wait
}
function glo() {
  Start-Process git -ArgumentList log,--decorate,--graph,--all,--oneline -NoNewWindow -Wait
}
function gd() {
  Start-Process git -ArgumentList diff,--histogram -NoNewWindow -Wait
}
#function gc() {
#  Start-Process git -ArgumentList commit -NoNewWindow -Wait
#}
function ga() {
  Start-Process git -ArgumentList add -NoNewWindow -Wait
}
function gco() {
  Start-Process git -ArgumentList checkout -NoNewWindow -Wait
}
function gb() {
  Start-Process git -ArgumentList branch -NoNewWindow -Wait
}
#function gp() {
#  Start-Process git -ArgumentList pull -NoNewWindow -Wait
#}
function gn() {
  Start-Process git -ArgumentList now,--all,--stat -NoNewWindow -Wait
}
function gam() {
  Start-Process git -ArgumentList commmit,--amend,--no-edit -NoNewWindow -Wait
}

# docker
Set-Alias d docker
Set-Alias dc docker-compose
Set-Alias dm docker-machine

## Windowws Terminal
if ($env:WT_SESSION) {
  $OutputEncoding = [Text.Encoding]::UTF8
  'Use utf-8 in only Windows Terminal'
}

"Read a profile from `"$profile`""
