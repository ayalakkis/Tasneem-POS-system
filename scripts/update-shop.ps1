<#
  Updates the POS on the shop PC to the latest version from GitHub.
  See DEPLOY.md. Run from the project folder in PowerShell *as administrator*:

      powershell -ExecutionPolicy Bypass -File scripts\update-shop.ps1

  Backs up the database first, then downloads, rebuilds and restarts.
  Keep this file ASCII only: Windows PowerShell 5.1 misreads other characters.
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$TaskName = "Tasneem POS"
$Port = 3000

function Step($text) { Write-Host ""; Write-Host $text -ForegroundColor Cyan }
function Fail($text) { Write-Host ""; Write-Host "  UPDATE STOPPED: $text" -ForegroundColor Red; exit 1 }
function Run($what, [scriptblock]$block) {
  & $block
  if ($LASTEXITCODE -ne 0) { Fail "$what failed. The POS was not restarted; fix the problem and run this again." }
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Fail "Please run PowerShell as administrator." }

Step "1. Backing up the database"
Run "Backup" { npm run backup }

Step "2. Stopping the POS"
Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
# Stopping the task can leave the server itself running; stop whatever holds the port.
Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Step "3. Downloading the latest version"
Run "Downloading" { git pull --ff-only }

Step "4. Installing, updating the database, building"
Run "Installing packages" { npm ci --no-audit --no-fund }
Run "Updating the database" { npx prisma migrate deploy }
Run "Preparing the database client" { npx prisma generate }
Run "Building" { npm run build }

Step "5. Starting the POS"
Start-ScheduledTask -TaskName $TaskName
Write-Host ""
Write-Host "Update complete. The POS is running again." -ForegroundColor Green
