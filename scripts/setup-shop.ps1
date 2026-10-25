<#
  One-time setup of the POS on the shop PC. See DEPLOY.md.

  Run from the project folder in PowerShell *as administrator*:

      powershell -ExecutionPolicy Bypass -File scripts\setup-shop.ps1

  What it does:
    1. Checks Node.js is installed
    2. Creates .env with a random session secret (kept if it already exists)
    3. Installs the app's packages
    4. Creates an empty database
    5. Creates the admin account (asks for a username and password)
    6. Builds the app
    7. Opens port 3000 on the private network, starts the POS at boot,
       backs up the database every night, and starts the POS now

  Safe to run again: it never deletes data and keeps an existing .env.

  -SkipSystem skips step 7 (firewall and scheduled tasks), for testing.
  Keep this file ASCII only: Windows PowerShell 5.1 misreads other characters.
#>
param([switch]$SkipSystem)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$TaskName = "Tasneem POS"
$BackupTaskName = "Tasneem POS Backup"
$Port = 3000
$Steps = 7

function Step($n, $text) { Write-Host ""; Write-Host "Step $n of ${Steps}: $text" -ForegroundColor Cyan }
function Ok($text) { Write-Host "  OK  $text" -ForegroundColor Green }
function Note($text) { Write-Host "  $text" -ForegroundColor Yellow }
function Fail($text) { Write-Host ""; Write-Host "  SETUP STOPPED: $text" -ForegroundColor Red; exit 1 }
function Run($what, [scriptblock]$block) {
  & $block
  if ($LASTEXITCODE -ne 0) { Fail "$what failed (see the messages above)." }
}

Write-Host "Tasneem POS setup" -ForegroundColor White
Write-Host "Folder: $Root"

if (-not $SkipSystem) {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
  if (-not $isAdmin) { Fail "Please run PowerShell as administrator (right click, Run as administrator)." }
}

# 1. Node.js ---------------------------------------------------------------
Step 1 "Checking Node.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail "Node.js is not installed. Install the LTS version from https://nodejs.org, then run this again."
}
$nodeVersion = (node --version).TrimStart("v")
if ([int]($nodeVersion.Split(".")[0]) -lt 20) { Fail "Node.js $nodeVersion is too old. Install the LTS version from https://nodejs.org." }
Ok "Node.js $nodeVersion"

