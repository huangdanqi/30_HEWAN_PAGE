#!/bin/bash

# Fix MySQL Authentication Script
# This script changes MySQL from auth_socket to password authentication

echo "🔧 Fixing MySQL Authentication"
echo "=============================="

# Check if we can connect with sudo
echo "📝 Step 1: Testing sudo MySQL connection..."
if sudo mysql -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Sudo MySQL connection works"
    SUDO_ACCESS=true
else
    echo "❌ Sudo MySQL connection failed"
    SUDO_ACCESS=false
    exit 1
fi

echo ""

# Check current authentication method
echo "📝 Step 2: Checking current authentication method..."
echo "Current root user configuration:"
sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root' AND host='localhost';"

echo ""

# Change authentication method to mysql_native_password
echo "📝 Step 3: Changing authentication method to mysql_native_password..."
echo "Setting password for root@localhost..."

# Try to change the authentication method and set password
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'aV2[kO2#iX'; FLUSH PRIVILEGES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Successfully changed authentication method to mysql_native_password"
else
    echo "⚠️  First attempt failed, trying alternative method..."
    sudo mysql -e "UPDATE mysql.user SET plugin='mysql_native_password', authentication_string=PASSWORD('aV2[kO2#iX') WHERE user='root' AND host='localhost'; FLUSH PRIVILEGES;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully updated authentication method using alternative method"
    else
        echo "❌ Failed to change authentication method"
        echo "Trying one more approach..."
        sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'aV2[kO2#iX'; FLUSH PRIVILEGES;" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully set password using ALTER USER"
        else
            echo "❌ All methods failed"
            exit 1
        fi
    fi
fi

echo ""

# Verify the change
echo "📝 Step 4: Verifying the change..."
echo "Updated root user configuration:"
sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root' AND host='localhost';"

echo ""

# Test the new password
echo "📝 Step 5: Testing new password authentication..."
if mysql -u root -p'aV2[kO2#iX' -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Password authentication works!"
else
    echo "❌ Password authentication failed"
    echo "Error:"
    mysql -u root -p'aV2[kO2#iX' -e "SELECT 1;" 2>&1 | head -1
    exit 1
fi

echo ""

# Test database access
echo "📝 Step 6: Testing database access..."
if mysql -u root -p'aV2[kO2#iX' -e "USE page_test; SHOW TABLES;" 2>/dev/null; then
    echo "✅ Database access successful!"
    echo "📋 Tables in page_test:"
    mysql -u root -p'aV2[kO2#iX' -e "USE page_test; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in"
else
    echo "❌ Database access failed"
fi

echo ""
echo "🎯 MySQL authentication fixed!"
echo "   Password: aV2[kO2#iX"
echo "   Authentication method: mysql_native_password"
echo ""
echo "💡 Next steps:"
echo "1. Test the connection: node test_db_connection.js"
echo "2. Start your servers"
echo "3. If you still have issues, check the MySQL error logs" 