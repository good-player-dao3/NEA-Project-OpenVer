param(
  [string]$EditorUrl = "https://dao3.fun/edit/3824cef55a73e0f53385",
  [string]$PlayUrl = "https://dao3.fun/play/2d7044219afff1e81f4e",
  [int]$Port = 9333,
  [int]$SnapshotIntervalSeconds = 15,
  [string]$AuthFile,
  [switch]$Background
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$output = Join-Path $repoRoot "dump\private\live-captures\$timestamp"
$profile = Join-Path $repoRoot "dump\private\live-browser-profile"
$stopFile = Join-Path $output "STOP"
$readyFile = Join-Path $output "ready.json"
$stdout = Join-Path $output "recorder.stdout.log"
$stderr = Join-Path $output "recorder.stderr.log"
$recorderScript = Join-Path $PSScriptRoot "capture-cdp.mjs"
$authorizedEditorUrl = $EditorUrl

if ($AuthFile) {
  $resolvedAuthFile = Resolve-Path -LiteralPath $AuthFile -ErrorAction Stop
  $authData = Get-Content -LiteralPath $resolvedAuthFile -Raw | ConvertFrom-Json
  $authToken = $authData.authToken
  if (-not $authToken) { $authToken = $authData.token }
  if (-not $authToken) { throw "Auth file does not contain authToken or token." }
  $separator = if ($EditorUrl.Contains("?")) { "&" } else { "?" }
  $authorizedEditorUrl = "$EditorUrl${separator}token=$([Uri]::EscapeDataString($authToken))"
}

New-Item -ItemType Directory -Force -Path $output,$profile | Out-Null
Remove-Item -LiteralPath $stopFile -Force -ErrorAction SilentlyContinue

function Find-ChromiumBrowser {
  $registryKeys = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"
  )
  foreach ($key in $registryKeys) {
    if (-not (Test-Path $key)) { continue }
    $candidate = (Get-ItemProperty $key)."(default)"
    if (Test-Path $candidate) { return $candidate }
  }
  foreach ($name in @("msedge.exe", "chrome.exe", "chromium.exe")) {
    $command = Get-Command $name -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
  }
  throw "Microsoft Edge, Chrome, or Chromium was not found."
}

function Wait-DevTools {
  for ($attempt = 0; $attempt -lt 80; $attempt += 1) {
    try {
      $version = Invoke-RestMethod "http://127.0.0.1:$Port/json/version" -TimeoutSec 2
      if ($version.webSocketDebuggerUrl) { return }
    } catch {}
    Start-Sleep -Milliseconds 250
  }
  throw "Chromium DevTools did not become ready on port $Port."
}

function Open-CapturedPage([string]$Url) {
  $encoded = [Uri]::EscapeDataString($Url)
  Invoke-RestMethod -Method Put "http://127.0.0.1:$Port/json/new?$encoded" | Out-Null
}

$browser = Find-ChromiumBrowser
$browserArguments = @(
  "--remote-debugging-port=$Port",
  "--remote-allow-origins=*",
  "--user-data-dir=$profile",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-features=Translate",
  "about:blank"
)

Write-Host "[NEA dump] output: $output"
Write-Host "[NEA dump] persistent browser profile: $profile"
$browserProcess = Start-Process -FilePath $browser -ArgumentList $browserArguments -PassThru
Wait-DevTools

$node = (Get-Command node.exe).Source
$recorderArguments = @(
  $recorderScript,
  "--port", "$Port",
  "--output", $output,
  "--stop-file", $stopFile,
  "--editor-url", $EditorUrl,
  "--play-url", $PlayUrl,
  "--browser-profile", $profile,
  "--snapshot-interval-ms", "$($SnapshotIntervalSeconds * 1000)"
)
$recorder = Start-Process -FilePath $node -ArgumentList $recorderArguments -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru

for ($attempt = 0; $attempt -lt 80 -and -not (Test-Path $readyFile); $attempt += 1) {
  if ($recorder.HasExited) { throw "Recorder exited early. See $stderr" }
  Start-Sleep -Milliseconds 250
}
if (-not (Test-Path $readyFile)) { throw "Recorder did not become ready. See $stderr" }

Open-CapturedPage $authorizedEditorUrl
Open-CapturedPage $PlayUrl

if ($Background) {
  $activeSession = Join-Path $repoRoot "dump\private\live-capture-active.json"
  [PSCustomObject]@{
    output = $output
    profile = $profile
    stopFile = $stopFile
    recorderPid = $recorder.Id
    browserPid = $browserProcess.Id
    port = $Port
    editorUrl = $EditorUrl
    playUrl = $PlayUrl
    authFile = if ($AuthFile) { (Resolve-Path -LiteralPath $AuthFile).Path } else { $null }
    startedAt = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json | Set-Content -LiteralPath $activeSession -Encoding UTF8
  Write-Host "Background capture is active: $activeSession" -ForegroundColor Green
  Write-Host "Stop it by creating: $stopFile" -ForegroundColor Yellow
  return
}

Write-Host ""
Write-Host "The dedicated Edge window is recording the LIVE dao3.fun editor and play pages." -ForegroundColor Green
Write-Host "Log in there, follow preservation-dump\README.md, and keep this PowerShell window open." -ForegroundColor Yellow
Write-Host "When every editor and gameplay test is complete, return here and press Enter."
Read-Host | Out-Null

New-Item -ItemType File -Force -Path $stopFile | Out-Null
try { Wait-Process -Id $recorder.Id -Timeout 900 } catch { throw "Recorder did not finish within 15 minutes. Inspect $stderr" }

$manifest = Join-Path $output "manifest.json"
if (-not (Test-Path $manifest)) { throw "Capture manifest was not written. See $stderr" }
& $node (Join-Path $PSScriptRoot "summarize-capture.mjs") --capture $output
if ($LASTEXITCODE -ne 0) { throw "Capture catalog generation failed." }
Write-Host ""
Write-Host "Capture complete: $output" -ForegroundColor Green
Write-Host "Persistent private browser profile: $profile"
Write-Host "Never commit or upload dump/private because it contains private session material." -ForegroundColor Yellow