# 2. .env ------------------------------------------------------------------
Step 2 "Settings file (.env)"
$envFile = Join-Path $Root ".env"
if (Test-Path $envFile) {
  Ok ".env already exists, keeping it"
} else {
  $bytes = New-Object byte[] 48
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $secret = [Convert]::ToBase64String($bytes)
  $content = @(
    "# Created by setup-shop.ps1. Keep this file private; it is not on GitHub.",
    "DATABASE_URL=`"file:./shop.db`"",
    "SESSION_SECRET=`"$secret`"",
    "# The shop network uses plain http, so cookies must not be https-only.",
    "COOKIE_SECURE=`"false`""
  ) -join "`r`n"
  [IO.File]::WriteAllText($envFile, $content + "`r`n", (New-Object Text.UTF8Encoding($false)))
  Ok "Created .env with a new random session secret"
}

# 3. Packages --------------------------------------------------------------
Step 3 "Installing the app's packages (a few minutes the first time)"
Run "Installing packages" { npm ci --no-audit --no-fund }
Ok "Packages installed"

# 4. Database --------------------------------------------------------------
Step 4 "Preparing the database"
Run "Creating the database" { npx prisma migrate deploy }
Run "Preparing the database client" { npx prisma generate }
Ok "Database ready (prisma\shop.db)"

# 5. Admin account ---------------------------------------------------------
Step 5 "Admin account"
# POS_ADMIN_USERNAME / POS_ADMIN_PASSWORD let automated tests skip the prompts.
$username = $env:POS_ADMIN_USERNAME
if (-not $username) { $username = Read-Host "  Admin username (press Enter for 'admin')" }
if ([string]::IsNullOrWhiteSpace($username)) { $username = "admin" }
if ($username -notmatch '^[A-Za-z0-9._-]{3,30}$') { Fail "Username must be 3 to 30 letters, numbers, dots, underscores or hyphens." }

$password = $env:POS_ADMIN_PASSWORD
if (-not $password) {
  while ($true) {
    $a = Read-Host "  Choose a password (at least 8 characters)" -AsSecureString
    $b = Read-Host "  Type it again" -AsSecureString
    $pa = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($a))
    $pb = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($b))
    if ($pa.Length -lt 8) { Note "Too short, try again."; continue }
    if ($pa -ne $pb) { Note "The two passwords don't match, try again."; continue }
    $password = $pa; break
  }
}
# Passed to the seed through this process only; never written to a file.
$env:SEED_ADMIN_USERNAME = $username
$env:SEED_ADMIN_PASSWORD = $password
# Capturing stderr (2>&1) makes any npm warning a fatal error in PowerShell 5.1
# while ErrorActionPreference is Stop, so relax it just for this call.
$ErrorActionPreference = "Continue"
$seedOutput = npm run db:seed 2>&1
$seedExit = $LASTEXITCODE
$ErrorActionPreference = "Stop"
Remove-Item Env:SEED_ADMIN_PASSWORD, Env:SEED_ADMIN_USERNAME -ErrorAction SilentlyContinue
$password = $null
if ($seedExit -ne 0) { $seedOutput | Write-Host; Fail "Creating the admin account failed." }
if (($seedOutput | Out-String) -match "already exists") { Ok "Admin '$username' already exists, password unchanged" }
else { Ok "Admin account '$username' created" }

# 6. Build -----------------------------------------------------------------
Step 6 "Building the app (a minute or two)"
Run "Building the app" { npm run build }
Ok "App built"

# 7. Firewall, start at boot, nightly backup --------------------------------
Step 7 "Starting at boot and nightly backups"
if ($SkipSystem) {
  Note "Skipped (-SkipSystem). To try it now: npm run start:shop"
} else {
  # Only the private network: tills on the shop Wi-Fi can connect, public Wi-Fi can't.
  Get-NetFirewallRule -DisplayName $TaskName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
  New-NetFirewallRule -DisplayName $TaskName -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Private | Out-Null
  Ok "Firewall: port $Port open on the private network"

  $startCmd = Join-Path $Root "scripts\start-shop.cmd"
  $system = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

  Register-ScheduledTask -TaskName $TaskName -Force -Principal $system -Settings $settings `
    -Trigger (New-ScheduledTaskTrigger -AtStartup) `
    -Action (New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$startCmd`"" -WorkingDirectory $Root) | Out-Null
  Ok "The POS starts automatically when this PC turns on"

  $backupArgs = "/c cd /d `"$Root`" && (if not exist logs mkdir logs) && npm run backup >> logs\backup.log 2>&1"
  Register-ScheduledTask -TaskName $BackupTaskName -Force -Principal $system `
    -Trigger (New-ScheduledTaskTrigger -Daily -At "23:30") `
    -Action (New-ScheduledTaskAction -Execute "cmd.exe" -Argument $backupArgs -WorkingDirectory $Root) | Out-Null
  Ok "Database backup every night at 23:30 (backups folder)"

  Start-ScheduledTask -TaskName $TaskName
  Ok "POS started"

  $public = Get-NetConnectionProfile -ErrorAction SilentlyContinue | Where-Object { $_.NetworkCategory -eq "Public" }
  if ($public) {
    Note "This PC's network '$($public[0].Name)' is set to Public, so tills can't connect yet."
    Note "Fix: Settings > Network & internet > Wi-Fi (or Ethernet) > this network > Private network."
  }
}

# Done ---------------------------------------------------------------------
# Only real connections (with a router), not virtual adapters the tills can't reach.
$ips = Get-NetIPConfiguration -ErrorAction SilentlyContinue |
  Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq "Up" } |
  ForEach-Object { $_.IPv4Address.IPAddress }
Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host "Open the POS on the tills and phones (same Wi-Fi) at:"
foreach ($ip in $ips) { Write-Host "    http://${ip}:$Port" -ForegroundColor White }
Write-Host "On this PC itself: http://localhost:$Port"
Write-Host "Tip: in the router, reserve this address for this PC so it never changes."
