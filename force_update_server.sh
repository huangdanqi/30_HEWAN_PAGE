#!/bin/bash

echo "=== Force Updating Cloud Server ==="

# SSH into the server and force pull the latest code
ssh root@121.43.196.106 << 'EOF'
cd ~/frontendCode/vue3/30_HEWAN_PAGE

echo "Current directory: $(pwd)"
echo "Current git status:"
git status

echo "Fetching latest changes..."
git fetch origin

echo "Current commit:"
git log --oneline -1

echo "Pulling latest changes..."
git pull origin master

echo "New commit:"
git log --oneline -1

echo "Checking if IPManagement.vue has the fix..."
grep -n "http://121.43.196.106:2829/api/ip-management" src/views/IPManagement.vue

echo "Restarting development server..."
pkill -f "npm run dev"
pkill -f "node server.js"

cd server
node server.js &
cd ..

npm run dev &

echo "Server restarted!"
EOF

echo "=== Update Complete ===" 