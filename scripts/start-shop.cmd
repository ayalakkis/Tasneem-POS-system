@echo off
rem Starts the POS for the shop network. Run at boot by the "Tasneem POS"
rem scheduled task that setup-shop.ps1 creates. Output goes to logs\server.log.
cd /d "%~dp0.."
if not exist logs mkdir logs
echo [%date% %time%] Starting POS >> logs\server.log
call npm run start:shop >> logs\server.log 2>&1
