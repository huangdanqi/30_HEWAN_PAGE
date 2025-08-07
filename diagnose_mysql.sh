#!/bin/bash

# Comprehensive MySQL Diagnosis Script
# This script checks MySQL configuration and authentication methods

echo "🔍 Comprehensive MySQL Diagnosis"
echo "================================"

# Check if MySQL is running
echo "📝 Step 1: Checking MySQL service..."
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL is running"
else
    echo "❌ MySQL is not running"
    echo "   Starting MySQL..."
    sudo systemctl start mysql
fi

echo ""

# Check MySQL version
echo "📝 Step 2: Checking MySQL version..."
mysql --version

echo ""

# Check if we can connect with sudo
echo "📝 Step 3: Testing sudo MySQL connection..."
if sudo mysql -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Sudo MySQL connection works"
    SUDO_ACCESS=true
else
    echo "❌ Sudo MySQL connection failed"
    SUDO_ACCESS=false
fi

echo ""

# Check MySQL user authentication methods
if [ "$SUDO_ACCESS" = true ]; then
    echo "📝 Step 4: Checking MySQL user authentication methods..."
    echo "Root users and their authentication methods:"
    sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root';"
    
    echo ""
    echo "Checking if root user has password:"
    sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root' AND host='localhost';"
    
    echo ""
    echo "Checking grants for root@localhost:"
    sudo mysql -e "SHOW GRANTS FOR 'root'@'localhost';"
else
    echo "❌ Cannot check authentication methods without sudo access"
fi

echo ""

# Test different password formats with detailed output
echo "📝 Step 5: Testing different password formats with detailed output..."
PASSWORDS=(
    "aV2[kO2#iX"
    "aV2\\[kO2#iX"
    "'aV2[kO2#iX'"
    "\"aV2[kO2#iX\""
)

for i in "${!PASSWORDS[@]}"; do
    echo "   Testing password format $((i+1)): ${PASSWORDS[$i]}"
    if mysql -u root -p"${PASSWORDS[$i]}" -e "SELECT 1;" 2>/dev/null; then
        echo "   ✅ Password format $((i+1)) works!"
        WORKING_PASSWORD="${PASSWORDS[$i]}"
        break
    else
        echo "   ❌ Password format $((i+1)) failed"
        # Show the actual error
        mysql -u root -p"${PASSWORDS[$i]}" -e "SELECT 1;" 2>&1 | head -1
    fi
done

echo ""

# Check if we found a working password
if [ -n "$WORKING_PASSWORD" ]; then
    echo "🎯 Found working password: $WORKING_PASSWORD"
    echo ""
    echo "📝 Step 6: Testing database access with working format..."
    if mysql -u root -p"$WORKING_PASSWORD" -e "USE page_test; SHOW TABLES;" 2>/dev/null; then
        echo "✅ Database access successful!"
        echo "📋 Tables in page_test:"
        mysql -u root -p"$WORKING_PASSWORD" -e "USE page_test; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in"
    else
        echo "❌ Database access failed"
    fi
else
    echo "❌ No working password found"
    echo ""
    echo "🔍 Additional diagnostics..."
    
    # Check if there are any authentication issues
    if [ "$SUDO_ACCESS" = true ]; then
        echo "Checking for authentication issues:"
        sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root';"
        
        echo ""
        echo "Checking if there are any password-related errors in MySQL logs:"
        sudo tail -20 /var/log/mysql/error.log 2>/dev/null || echo "No MySQL error log found"
    fi
    
    echo ""
    echo "💡 Possible solutions:"
    echo "1. The password might be different from what we expect"
    echo "2. MySQL might be using a different authentication method"
    echo "3. There might be multiple root users with different configurations"
    echo "4. The password might need to be reset"
fi

echo ""
echo "📋 Summary:"
echo "   MySQL running: $(systemctl is-active --quiet mysql && echo 'Yes' || echo 'No')"
echo "   Sudo access: $SUDO_ACCESS"
echo "   Working password: ${WORKING_PASSWORD:-'None found'}"
echo ""
echo "💡 Next steps:"
if [ -n "$WORKING_PASSWORD" ]; then
    echo "1. Update your .env files with the working password: $WORKING_PASSWORD"
    echo "2. Test the connection again: node test_db_connection.js"
    echo "3. Start your servers"
else
    echo "1. Check the MySQL configuration and authentication methods"
    echo "2. Try connecting manually with: mysql -u root -p"
    echo "3. Consider resetting the MySQL password if needed"
fi 