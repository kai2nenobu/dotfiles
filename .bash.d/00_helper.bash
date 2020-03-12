### Helper Functions


## 指定されたコマンドをPATHから探す。
## コマンドが見つかったら正常終了、
## コマンドが見つからなかったら以上終了する。
function _find_command() {
  which "$1" &> /dev/null
}

## ターミナルがWindows Terminalかどうか判定する。
## Windows Terminalの場合正常終了、
## Windows Terminalではない異常終了する。
function _inside_windows_terminal() {
  [ -n "$WT_SESSION" ]
}
