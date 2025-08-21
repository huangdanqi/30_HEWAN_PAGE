@echo off
echo Running database migration to add creator_name column...
echo.

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: MySQL command not found. Please ensure MySQL is installed and in PATH.
    pause
    exit /b 1
)

echo MySQL found. Running migration...
echo.

REM Run the migration SQL
mysql -u root -p -e "USE your_database_name; SOURCE add_creator_name_column.sql;"

if %errorlevel% equ 0 (
    echo.
    echo Migration completed successfully!
    echo The creator_name column has been added to the product_list table.
) else (
    echo.
    echo Migration failed. Please check the error messages above.
)

echo.
pause
