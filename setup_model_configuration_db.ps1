Write-Host "Setting up model_configuration database table..." -ForegroundColor Green
Write-Host ""

# Check if MySQL is available
try {
    $mysqlVersion = mysql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MySQL found: $mysqlVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: MySQL command line client not found in PATH" -ForegroundColor Red
    Write-Host "Please make sure MySQL is installed and mysql.exe is in your PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the SQL script
Write-Host "Running SQL script to create model_configuration table..." -ForegroundColor Yellow
$sqlScript = "server/database/create_model_configuration_table.sql"

if (Test-Path $sqlScript) {
    try {
        mysql -u root -p -h localhost page_test < $sqlScript
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Database table setup completed successfully!" -ForegroundColor Green
            Write-Host "The model_configuration table has been created with sample data." -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Error: Failed to create database table" -ForegroundColor Red
            Write-Host "Please check your MySQL connection and try again" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error executing SQL script: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Error: SQL script not found at $sqlScript" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
