# Git TLS Connection Fix for Cloud Servers

This guide helps fix the "GnuTLS recv error (-110): The TLS connection was non-properly terminated" error when pulling from GitHub.

## Quick Fix (Try This First)

```bash
# Disable SSL verification (quick fix)
git config --global http.sslVerify false
git config --global http.postBuffer 524288000

# Try pulling again
git pull origin master
```

## If Quick Fix Doesn't Work

### Method 1: Update Git Configuration

```bash
# Update Git configuration for better TLS handling
git config --global http.version HTTP/1.1
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
git config --global url."https://".insteadOf git://
git config --global http.maxRequestBuffer 100M
git config --global core.compression 9

# Try pulling again
git pull origin master
```

### Method 2: Use SSH Instead of HTTPS

```bash
# Change remote URL to SSH
git remote set-url origin git@github.com:huangdanqi/30_HEWAN_PAGE.git

# Try pulling again
git pull origin master
```

### Method 3: Update Git and System

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Git
sudo apt install git -y

# Try pulling again
git pull origin master
```

### Method 4: Change DNS

```bash
# Add Google DNS
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf

# Try pulling again
git pull origin master
```

### Method 5: Manual Download (Last Resort)

If all else fails, you can manually download the files:

1. **Go to GitHub web interface**: https://github.com/huangdanqi/30_HEWAN_PAGE
2. **Click "Code" button** → "Download ZIP"
3. **Upload to your server** using SCP or SFTP:
   ```bash
   # From your local machine
   scp 30_HEWAN_PAGE.zip root@121.43.196.106:/root/frontendCode/vue3/
   ```
4. **Extract on server**:
   ```bash
   cd /root/frontendCode/vue3
   unzip 30_HEWAN_PAGE.zip
   cp -r 30_HEWAN_PAGE/* .
   rm -rf 30_HEWAN_PAGE 30_HEWAN_PAGE.zip
   ```

## Using the Fix Script

If you have the `fix_git_tls.sh` script:

```bash
# Make it executable
chmod +x fix_git_tls.sh

# Run it
./fix_git_tls.sh
```

## Alternative: Clone Fresh

If the repository is corrupted or you want to start fresh:

```bash
# Backup current changes (if any)
cd /root/frontendCode
mv vue3 vue3_backup

# Clone fresh
git clone https://github.com/huangdanqi/30_HEWAN_PAGE.git vue3
cd vue3

# Copy any important files from backup
cp -r ../vue3_backup/.env . 2>/dev/null || echo "No .env to copy"
cp -r ../vue3_backup/node_modules . 2>/dev/null || echo "No node_modules to copy"
```

## Check Connection

Test if you can reach GitHub:

```bash
# Test DNS resolution
nslookup github.com

# Test HTTPS connection
curl -I https://github.com

# Test Git connection
git ls-remote https://github.com/huangdanqi/30_HEWAN_PAGE.git
```

## Common Issues and Solutions

### Issue: "SSL certificate problem"
```bash
git config --global http.sslVerify false
```

### Issue: "Connection timeout"
```bash
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### Issue: "Buffer overflow"
```bash
git config --global http.postBuffer 524288000
```

### Issue: "Network unreachable"
```bash
# Check if you're behind a proxy
echo $http_proxy
echo $https_proxy

# If you are, configure Git for proxy
git config --global http.proxy http://proxy.example.com:8080
```

## After Fixing

Once you've successfully pulled the changes:

```bash
# Verify the changes
git log --oneline -5

# Check if the new files are there
ls -la start_cloud_dev.sh vite.config.ts

# Make the script executable
chmod +x start_cloud_dev.sh

# Start the development server
./start_cloud_dev.sh
```

## Prevention

To prevent this issue in the future:

```bash
# Add these to your ~/.bashrc or ~/.profile
echo 'export GIT_SSL_NO_VERIFY=true' >> ~/.bashrc
echo 'export GIT_HTTP_MAX_RETRIES=10' >> ~/.bashrc
source ~/.bashrc
``` 