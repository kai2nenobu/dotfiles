Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop';  # stop on all errors
#$DebugPreference = 'Continue'

class Synchronizable {
  [string] RootDir() {
    if (${env:SYNCHRONIZE_ROOT}) {
      return ${env:SYNCHRONIZE_ROOT}
    } else {
      return "${env:USERPROFILE}\.sync"
    }
  }

  [string] RelativeDir($relativePath) {
    return Join-Path $this.RootDir() $relativePath
  }

  Export() {
    throw [System.NotImplementedException]::new('export not implemented')
  }

  Import() {
    throw [System.NotImplementedException]::new('import not implemented')
  }
}

class GoogleImeSync : Synchronizable {
  # 同期するファイル名
  [string[]] $Files = 'boundary.db', 'cform.db', 'config1.db', 'segment.db', 'user_dictionary.db'
  # 同期側ディレクトリ
  [string] $Sync = $this.RelativeDir('Google Japanese Input')
  # ローカル配置ディレクトリ
  [string] $Local = (Join-Path ${env:USERPROFILE} 'AppData\LocalLow\Google\Google Japanese Input')

  Export() {
    # TODO: Google IMEを停止する
    if (!(Test-Path -Path $this.Sync)) {
      New-Item $this.Sync -ItemType Directory
    }
    Copy-Item -Force -Path ($this.Local + '\*') -Include $this.Files -Destination $this.Sync
  }

  Import() {
    # TODO: Google IMEを停止する
    if (!(Test-Path -Path $this.Local)) {
      New-Item $this.Local -ItemType Directory
    }
    Copy-Item -Force -Path ($this.Sync + '\*') -Include $this.Files -Destination $this.Local
  }

}

function ExportAll() {
  $Synchronizers = @([GoogleImeSync]::new())
  foreach ($Sync in $Synchronizers) {
    $Sync.Export()
  }
}

function ImportAll() {
  $Synchronizers = @([GoogleImeSync]::new())
  foreach ($Sync in $Synchronizers) {
    $Sync.Import()
  }
}

ExportAll
#ImportAll
