@echo off
echo Setting up model_configuration database table...
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: MySQL command line client not found in PATH
    echo Please make sure MySQL is installed and mysql.exe is in your PATH
    pause
    exit /b 1
)

REM Run the SQL script
echo Running SQL script to create model_configuration table...
mysql -u root -p -h localhost page_test < server/database/create_model_configuration_table.sql

if %errorlevel% equ 0 (
    echo.
    echo Database table setup completed successfully!
    echo The model_configuration table has been created with sample data.
) else (
    echo.
    echo Error: Failed to create database table
    echo Please check your MySQL connection and try again
)

echo.
pause
