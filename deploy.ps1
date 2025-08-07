# Vue.js Project Deployment Script
# This script uploads your project to the cloud server and provides setup instructions

param(
    [string]$ServerIP = "121.43.196.106",
    [string]$Username = "root",
    [string]$Password = "aV2[kO2#iX",
    [string]$RemotePath = "/root/frontendCode/vue3",
    [int]$Port = 2830
)

Write-Host "🚀 Starting Vue.js Project Deployment..." -ForegroundColor Green

# Step 1: Build the project
Write-Host "📦 Building the project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed. Please check your project and try again." -ForegroundColor Red
    exit 1
}

# Step 2: Create a temporary directory for upload (excluding node_modules and docs)
Write-Host "📁 Preparing files for upload..." -ForegroundColor Yellow
$tempDir = "temp_deploy"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy all files except node_modules and docs
Get-ChildItem -Path "." -Exclude "node_modules", "docs", "temp_deploy", ".git" | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination "$tempDir\$($_.Name)" -Recurse
    } else {
        Copy-Item -Path $_.FullName -Destination "$tempDir\$($_.Name)"
    }
}

# Copy the built files from docs to the temp directory
if (Test-Path "docs") {
    Copy-Item -Path "docs\*" -Destination "$tempDir\" -Recurse
}

Write-Host "✅ Files prepared for upload!" -ForegroundColor Green

# Step 3: Upload files to server using scp
Write-Host "📤 Uploading files to server..." -ForegroundColor Yellow

# Check if scp is available
$scpPath = Get-Command scp -ErrorAction SilentlyContinue
if ($scpPath) {
    try {
        $scpCommand = "scp -r -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `"$tempDir\*`" $Username@$ServerIP`:$RemotePath"
        Write-Host "Executing: $scpCommand" -ForegroundColor Cyan
        
        # Execute scp command
        Invoke-Expression $scpCommand
        
        Write-Host "✅ Upload completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Upload failed. Trying alternative method..." -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Fallback: Show manual instructions
        Write-Host "🔧 Manual Upload Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open a new terminal/command prompt" -ForegroundColor White
        Write-Host "2. Navigate to your project directory" -ForegroundColor White
        Write-Host "3. Run the following command:" -ForegroundColor White
        Write-Host "   scp -r -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `"$tempDir\*`" $Username@$ServerIP`:$RemotePath" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "4. When prompted, enter the password: $Password" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "❌ scp not found. Please install OpenSSH or use an alternative method." -ForegroundColor Red
    Write-Host "🔧 Alternative methods:" -ForegroundColor Cyan
    Write-Host "1. Install OpenSSH for Windows" -ForegroundColor White
    Write-Host "2. Use WinSCP or FileZilla" -ForegroundColor White
    Write-Host "3. Use rsync if available" -ForegroundColor White
    Write-Host ""
    Write-Host "Manual command to run:" -ForegroundColor Yellow
    Write-Host "scp -r -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `"$tempDir\*`" $Username@$ServerIP`:$RemotePath" -ForegroundColor Yellow
}

# Step 4: Provide SSH setup instructions
Write-Host ""
Write-Host "🔧 After upload, SSH into your server and run these commands:" -ForegroundColor Cyan
Write-Host "ssh $Username@$ServerIP" -ForegroundColor Yellow
Write-Host "cd $RemotePath" -ForegroundColor Yellow
Write-Host "npm install" -ForegroundColor Yellow
Write-Host "npm run build" -ForegroundColor Yellow
Write-Host ""

# Step 5: Provide web server setup instructions
Write-Host "🌐 To serve your Vue.js app, you can use one of these methods:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1 - Using npm serve:" -ForegroundColor White
Write-Host "npm install -g serve" -ForegroundColor Yellow
Write-Host "serve -s docs -l $Port" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 2 - Using nginx (recommended for production):" -ForegroundColor White
Write-Host "apt update && apt install nginx" -ForegroundColor Yellow
Write-Host "cp -r docs/* /var/www/html/" -ForegroundColor Yellow
Write-Host "systemctl start nginx" -ForegroundColor Yellow
Write-Host ""

# Step 6: MySQL Connection Setup
Write-Host "🗄️ MySQL Connection Setup:" -ForegroundColor Cyan
Write-Host "1. Make sure your .env file has the correct MySQL credentials" -ForegroundColor White
Write-Host "2. Install MySQL client if needed: apt install mysql-client" -ForegroundColor White
Write-Host "3. Test connection: mysql -h [host] -u [user] -p [database]" -ForegroundColor White
Write-Host ""

# Cleanup
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force
Write-Host "✅ Cleanup completed!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Deployment script completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH into your server using the command above" -ForegroundColor White
Write-Host "2. Install dependencies and start your application" -ForegroundColor White
Write-Host "3. Configure your MySQL connection if needed" -ForegroundColor White
Write-Host "4. Set up your web server (nginx recommended)" -ForegroundColor White 