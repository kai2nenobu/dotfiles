Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop';  # stop on all errors
#$DebugPreference = 'Continue'

$ExitCodes = @{
  Success = 0
  FailToInstallChocolatey = 11
}

$proxy = @{
  Url = $null
  User = $null
  Password = $null
  PlainPassword = $null
}

$chocolateyUrl = 'http://chocolatey.org/install.ps1'
$webClient = New-object System.Net.WebClient
$installScript = $null

# Download a chocolatey install script
try {
  $installScript = $webClient.DownloadString($chocolateyUrl)
} catch [System.Net.WebException] {
  $ex = $_.Exception
  #$ex | ConvertTo-Json
  if ($ex.Response.StatusCode -eq 407) {
    Write-Warning 'Proxy configuration is required.'
    # Detect or input proxy location
    $SystemProxy = [System.Net.WebRequest]::GetSystemWebProxy()
    $effectiveProxy = $SystemProxy.GetProxy($chocolateyUrl)
    $effectiveProxy | Format-List | Out-String | Write-Debug
    if ($effectiveProxy) {
      $proxy.Url = $effectiveProxy.AbsoluteUri
    } else {
      $proxy.Url = Read-Host 'Input proxy URL (like http://proxy.example.com:8080)'
    }
    $proxy.User = Read-Host "Input user for $($proxy.Url) (if required)"
    $proxy.Password = Read-Host -AsSecureString "Input user for $($proxy.Url) (if required)"
    if ($proxy.Password) {
      $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($proxy.Password)
      $proxy.PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    $proxy.GetEnumerator() | Where-Object { $_.Name -ne "PlainPassword" } | Format-Table | Out-String | Write-Debug
    # Retry download
    $webProxy = New-Object System.Net.WebProxy $proxy.Url
    if ($proxy.User) {
      $webProxy.Credentials = New-Object System.Management.Automation.PSCredential $proxy.User, $proxy.Password
    }
    $webClient.Proxy = $webProxy
    $installScript = $webClient.DownloadString($chocolateyUrl)
  } else {
    Write-Error -ErrorAction Continue 'Fail to fetch a chocolatey install script.'
    exit $ExitCodes.FailToInstallChocolatey
  }
}

# Verify a chocolate install script
if (-not $installScript) {
  Write-Error -ErrorAction Continue 'chocolatey install script is empty. Something wrong.'
  exit $ExitCodes.FailToInstallChocolatey
}

# Install chocolatey
if ($proxy.Url) {
  $env:chocolateyProxyLocation = $proxy.Url
}
if ($proxy.User) {
  $env:chocolateyProxyUser = $proxy.User
  $env:chocolateyProxyPassword = $proxy.PlainPassword
}
Set-ExecutionPolicy Bypass -Scope Process -Force
Invoke-Expression $installScript

exit $ExitCodes.Success
