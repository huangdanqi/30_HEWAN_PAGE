#!/bin/bash

# Debug MySQL Connection Script
# This script helps troubleshoot MySQL connection issues

echo "🔍 Debugging MySQL Connection"
echo "============================="

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

# Check MySQL version and configuration
echo "📝 Step 2: Checking MySQL version and configuration..."
mysql --version

echo ""

# Check if we can connect with sudo (without password)
echo "📝 Step 3: Testing sudo MySQL connection..."
if sudo mysql -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Sudo MySQL connection works"
    SUDO_ACCESS=true
else
    echo "❌ Sudo MySQL connection failed"
    SUDO_ACCESS=false
fi

echo ""

# Check MySQL user authentication
echo "📝 Step 4: Checking MySQL user authentication..."
if [ "$SUDO_ACCESS" = true ]; then
    echo "Checking authentication methods for root user:"
    sudo mysql -e "SELECT user, host, plugin FROM mysql.user WHERE user='root';"
else
    echo "Cannot check authentication methods without sudo access"
fi

echo ""

# Test different password formats
echo "📝 Step 5: Testing different password formats..."
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
    fi
done

echo ""

# Check if we found a working password
if [ -n "$WORKING_PASSWORD" ]; then
    echo "🎯 Found working password: $WORKING_PASSWORD"
    echo ""
    echo "📝 Step 6: Testing database access..."
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
    echo "🔧 Manual steps to fix:"
    echo "1. Reset MySQL root password:"
    echo "   sudo mysql -u root"
    echo "   ALTER USER 'root'@'localhost' IDENTIFIED BY 'aV2[kO2#iX';"
    echo "   FLUSH PRIVILEGES;"
    echo "   EXIT;"
    echo ""
    echo "2. Or try connecting with sudo:"
    echo "   sudo mysql -u root"
    echo "   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'aV2[kO2#iX';"
    echo "   FLUSH PRIVILEGES;"
    echo "   EXIT;"
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
    echo "1. Reset MySQL password using the manual steps above"
    echo "2. Test the connection again"
    echo "3. Start your servers"
fi 