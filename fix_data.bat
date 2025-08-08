@echo off
echo Fixing database data with proper encoding...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -ph05010501 --default-character-set=utf8mb4 page_test < fix_encoding_final.sql
pause 