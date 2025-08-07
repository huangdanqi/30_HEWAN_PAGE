#!/bin/bash

# Fix Server Issues Script
# This script fixes database connection and server configuration issues

echo "🔧 Fixing server issues..."

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

echo "📝 Step 1: Checking MySQL service..."
# Check if MySQL is running
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL is running"
else
    echo "⚠️  MySQL is not running. Starting it..."
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

echo ""
echo "📝 Step 2: Checking MySQL user and database..."
# Check if the database exists
if mysql -u root -p'aV2[kO2#iX' -e "USE page_test;" 2>/dev/null; then
    echo "✅ Database 'page_test' exists"
else
    echo "⚠️  Database 'page_test' does not exist. Creating it..."
    mysql -u root -p'aV2[kO2#iX' -e "CREATE DATABASE IF NOT EXISTS page_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

# Check if user has proper permissions
if mysql -u root -p'aV2[kO2#iX' -e "SHOW GRANTS FOR 'root'@'localhost';" 2>/dev/null | grep -q "ALL PRIVILEGES"; then
    echo "✅ User 'root' has proper permissions"
else
    echo "⚠️  Setting up user permissions..."
    mysql -u root -p'aV2[kO2#iX' -e "GRANT ALL PRIVILEGES ON page_test.* TO 'root'@'localhost'; FLUSH PRIVILEGES;"
fi

echo ""
echo "📝 Step 3: Checking server configuration..."
# Check if the .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "   Current configuration:"
    cat .env
else
    echo "❌ .env file not found. Creating it..."
    cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=aV2[kO2#iX
DB_NAME=page_test
PORT=2829
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
EOF
fi

echo ""
echo "📝 Step 4: Installing dependencies..."
# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📝 Step 5: Testing database connection..."
# Test database connection
if node -e "
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            charset: process.env.DB_CHARSET
        });
        console.log('✅ Database connection successful');
        await connection.end();
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}
testConnection();
" 2>/dev/null; then
    echo "✅ Database connection test passed"
else
    echo "❌ Database connection test failed"
    echo ""
    echo "🔧 Manual steps to fix database:"
    echo "1. Check MySQL password: sudo mysql -u root -p"
    echo "2. Reset password if needed: ALTER USER 'root'@'localhost' IDENTIFIED BY 'aV2[kO2#iX';"
    echo "3. Create database: CREATE DATABASE IF NOT EXISTS page_test;"
    echo "4. Grant permissions: GRANT ALL PRIVILEGES ON page_test.* TO 'root'@'localhost';"
fi

echo ""
echo "🎯 Ready to start server!"
echo "   Run: node server.js"
echo ""
echo "💡 If you still have issues:"
echo "1. Check MySQL status: sudo systemctl status mysql"
echo "2. Check MySQL logs: sudo tail -f /var/log/mysql/error.log"
echo "3. Reset MySQL password: sudo mysql_secure_installation" 