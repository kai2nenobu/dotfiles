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
