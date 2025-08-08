@echo off
echo Copying files to remote server...

REM Check if pscp is available
where pscp >nul 2>&1
if %errorlevel% neq 0 (
    echo pscp not found. Please install PuTTY or add it to PATH.
    echo Trying alternative method with scp...
    goto :try_scp
)

echo Using pscp to copy files...
pscp -r -pw "aV2[kO2#iX" . root@121.43.196.106:/root/frontendCode/vue3/hewan_page
if %errorlevel% equ 0 (
    echo Files copied successfully!
) else (
    echo Failed to copy files with pscp.
    goto :try_scp
)
goto :end

:try_scp
echo Trying scp method...
echo Creating remote directory...
ssh -o StrictHostKeyChecking=no root@121.43.196.106 "mkdir -p /root/frontendCode/vue3/hewan_page"
echo Copying files...
scp -r -o StrictHostKeyChecking=no . root@121.43.196.106:/root/frontendCode/vue3/hewan_page

:end
echo Copy operation completed.
pause 