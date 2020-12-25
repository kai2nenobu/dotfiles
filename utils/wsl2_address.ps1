
$ethName = 'vEthernet (WSL)'
$ruleName = 'WSL'
$hostAddress = '172.22.222.2'
$hostNetMask = '255.255.255.0'
$brAddress = '172.22.222.255'
$wslAddress = '172.22.222.22/24'

# ユーザー環境変数にWSL_GATEWAYを設定
[Environment]::SetEnvironmentVariable('WSL_GATEWAY', "$hostAddress", 'User')
# WSL仮想アダプターのIPアドレス設定
netsh interface ip add address  "$ethName" "$hostAddress" "$hostNetMask"
# WSLディストリのIPアドレス設定
wsl -u root ip addr add "$wslAddress" broadcast "$brAddress" dev eth0 label 'eth0:1'
# ファイアウォールの許可設定
New-NetFirewallRule -DisplayName "$ruleName" -Direction Inbound -InterfaceAlias "$ethName" -Action Allow
