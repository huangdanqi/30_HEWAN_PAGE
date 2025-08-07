@echo off
REM Cloud Development Server Startup Script for Windows
REM This script starts the Vue.js development server with proper configuration

echo 🚀 Starting Vue.js Development Server on Cloud...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Set environment variables for cloud deployment
set NODE_ENV=development
set VITE_API_BASE_URL=http://127.0.0.1:2829

echo 🌐 Server will be accessible at:
echo    Local: http://localhost:2830
echo    Network: http://%COMPUTERNAME%:2830
echo.
echo ⚠️  Make sure port 2830 is open in your firewall!
echo.
echo 🎯 Starting development server...
echo    Press Ctrl+C to stop the server
echo.

npm run dev 