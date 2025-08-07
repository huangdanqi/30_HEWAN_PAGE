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

# Set environment variables for cloud deployment
export NODE_ENV=development
export VITE_API_BASE_URL=http://127.0.0.1:2829

# Get the public IP address
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "localhost")

echo "🌐 Server will be accessible at:"
echo "   Local: http://localhost:2830"
echo "   Public: http://$PUBLIC_IP:2830"
echo ""
echo "⚠️  Make sure port 2830 is open in your firewall!"
echo "   For Ubuntu/Debian: sudo ufw allow 2830"
echo "   For CentOS/RHEL: sudo firewall-cmd --permanent --add-port=2830/tcp && sudo firewall-cmd --reload"
echo ""

# Start the development server
echo "🎯 Starting development server..."
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev 