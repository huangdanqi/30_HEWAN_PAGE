Write-Host "Running database migration to add creator_name column..." -ForegroundColor Green
Write-Host ""

$dbName = Read-Host "Please enter your database name"
Write-Host "Running migration for database: $dbName" -ForegroundColor Yellow
Write-Host ""

Write-Host "Please enter your MySQL root password when prompted:" -ForegroundColor Yellow
mysql -u root -p -e "USE $dbName; SOURCE add_creator_name_column.sql;"

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
