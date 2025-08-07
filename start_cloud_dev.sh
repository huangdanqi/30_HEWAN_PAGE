#!/bin/bash

# Cloud Development Server Startup Script
# This script starts the Vue.js development server on the cloud server
# with proper configuration for external access

echo "🚀 Starting Vue.js Development Server on Cloud..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Get the public IP address
echo "🌐 Detecting public IP address..."
PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || curl -s --max-time 5 ipinfo.io/ip 2>/dev/null || curl -s --max-time 5 icanhazip.com 2>/dev/null || echo "localhost")

# If we can't get public IP, try to get it from the server
if [ "$PUBLIC_IP" = "localhost" ] || [ -z "$PUBLIC_IP" ]; then
    # Try to get IP from network interfaces
    PUBLIC_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo "localhost")
fi

# Set environment variables for cloud deployment
export NODE_ENV=development
export VITE_API_BASE_URL=http://127.0.0.1:2829
export VITE_PORT=2830
export VITE_HOST=0.0.0.0

echo "🌐 Server will be accessible at:"
echo "   Local: http://localhost:2830"
echo "   Public: http://$PUBLIC_IP:2830"
echo ""
echo "⚠️  Make sure port 2830 is open in your firewall!"
echo "   For Ubuntu/Debian: sudo ufw allow 2830"
echo "   For CentOS/RHEL: sudo firewall-cmd --permanent --add-port=2830/tcp && sudo firewall-cmd --reload"
echo ""

# Check if port is already in use
if netstat -tuln | grep -q ":2830 "; then
    echo "⚠️  Port 2830 is already in use. Stopping existing process..."
    sudo pkill -f "vite.*2830" 2>/dev/null || true
    sleep 2
fi

# Start the development server
echo "🎯 Starting development server..."
echo "   Press Ctrl+C to stop the server"
echo ""
echo "💡 IMPORTANT: Use the Public IP address above to access from outside:"
echo "   http://$PUBLIC_IP:2830"
echo ""

# Use npx to ensure we're using the local vite installation
npx vite --port 2830 --host 0.0.0.0 