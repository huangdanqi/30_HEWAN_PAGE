# PowerShell script to fix Chinese encoding and start the server
Write-Host "=== Fixing Chinese Character Encoding ===" -ForegroundColor Green

# Step 1: Run the MySQL encoding fix script
Write-Host "Running MySQL encoding fix script..." -ForegroundColor Yellow
mysql -u root -ph05010501 page_test -e "source fix_chinese_encoding.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database encoding fixed successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: Database encoding fix may have failed. Continuing anyway..." -ForegroundColor Yellow
}

# Step 2: Navigate to server directory and start the server
Write-Host "=== Starting Server ===" -ForegroundColor Green
Set-Location server

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting server on port 2829..." -ForegroundColor Yellow
npm start 