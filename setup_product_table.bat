@echo off
chcp 65001 >nul
echo === Product List Table Setup ===
echo.

REM Check if MySQL client is available
mysql --version >nul 2>&1
if errorlevel 1 (
    echo Error: MySQL client not found. Please install MySQL client first.
    pause
    exit /b 1
)

REM Database connection details (update these with your actual values)
set DB_HOST=localhost
set DB_USER=your_username
set DB_NAME=your_database

echo Please provide your MySQL database details:
set /p input_host="Database host [%DB_HOST%]: "
if not "%input_host%"=="" set DB_HOST=%input_host%

set /p input_name="Database name [%DB_NAME%]: "
if not "%input_name%"=="" set DB_NAME=%input_name%

set /p input_user="Database user [%DB_USER%]: "
if not "%input_user%"=="" set DB_USER=%input_user%

set /p DB_PASSWORD="Database password: "

echo.
echo Setting up product_list table...

REM Create the table
echo 1. Creating product_list table...
mysql -h "%DB_HOST%" -u "%DB_USER%" -p"%DB_PASSWORD%" "%DB_NAME%" < create_product_table.sql

if errorlevel 1 (
    echo    ✗ Failed to create table
    pause
    exit /b 1
) else (
    echo    ✓ Table created successfully
)

REM Insert sample data
echo 2. Inserting sample data...
mysql -h "%DB_HOST%" -u "%DB_USER%" -p"%DB_PASSWORD%" "%DB_NAME%" < insert_sample_data.sql

if errorlevel 1 (
    echo    ✗ Failed to insert sample data
    pause
    exit /b 1
) else (
    echo    ✓ Sample data inserted successfully
)

REM Verify the setup
echo 3. Verifying setup...
mysql -h "%DB_HOST%" -u "%DB_USER%" -p"%DB_PASSWORD%" "%DB_NAME%" -e "SELECT COUNT(*) as total_rows, COUNT(DISTINCT product_id) as unique_products, COUNT(DISTINCT module) as unique_modules FROM product_list;"

echo.
echo === Setup Complete ===
echo The product_list table has been created with 20 sample rows.
echo You can now refresh your Vue.js frontend to see the new data.
echo.
echo To verify manually, you can run:
echo mysql -h %DB_HOST% -u %DB_USER% -p %DB_NAME% -e "SELECT * FROM product_list LIMIT 5;"
pause 