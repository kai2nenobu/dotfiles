
$chocolateyUrl = 'https://chocolatey.org/install.ps1'

try {
  $res = Invoke-WebRequest -Uri $chocolateyUrl
} catch [System.Net.WebException] {
  $ex = $_.Exception
  $ex | ConvertTo-Json
  Write-Error 'Fail to fetch a chocolatey install script.'
}
