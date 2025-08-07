#!/bin/bash

# Git TLS Fix Script for Cloud Servers
# This script fixes common TLS connection issues when pulling from GitHub

echo "🔧 Fixing Git TLS connection issues..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please navigate to your project directory first."
    exit 1
fi

# Method 1: Disable SSL verification (quick fix)
echo "📝 Method 1: Disabling SSL verification..."
git config --global http.sslVerify false
git config --global http.postBuffer 524288000

# Method 2: Update Git configuration for better TLS handling
echo "📝 Method 2: Updating Git configuration..."
git config --global http.version HTTP/1.1
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# Method 3: Set Git to use HTTPS instead of git protocol
echo "📝 Method 3: Configuring HTTPS..."
git config --global url."https://".insteadOf git://

# Method 4: Increase buffer size for large repositories
echo "📝 Method 4: Increasing buffer sizes..."
git config --global http.postBuffer 524288000
git config --global http.maxRequestBuffer 100M
git config --global core.compression 9

# Method 5: Set timeout values
echo "📝 Method 5: Setting timeout values..."
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 300

echo "✅ Git configuration updated!"
echo ""
echo "🔄 Now trying to pull from GitHub..."

# Try to pull again
if git pull origin master; then
    echo "✅ Successfully pulled from GitHub!"
else
    echo "⚠️  Still having issues. Trying alternative methods..."
    
    # Alternative: Use SSH instead of HTTPS
    echo "🔄 Trying SSH method..."
    git remote set-url origin git@github.com:huangdanqi/30_HEWAN_PAGE.git
    
    if git pull origin master; then
        echo "✅ Successfully pulled using SSH!"
    else
        echo "❌ Still having issues. Please try manual steps:"
        echo ""
        echo "Manual steps to try:"
        echo "1. Check your internet connection: ping github.com"
        echo "2. Try using a different DNS: echo 'nameserver 8.8.8.8' >> /etc/resolv.conf"
        echo "3. Update Git: sudo apt update && sudo apt install git -y"
        echo "4. Try cloning fresh: git clone https://github.com/huangdanqi/30_HEWAN_PAGE.git"
        echo ""
        echo "If all else fails, you can manually download the files from GitHub web interface."
    fi
fi 