param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Path,
    [string]$Pattern = 'error|fail|exception|assert|warning',
    [int]$Context = 2,
    [int]$Tail = 30
)

if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "File not found: $Path"
}

$lines = Get-Content -LiteralPath $Path
$matches = Select-String -InputObject $lines -Pattern $Pattern -CaseSensitive:$false
$selected = New-Object System.Collections.Generic.List[string]

foreach ($match in ($matches | Select-Object -First 12)) {
    $start = [Math]::Max(0, $match.LineNumber - 1 - $Context)
    $end = [Math]::Min($lines.Count - 1, $match.LineNumber - 1 + $Context)
    for ($index = $start; $index -le $end; $index++) {
        $selected.Add(('{0}: {1}' -f ($index + 1), $lines[$index]))
    }
}

Write-Output '--- matching diagnostics ---'
$selected | Select-Object -Unique
Write-Output "--- final $Tail lines ---"
$lines | Select-Object -Last $Tail
