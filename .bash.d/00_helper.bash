### Helper Functions
function _find_command() {
  which "$1" &> /dev/null
}

## ターミナルがWindows Terminalかどうか判定する。
## Windows Terminalの場合正常終了、
## Windows Terminalではない異常終了する。
function _inside_windows_terminal() {
  [ -n "$WT_SESSION" ]
}
