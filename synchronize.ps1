
Param(
  [Parameter(Mandatory=$True, Position=1)]
  [string]$SubCommand
)

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
  <#
  .DESCRIPTION
  Google 日本語入力の設定を同期するクラス。辞書及びIME設定を同期できる。
  ただし辞書は完全に上書きしてしまうので、同期前の単語は消え去ってしまうことに注意すること。

  ref. https://productforums.google.com/forum/#!topic/ime-ja/ut-s3UFrO88
  #>

  # 同期するファイル名
  [string[]] $Files = 'boundary.db', 'cform.db', 'config1.db', 'segment.db', 'user_dictionary.db'
  # 同期側ディレクトリ
  [string] $Sync = $this.RelativeDir('Google Japanese Input')
  # ローカル配置ディレクトリ
  [string] $Local = (Join-Path ${env:USERPROFILE} 'AppData\LocalLow\Google\Google Japanese Input')

  Export() {
    $this.StopIme()
    if (!(Test-Path -Path $this.Sync)) {
      New-Item $this.Sync -ItemType Directory
    }
    Copy-Item -Force -Path ($this.Local + '\*') -Include $this.Files -Destination $this.Sync
  }

  Import() {
    $this.StopIme()
    if (!(Test-Path -Path $this.Local)) {
      New-Item $this.Local -ItemType Directory
    }
    Copy-Item -Force -Path ($this.Sync + '\*') -Include $this.Files -Destination $this.Local
  }

  StopIme() {
    <#
    .DESCRIPTION
    設定ファイルの読み書きに影響を与えないように、Google IMEのプロセスを停止する。
    #>
    Get-Process -Name [G]oogleIMEJaConverter | Stop-Process
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

#### Main Script Block ####

if ($SubCommand -eq 'export') {
  ExportAll
} elseif ($SubCommand -eq 'import') {
  ImportAll
} else {
  Write-Error -ea Continue 'SubCommand must be "export" or "import".'
  exit 2
}
