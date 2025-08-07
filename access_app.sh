#!/bin/bash

# Access Application Script
# This script shows the correct URLs to access your application

echo "🌐 Application Access Information"
echo "================================"

# Get the public IP address
PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || curl -s --max-time 5 ipinfo.io/ip 2>/dev/null || curl -s --max-time 5 icanhazip.com 2>/dev/null || echo "localhost")

echo ""
echo "📍 Access URLs:"
echo "   Local (on server):     http://localhost:2830"
echo "   Public (from internet): http://$PUBLIC_IP:2830"
echo ""

# Check if the server is running
if netstat -tuln | grep -q ":2830 "; then
    echo "✅ Server is running on port 2830"
    echo ""
    echo "🔗 Active connections:"
    netstat -tuln | grep ":2830"
    echo ""
    
    # Test local connection
    echo "🧪 Testing local connection..."
    if curl -s --max-time 3 http://localhost:2830 > /dev/null 2>&1; then
        echo "   ✅ Local connection works"
    else
        echo "   ❌ Local connection failed"
    fi
    
    echo ""
    echo "🎯 To access your application:"
    echo "   1. From the same server: http://localhost:2830"
    echo "   2. From the internet: http://$PUBLIC_IP:2830"
    echo ""
    echo "🔧 If you can't access from the internet:"
    echo "   1. Check firewall: sudo ufw status"
    echo "   2. Open port: sudo ufw allow 2830"
    echo "   3. Check cloud provider firewall settings"
    
else
    echo "❌ Server is not running on port 2830"
    echo ""
    echo "🚀 To start the server:"
    echo "   ./start_cloud_dev.sh"
fi

echo ""
echo "📋 Quick Commands:"
echo "   Start server: ./start_cloud_dev.sh"
echo "   Check IP: ./check_public_ip.sh"
echo "   Stop server: Ctrl+C (in the server terminal)"
echo "   Check firewall: sudo ufw status" 