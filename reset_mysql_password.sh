#!/bin/bash

# Reset MySQL Password Script
# This script resets the MySQL root password to the correct format

echo "🔧 Resetting MySQL Password"
echo "==========================="

# Check if we can connect with sudo
echo "📝 Step 1: Checking sudo access..."
if sudo mysql -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Sudo MySQL access available"
else
    echo "❌ Sudo MySQL access not available"
    echo "   Please run this script with sudo privileges"
    exit 1
fi

echo ""

# Reset the password
echo "📝 Step 2: Resetting MySQL root password..."
echo "   Setting password to: aV2[kO2#iX"

# Try different authentication methods
echo "   Trying mysql_native_password authentication..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'aV2[kO2#iX'; FLUSH PRIVILEGES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Password reset successful with mysql_native_password"
else
    echo "⚠️  mysql_native_password failed, trying default authentication..."
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'aV2[kO2#iX'; FLUSH PRIVILEGES;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Password reset successful with default authentication"
    else
        echo "❌ Password reset failed"
        echo "   Trying alternative method..."
        sudo mysql -e "UPDATE mysql.user SET authentication_string=PASSWORD('aV2[kO2#iX') WHERE User='root' AND Host='localhost'; FLUSH PRIVILEGES;" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Password reset successful with alternative method"
        else
            echo "❌ All password reset methods failed"
            exit 1
        fi
    fi
fi

echo ""

# Test the new password
echo "📝 Step 3: Testing new password..."
if mysql -u root -p'aV2[kO2#iX' -e "SELECT 1;" 2>/dev/null; then
    echo "✅ New password works!"
else
    echo "❌ New password test failed"
    echo "   Trying with quotes..."
    if mysql -u root -p"aV2[kO2#iX" -e "SELECT 1;" 2>/dev/null; then
        echo "✅ New password works with quotes!"
    else
        echo "❌ Password test still failed"
        exit 1
    fi
fi

echo ""

# Test database access
echo "📝 Step 4: Testing database access..."
if mysql -u root -p'aV2[kO2#iX' -e "USE page_test; SHOW TABLES;" 2>/dev/null; then
    echo "✅ Database access successful!"
    echo "📋 Tables in page_test:"
    mysql -u root -p'aV2[kO2#iX' -e "USE page_test; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in"
else
    echo "⚠️  Database access failed, but password reset was successful"
    echo "   You may need to create the database or grant permissions"
fi

echo ""
echo "🎯 Password reset completed!"
echo "   New password: aV2[kO2#iX"
echo ""
echo "💡 Next steps:"
echo "1. Test the connection: node test_db_connection.js"
echo "2. Start your servers"
echo "3. If you still have issues, run: ./debug_mysql.sh" 