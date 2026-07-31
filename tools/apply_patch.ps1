param(
    [string]$Root = (Get-Location).Path,
    [switch]$Check
)

$arguments = @((Join-Path $PSScriptRoot 'apply_patch.py'), '--root', $Root)
if ($Check) { $arguments += '--check' }
$patchText = ($input | ForEach-Object { [string]$_ }) -join "`n"
$tempPatch = [IO.Path]::GetTempFileName()
try {
    [IO.File]::WriteAllText($tempPatch, $patchText, [Text.UTF8Encoding]::new($false))
    python @arguments --patch-file $tempPatch
    exit $LASTEXITCODE
}
finally {
    Remove-Item -LiteralPath $tempPatch -Force -ErrorAction SilentlyContinue
}
