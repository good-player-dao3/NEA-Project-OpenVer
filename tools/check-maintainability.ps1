param(
    [string]$Root = (Get-Location).Path,
    [int]$MaxLines = 500,
    [string[]]$Include = @('*.mjs', '*.js', '*.cjs', '*.ts', '*.ps1'),
    [string[]]$ExcludePath = @('node_modules', 'Middleware/runtime-compat/abi', 'Middleware/runtime-compat/generated', 'Backend/local-player/runtime', 'Evidence/dao3-docs-mirror/site', 'Evidence/dump')
)

$rootPath = (Resolve-Path -LiteralPath $Root).Path
$tracked = @(git -C $rootPath ls-files)
$results = foreach ($relative in $tracked) {
    $normalized = $relative.Replace('\', '/')
    $extension = [IO.Path]::GetExtension($normalized)
    if ($Include -notcontains "*$extension") { continue }
    if ($ExcludePath | Where-Object { $normalized -like "*$_*" }) { continue }
    $fullPath = Join-Path $rootPath $relative
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) { continue }
    $lineCount = (Get-Content -LiteralPath $fullPath | Measure-Object -Line).Lines
    if ($lineCount -gt $MaxLines) {
        [pscustomobject]@{ Lines = $lineCount; Path = $normalized }
    }
}

if ($results) {
    $results | Sort-Object Lines -Descending | Format-Table -AutoSize
    exit 1
}

Write-Output "No hand-written files exceed $MaxLines lines in the selected scope."
