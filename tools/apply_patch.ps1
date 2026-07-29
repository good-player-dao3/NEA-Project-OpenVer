param(
    [string]$Root = (Get-Location).Path,
    [switch]$Check
)

$arguments = @((Join-Path $PSScriptRoot 'apply_patch.py'), '--root', $Root)
if ($Check) { $arguments += '--check' }
$input | python @arguments
exit $LASTEXITCODE
