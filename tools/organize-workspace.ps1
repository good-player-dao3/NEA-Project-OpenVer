[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$IncludeActiveLocations
)

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot ".workspace"))
$logRoot = Join-Path $workspaceRoot "logs"
$allowedExtensions = [System.Collections.Generic.HashSet[string]]::new(
    [string[]]@(".log", ".pid", ".stdout", ".stderr"),
    [System.StringComparer]::OrdinalIgnoreCase
)
$locations = @(
    @{ Name = "root"; Path = $repositoryRoot; CheckProcesses = $false },
    @{ Name = "demo-map"; Path = (Join-Path $repositoryRoot "Frontend/demo-map"); CheckProcesses = $true },
    @{ Name = "local-player"; Path = (Join-Path $repositoryRoot "Backend/local-player"); CheckProcesses = $true }
)

$processCommandLines = @()
try {
    $processCommandLines = @(Get-CimInstance Win32_Process -ErrorAction Stop | ForEach-Object CommandLine | Where-Object { $_ })
} catch {
    Write-Warning "Unable to inspect active processes; process-sensitive locations will be skipped unless -IncludeActiveLocations is supplied."
}

function Assert-ContainedPath {
    param(
        [Parameter(Mandatory)] [string]$Candidate,
        [Parameter(Mandatory)] [string]$Parent
    )

    $resolvedCandidate = [System.IO.Path]::GetFullPath($Candidate)
    $resolvedParent = [System.IO.Path]::GetFullPath($Parent).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $resolvedCandidate.StartsWith($resolvedParent, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Path escapes the intended workspace: $resolvedCandidate"
    }
}

$candidates = foreach ($location in $locations) {
    if (-not (Test-Path -LiteralPath $location.Path -PathType Container)) {
        continue
    }

    if ($location.CheckProcesses -and -not $IncludeActiveLocations) {
        $hasActiveProcess = if ($processCommandLines.Count -eq 0) {
            $true
        } else {
            [bool]($processCommandLines | Where-Object { $_.IndexOf($location.Path, [System.StringComparison]::OrdinalIgnoreCase) -ge 0 } | Select-Object -First 1)
        }
        if ($hasActiveProcess) {
            Write-Warning "Skipping $($location.Name): an active process references $($location.Path)"
            continue
        }
    }

    Get-ChildItem -LiteralPath $location.Path -File -Force | Where-Object {
        $allowedExtensions.Contains($_.Extension)
    } | ForEach-Object {
        [pscustomobject]@{
            Group = $location.Name
            Source = $_.FullName
            Name = $_.Name
        }
    }
}

if (-not $candidates) {
    Write-Output "No root-level transient logs found."
    exit 0
}

foreach ($candidate in $candidates) {
    $targetDirectory = Join-Path $logRoot $candidate.Group
    $targetPath = Join-Path $targetDirectory $candidate.Name
    Assert-ContainedPath -Candidate $candidate.Source -Parent $repositoryRoot
    Assert-ContainedPath -Candidate $targetPath -Parent $workspaceRoot

    if (Test-Path -LiteralPath $targetPath) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($candidate.Name)
        $extension = [System.IO.Path]::GetExtension($candidate.Name)
        $suffix = Get-Date -Format "yyyyMMdd-HHmmss-fff"
        $targetPath = Join-Path $targetDirectory "$baseName-$suffix$extension"
    }

    if ($Apply) {
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
        try {
            Move-Item -LiteralPath $candidate.Source -Destination $targetPath -ErrorAction Stop
            Write-Output "Moved: $($candidate.Source) -> $targetPath"
        } catch [System.IO.IOException] {
            Write-Warning "Skipped active or locked file: $($candidate.Source)"
        }
    } else {
        Write-Output "Would move: $($candidate.Source) -> $targetPath"
    }
}

if (-not $Apply) {
    Write-Output "Preview only. Re-run with -Apply to move these transient files."
}
