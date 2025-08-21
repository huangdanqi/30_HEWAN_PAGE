@echo off
echo Running database migration to add creator_name column...
echo.

echo Please enter your database name:
set /p DB_NAME=

echo Running migration for database: %DB_NAME%
echo.

mysql -u root -p -e "USE %DB_NAME%; SOURCE add_creator_name_column.sql;"

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
