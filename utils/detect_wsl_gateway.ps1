Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$interfaceName = '(WSL)'
$envKey = 'WSL_GATEWAY'

$ip = Get-NetIPAddress -AddressFamily IPv4 `
  | Where-Object { $_.InterfaceAlias -match $interfaceName } `
  | Select-Object -ExpandProperty IPAddress

if ($ip) {
  # Dyanmic IP on WSL2
  [Environment]::SetEnvironmentVariable($envKey, $ip, 'User')
} else {
  # 127.0.0.1 on WSL1
  [Environment]::SetEnvironmentVariable($envKey, '127.0.0.1', 'User')
}
