# Simple PowerShell script to copy files to remote server
$RemoteHost = "121.43.196.106"
$RemoteUser = "root"
$RemotePassword = "aV2[kO2#iX"
$RemotePath = "/root/frontendCode/vue3/hewan_page"

Write-Host "Starting file copy to server..."
Write-Host "Source: Current directory"
Write-Host "Destination: $RemoteUser@$RemoteHost:$RemotePath"

# Try using pscp if available
try {
    $pscpPath = Get-Command pscp -ErrorAction Stop
    Write-Host "Found pscp at: $($pscpPath.Source)"
    Write-Host "Using pscp to copy files..."
    
    # Create remote directory first
    $createDirCmd = "plink -ssh $RemoteUser@$RemoteHost -pw $RemotePassword `"mkdir -p $RemotePath`""
    Write-Host "Creating remote directory..."
    Invoke-Expression $createDirCmd
    
    # Copy files
    $copyCmd = "pscp -r -pw `"$RemotePassword`" . $RemoteUser@$RemoteHost`:$RemotePath"
    Write-Host "Copying files..."
    Invoke-Expression $copyCmd
    
    Write-Host "Files copied successfully using pscp!"
} catch {
    Write-Host "pscp not found or failed. Trying alternative method..."
    
    # Alternative: Use scp with expect-like behavior
    try {
        # Create a temporary expect script
        $expectScript = @"
spawn scp -r -o StrictHostKeyChecking=no . $RemoteUser@$RemoteHost:$RemotePath
expect {
    "password:" {
        send "$RemotePassword\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
"@
        
        $expectScript | Out-File -FilePath "$env:TEMP\copy_expect.exp" -Encoding ASCII
        
        # Try to use expect if available
        $expectPath = Get-Command expect -ErrorAction SilentlyContinue
        if ($expectPath) {
            & expect "$env:TEMP\copy_expect.exp"
        } else {
            Write-Host "expect not available. Please install PuTTY tools or use manual scp."
            Write-Host "Manual command: scp -r . $RemoteUser@$RemoteHost:$RemotePath"
        }
    } catch {
        Write-Host "Alternative method failed. Please use manual scp command:"
        Write-Host "scp -r . $RemoteUser@$RemoteHost:$RemotePath"
    }
} 