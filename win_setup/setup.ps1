$ErrorActionPreference = 'Stop'; # stop on all errors

$ExitCode = @{
  Success = 0
  FailToInstallChocolatey = 1
}

$chocolateyUrl = 'https://chocolatey.org/install.ps1'
$installScript = 'install.ps1'

# Download chocolatey install script
try {
  $res = Invoke-WebRequest -Uri $chocolateyUrl -OutFile $installScript
} catch [System.Net.WebException] {
  $ex = $_.Exception
  #$ex | ConvertTo-Json
  if ($ex.Response.StatusCode -eq 407) {
    Write-Error 'Proxy configuration is required.'
  } else {
    Write-Error 'Fail to fetch a chocolatey install script.'
    exit $ExitCode.FailToInstallChocolatey
  }
}
