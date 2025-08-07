#!/bin/bash

# Check Server Status Script
# This script checks if the server is running and accessible on the public IP

echo "🔍 Checking Server Status"
echo "========================"

# Get the public IP address
echo "📡 Detecting public IP address..."
PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || curl -s --max-time 5 ipinfo.io/ip 2>/dev/null || curl -s --max-time 5 icanhazip.com 2>/dev/null || echo "localhost")

echo "🌐 Public IP: $PUBLIC_IP"
echo ""

# Check if frontend server is running
echo "🎯 Frontend Server (Port 2830):"
if netstat -tuln | grep -q ":2830 "; then
    echo "   ✅ Running"
    echo "   🔗 Local: http://localhost:2830"
    echo "   🌐 Public: http://$PUBLIC_IP:2830"
    
    # Test local connection
    if curl -s --max-time 3 http://localhost:2830 > /dev/null 2>&1; then
        echo "   ✅ Local connection works"
    else
        echo "   ❌ Local connection failed"
    fi
else
    echo "   ❌ Not running"
    echo "   💡 Start with: ./start_cloud_dev.sh"
fi

echo ""

# Check if backend server is running
echo "🔧 Backend Server (Port 2829):"
if netstat -tuln | grep -q ":2829 "; then
    echo "   ✅ Running"
    echo "   🔗 Local: http://localhost:2829"
    echo "   🌐 Public: http://$PUBLIC_IP:2829"
    
    # Test local connection
    if curl -s --max-time 3 http://localhost:2829/api/health > /dev/null 2>&1; then
        echo "   ✅ Local API connection works"
    else
        echo "   ❌ Local API connection failed"
    fi
else
    echo "   ❌ Not running"
    echo "   💡 Start with: cd server && node server.js"
fi

echo ""

# Check firewall status
echo "🔥 Firewall Status:"
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status | grep -E "(Status|2830|2829)")
    echo "   $UFW_STATUS"
else
    echo "   ⚠️  UFW not installed or not available"
fi

echo ""

# Test external accessibility
echo "🌐 External Accessibility Test:"
echo "   Testing frontend (port 2830)..."
if curl -s --max-time 5 "http://$PUBLIC_IP:2830" > /dev/null 2>&1; then
    echo "   ✅ Frontend accessible from internet: http://$PUBLIC_IP:2830"
else
    echo "   ❌ Frontend not accessible from internet"
    echo "   💡 Check firewall: sudo ufw allow 2830"
fi

echo "   Testing backend (port 2829)..."
if curl -s --max-time 5 "http://$PUBLIC_IP:2829/api/health" > /dev/null 2>&1; then
    echo "   ✅ Backend accessible from internet: http://$PUBLIC_IP:2829"
else
    echo "   ❌ Backend not accessible from internet"
    echo "   💡 Check firewall: sudo ufw allow 2829"
fi

echo ""
echo "📋 Quick Commands:"
echo "   Start frontend: ./start_cloud_dev.sh"
echo "   Start backend: cd server && node server.js"
echo "   Check firewall: sudo ufw status"
echo "   Open ports: sudo ufw allow 2830 && sudo ufw allow 2829"
echo ""
echo "🎯 Access URLs:"
echo "   Frontend: http://$PUBLIC_IP:2830"
echo "   Backend: http://$PUBLIC_IP:2829"
echo "   Health check: http://$PUBLIC_IP:2829/api/health" 