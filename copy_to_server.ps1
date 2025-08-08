# PowerShell script to copy files to remote server
param(
    [string]$SourcePath = ".",
    [string]$RemoteHost = "121.43.196.106",
    [string]$RemoteUser = "root",
    [string]$RemotePassword = "aV2[kO2#iX",
    [string]$RemotePath = "/root/frontendCode/vue3/hewan_page"
)

# Create SSH key file for passwordless authentication (temporary)
$sshKeyFile = "$env:TEMP\temp_ssh_key"
$sshConfigFile = "$env:TEMP\ssh_config"

# Create SSH config file
@"
Host temp-server
    HostName $RemoteHost
    User $RemoteUser
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
"@ | Out-File -FilePath $sshConfigFile -Encoding ASCII

# Function to copy files using scp
function Copy-FilesToServer {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    # Create remote directory first
    Write-Host "Creating remote directory..."
    $createDirCmd = "ssh -F $sshConfigFile temp-server 'mkdir -p $RemotePath'"
    Write-Host "Executing: $createDirCmd"
    
    # Use expect-like approach with PowerShell
    $process = Start-Process -FilePath "ssh" -ArgumentList "-F", $sshConfigFile, "temp-server", "mkdir -p $RemotePath" -NoNewWindow -PassThru -RedirectStandardError "$env:TEMP\ssh_error.log" -RedirectStandardOutput "$env:TEMP\ssh_output.log"
    
    # Wait a moment and check if directory creation was successful
    Start-Sleep -Seconds 2
    
    # Now copy files
    Write-Host "Copying files to server..."
    $scpCmd = "scp -F $sshConfigFile -r '$LocalPath' temp-server:$RemotePath"
    Write-Host "Executing: $scpCmd"
    
    # Use a different approach - create a batch file that handles the password
    $batchFile = @"
@echo off
echo y | plink -ssh $RemoteUser@$RemoteHost -pw $RemotePassword "mkdir -p $RemotePath"
pscp -r -pw $RemotePassword "$LocalPath" $RemoteUser@$RemoteHost:$RemotePath
"@
    
    $batchFile | Out-File -FilePath "$env:TEMP\copy_files.bat" -Encoding ASCII
    
    # Execute the batch file
    & "$env:TEMP\copy_files.bat"
}

# Alternative approach using pscp (PuTTY SCP)
function Copy-FilesWithPscp {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    # Check if pscp is available
    $pscpPath = Get-Command pscp -ErrorAction SilentlyContinue
    if ($pscpPath) {
        Write-Host "Using pscp to copy files..."
        $pscpArgs = @("-r", "-pw", $RemotePassword, $LocalPath, "$RemoteUser@$RemoteHost:$RemotePath")
        & pscp @pscpArgs
    } else {
        Write-Host "pscp not found. Trying alternative method..."
        # Try using scp with expect-like behavior
        Copy-FilesToServer -LocalPath $LocalPath -RemotePath $RemotePath
    }
}

# Main execution
try {
    Write-Host "Starting file copy to server..."
    Write-Host "Source: $SourcePath"
    Write-Host "Destination: $RemoteUser@$RemoteHost:$RemotePath"
    
    # Try pscp first, then fallback
    Copy-FilesWithPscp -LocalPath $SourcePath -RemotePath $RemotePath
    
    Write-Host "File copy completed successfully!"
} catch {
    Write-Host "Error during file copy: $($_.Exception.Message)"
} finally {
    # Cleanup temporary files
    if (Test-Path $sshConfigFile) { Remove-Item $sshConfigFile -Force }
    if (Test-Path "$env:TEMP\copy_files.bat") { Remove-Item "$env:TEMP\copy_files.bat" -Force }
} 