@echo off
echo 🚀 Starting Vue.js Project Deployment...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "deploy.ps1"

echo.
echo Press any key to exit...
pause >nul 