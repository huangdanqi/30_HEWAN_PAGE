# Cloud Development Server Setup Guide

This guide will help you run `npm run dev` on your cloud server using port 2830 and make it accessible via the public IP address.

## Prerequisites

1. **Node.js and npm** installed on your cloud server
2. **Firewall access** to port 2830
3. **SSH access** to your cloud server

## Step 1: SSH into Your Cloud Server

```bash
ssh root@121.43.196.106
cd /root/frontendCode/vue3
```

## Step 2: Install Dependencies

```bash
# Install dependencies if not already installed
npm install
```

## Step 3: Configure Firewall (Important!)

### For Ubuntu/Debian:
```bash
sudo ufw allow 2830
sudo ufw status
```

### For CentOS/RHEL:
```bash
sudo firewall-cmd --permanent --add-port=2830/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

### For Cloud Provider Firewall:
- **Alibaba Cloud**: Go to ECS Console → Security Groups → Add Rule (Port 2830)
- **AWS**: Go to EC2 Console → Security Groups → Inbound Rules → Add Rule (Port 2830)
- **Azure**: Go to Virtual Machines → Networking → Add Inbound Port Rule (Port 2830)

## Step 4: Start the Development Server

### Option 1: Using the provided script (Recommended)
```bash
# Make the script executable
chmod +x start_cloud_dev.sh

# Run the script
./start_cloud_dev.sh
```

### Option 2: Manual start
```bash
# Set environment variables
export NODE_ENV=development
export VITE_API_BASE_URL=http://127.0.0.1:2829

# Start the development server
npm run dev
```

## Step 5: Access Your Application

Once the server is running, you can access it at:

- **Local (on server)**: `http://localhost:2830`
- **Public IP**: `http://121.43.196.106:2830`

## Step 6: Start the Backend Server (Optional)

If you also want to run the backend API server:

```bash
# In a new terminal session
cd server
npm install
npm start
```

The backend will run on port 2829 and will be accessible at:
- **Local**: `http://localhost:2829`
- **Public**: `http://121.43.196.106:2829`

## Troubleshooting

### Port Already in Use
If port 2830 is already in use:
```bash
# Find what's using the port
sudo netstat -tulpn | grep :2830

# Kill the process
sudo kill -9 <PID>
```

### Permission Denied
If you get permission errors:
```bash
# Make sure you have the right permissions
sudo chown -R $USER:$USER .
chmod +x start_cloud_dev.sh
```

### Firewall Issues
If you can't access from outside:
```bash
# Check if the port is open
sudo netstat -tulpn | grep :2830

# Test locally
curl http://localhost:2830

# Test from another machine
curl http://121.43.196.106:2830
```

## Environment Variables

The following environment variables are automatically set:

- `NODE_ENV=development`
- `VITE_API_BASE_URL=http://127.0.0.1:2829`

## Security Considerations

1. **Development Only**: This setup is for development purposes only
2. **Firewall**: Only open the necessary ports (2830 for frontend, 2829 for backend)
3. **HTTPS**: For production, use HTTPS with proper SSL certificates
4. **Authentication**: Implement proper authentication for production use

## Stopping the Server

To stop the development server:
- Press `Ctrl+C` in the terminal where the server is running

## Restarting the Server

If you need to restart the server:
```bash
# Stop the current server (Ctrl+C)
# Then start it again
./start_cloud_dev.sh
```

## Monitoring

To monitor the server:
```bash
# Check if the process is running
ps aux | grep node

# Check the logs
tail -f ~/.npm/_logs/*.log
```

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify firewall settings
3. Ensure all dependencies are installed
4. Check if the ports are not being used by other services 