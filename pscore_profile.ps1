Set-PSReadLineOption -EditMode Emacs

function Enable-Proxy {
  $url = 'http://localhost:8888'
  $env:http_proxy = $url
  $env:https_proxy = $url
  $env:no_proxy = 'localhost'
  $PSDefaultParameterValues = @{ "*:Proxy"=$url }
}

function Disable-Proxy {
  $env:http_proxy = ''
  $env:https_proxy = ''
  $env:no_proxy = ''
  $PSDefaultParameterValues = @{}
}
