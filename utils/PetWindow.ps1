<#
  .SYNOPSIS
    Show a window to select a snippet by pet and insert it.
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$snip = pet search
if ([String]::isNullOrEmpty($snip)) {
  exit 0
}
$quotedSnip = $snip -replace '"','""'  # escape double quotes
AutoHotkey.exe (Join-Path $PSScriptRoot "insert_text.ahk") "$quotedSnip"
