#!/bin/bash

# Check MySQL Authentication Configuration
# This script checks the exact MySQL authentication setup

echo "🔍 Checking MySQL Authentication Configuration"
echo "=============================================="

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

# Check MySQL user authentication methods
echo "📝 Step 2: Checking MySQL user authentication methods..."
echo "All root users and their authentication methods:"
sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root';"

echo ""

echo "📝 Step 3: Checking specific root@localhost configuration..."
sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root' AND host='localhost';"

echo ""

echo "📝 Step 4: Checking grants for root@localhost..."
sudo mysql -e "SHOW GRANTS FOR 'root'@'localhost';"

echo ""

echo "📝 Step 5: Checking if there are any authentication issues..."
sudo mysql -e "SELECT user, host, plugin, authentication_string FROM mysql.user WHERE user='root' AND host='localhost';"

echo ""

echo "📝 Step 6: Testing manual connection with exact password..."
echo "Testing: mysql -u root -p'aV2[kO2#iX' -e 'SELECT 1;'"
if mysql -u root -p'aV2[kO2#iX' -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Manual connection with exact password works!"
else
    echo "❌ Manual connection with exact password failed"
    echo "Error:"
    mysql -u root -p'aV2[kO2#iX' -e "SELECT 1;" 2>&1 | head -1
fi

echo ""

echo "📝 Step 7: Checking MySQL error logs for authentication issues..."
if [ -f /var/log/mysql/error.log ]; then
    echo "Last 10 lines of MySQL error log:"
    sudo tail -10 /var/log/mysql/error.log
else
    echo "No MySQL error log found at /var/log/mysql/error.log"
fi

echo ""

echo "💡 Analysis:"
echo "If the manual connection failed but sudo works, the issue might be:"
echo "1. The password is different from what we expect"
echo "2. MySQL is using a different authentication method"
echo "3. There are multiple root users with different configurations"
echo "4. The password needs to be reset"

echo ""
echo "🔧 Next steps:"
echo "1. If manual connection works, update your .env files"
echo "2. If manual connection fails, the password might be different"
echo "3. Check the exact password by running: sudo mysql -e \"SELECT user, host, plugin FROM mysql.user WHERE user='root';\"" 