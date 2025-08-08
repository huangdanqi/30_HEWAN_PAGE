@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Copying files to remote server
echo ========================================

set REMOTE_HOST=121.43.196.106
set REMOTE_USER=root
set REMOTE_PASSWORD=aV2[kO2#iX
set REMOTE_PATH=/root/frontendCode/vue3/hewan_page

echo Remote Host: %REMOTE_HOST%
echo Remote User: %REMOTE_USER%
echo Remote Path: %REMOTE_PATH%
echo.

REM Method 1: Try using pscp (PuTTY SCP)
echo Trying method 1: pscp...
where pscp >nul 2>&1
if %errorlevel% equ 0 (
    echo Found pscp, attempting to copy files...
    pscp -r -pw "%REMOTE_PASSWORD%" . %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%
    if %errorlevel% equ 0 (
        echo SUCCESS: Files copied using pscp!
        goto :end
    ) else (
        echo FAILED: pscp copy failed.
    )
) else (
    echo pscp not found.
)

echo.

REM Method 2: Try using scp with sshpass equivalent
echo Trying method 2: scp with password...
where scp >nul 2>&1
if %errorlevel% equ 0 (
    echo Found scp, attempting to copy files...
    echo Creating remote directory first...
    ssh -o StrictHostKeyChecking=no %REMOTE_USER%@%REMOTE_HOST% "mkdir -p %REMOTE_PATH%"
    echo Copying files...
    scp -r -o StrictHostKeyChecking=no . %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%
    if %errorlevel% equ 0 (
        echo SUCCESS: Files copied using scp!
        goto :end
    ) else (
        echo FAILED: scp copy failed.
    )
) else (
    echo scp not found.
)

echo.

REM Method 3: Manual instructions
echo ========================================
echo AUTOMATED METHODS FAILED
echo ========================================
echo.
echo Please use one of the following manual methods:
echo.
echo Method A - Using scp (interactive):
echo   scp -r . %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%
echo.
echo Method B - Using pscp (if PuTTY is installed):
echo   pscp -r -pw "%REMOTE_PASSWORD%" . %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%
echo.
echo Method C - Using rsync (if available):
echo   rsync -avz -e ssh . %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%
echo.
echo Note: You will be prompted for the password: %REMOTE_PASSWORD%
echo.

:end
echo.
echo Copy operation completed.
pause 