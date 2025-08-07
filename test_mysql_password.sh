#!/bin/bash

# Test MySQL Password Script
# This script tests different password formats without making any changes

echo "🔍 Testing MySQL Password Formats"
echo "================================"

# Test the exact password that should work
echo "📝 Testing exact password: aV2[kO2#iX"

# Test different formats
echo ""
echo "1. Testing without quotes:"
if mysql -u root -p'aV2[kO2#iX' -e "SELECT 1;" 2>/dev/null; then
    echo "   ✅ Works without quotes"
    WORKING_FORMAT="aV2[kO2#iX"
else
    echo "   ❌ Failed without quotes"
fi

echo ""
echo "2. Testing with single quotes:"
if mysql -u root -p"'aV2[kO2#iX'" -e "SELECT 1;" 2>/dev/null; then
    echo "   ✅ Works with single quotes"
    WORKING_FORMAT="'aV2[kO2#iX'"
else
    echo "   ❌ Failed with single quotes"
fi

echo ""
echo "3. Testing with double quotes:"
if mysql -u root -p"\"aV2[kO2#iX\"" -e "SELECT 1;" 2>/dev/null; then
    echo "   ✅ Works with double quotes"
    WORKING_FORMAT="\"aV2[kO2#iX\""
else
    echo "   ❌ Failed with double quotes"
fi

echo ""
echo "4. Testing with escaped brackets:"
if mysql -u root -p'aV2\[kO2#iX' -e "SELECT 1;" 2>/dev/null; then
    echo "   ✅ Works with escaped brackets"
    WORKING_FORMAT="aV2\[kO2#iX"
else
    echo "   ❌ Failed with escaped brackets"
fi

echo ""
echo "5. Testing with backslashes:"
if mysql -u root -p'aV2\\[kO2#iX' -e "SELECT 1;" 2>/dev/null; then
    echo "   ✅ Works with backslashes"
    WORKING_FORMAT="aV2\\[kO2#iX"
else
    echo "   ❌ Failed with backslashes"
fi

echo ""
if [ -n "$WORKING_FORMAT" ]; then
    echo "🎯 Found working password format: $WORKING_FORMAT"
    echo ""
    echo "📝 Testing database access with working format..."
    if mysql -u root -p"$WORKING_FORMAT" -e "USE page_test; SHOW TABLES;" 2>/dev/null; then
        echo "✅ Database access successful!"
        echo "📋 Tables in page_test:"
        mysql -u root -p"$WORKING_FORMAT" -e "USE page_test; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in"
    else
        echo "❌ Database access failed"
    fi
    
    echo ""
    echo "💡 Update your .env files with this exact format:"
    echo "   DB_PASSWORD=$WORKING_FORMAT"
else
    echo "❌ No working password format found"
    echo ""
    echo "🔍 Let's check what's actually configured in MySQL..."
    echo "Try running: sudo mysql -e \"SELECT user, host, plugin FROM mysql.user WHERE user='root';\""
fi 