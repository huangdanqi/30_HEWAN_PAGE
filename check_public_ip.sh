#!/bin/bash

# Check Public IP Script
# This script helps identify the correct public IP address for your server

echo "🔍 Checking public IP addresses..."

# Method 1: External services
echo "📡 Method 1: External IP services"
echo "   ifconfig.me: $(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo 'Failed')"
echo "   ipinfo.io: $(curl -s --max-time 3 ipinfo.io/ip 2>/dev/null || echo 'Failed')"
echo "   icanhazip.com: $(curl -s --max-time 3 icanhazip.com 2>/dev/null || echo 'Failed')"

# Method 2: Network interfaces
echo ""
echo "🌐 Method 2: Network interfaces"
echo "   Default route IP: $(ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo 'Failed')"

# Method 3: All network interfaces
echo ""
echo "🔗 Method 3: All network interfaces"
ip addr show | grep -E "inet " | grep -v "127.0.0.1" | awk '{print "   " $2}' | head -5

# Method 4: Check if port is accessible
echo ""
echo "🔌 Method 4: Port accessibility check"
if netstat -tuln | grep -q ":2830 "; then
    echo "   ✅ Port 2830 is in use"
    netstat -tuln | grep ":2830"
else
    echo "   ❌ Port 2830 is not in use"
fi

echo ""
echo "💡 To access your application:"
echo "   1. Use the public IP from Method 1 (if available)"
echo "   2. Make sure port 2830 is open in your firewall"
echo "   3. Try: http://YOUR_PUBLIC_IP:2830"
echo ""
echo "🔧 If you're still having issues:"
echo "   - Check your cloud provider's firewall settings"
echo "   - Ensure port 2830 is open in the security group"
echo "   - Try accessing from a different network" 