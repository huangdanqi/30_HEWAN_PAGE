Write-Host "Running database migration to add creator_name column..." -ForegroundColor Green
Write-Host ""

# Check if MySQL is accessible
try {
    $mysqlVersion = mysql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MySQL found: $mysqlVersion" -ForegroundColor Green
    } else {
        throw "MySQL command failed"
    }
} catch {
    Write-Host "Error: MySQL command not found. Please ensure MySQL is installed and in PATH." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "MySQL found. Running migration..." -ForegroundColor Yellow
Write-Host ""

# Run the migration SQL
Write-Host "Please enter your MySQL root password when prompted:" -ForegroundColor Yellow
mysql -u root -p -e "USE your_database_name; SOURCE add_creator_name_column.sql;"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Write-Host "The creator_name column has been added to the product_list table." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Migration failed. Please check the error messages above." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue"
