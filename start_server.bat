@echo off
echo === Starting Hewan Page Server ===
echo.

echo Fixing Chinese character encoding...
mysql -u root -ph05010501 page_test -e "source fix_chinese_encoding.sql"

echo.
echo Starting server...
cd server
npm start 