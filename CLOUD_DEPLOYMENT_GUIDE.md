# HeWan Page Server - Cloud Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the HeWan Page Server to cloud infrastructure, including database setup, IP configuration, and schema verification.

## 🏗️ Architecture Overview

### Current System Components
- **Frontend**: Vue 3 + TypeScript + Ant Design Vue
- **Backend**: Node.js + Express + MySQL
- **Database**: MySQL 8.0 with utf8mb4_unicode_ci charset
- **File Storage**: Local file system with static serving
- **API**: RESTful API with CORS support

### Server Configuration
- **Backend Port**: 2829 (configurable via PORT env var)
- **Frontend Port**: 2830 (configurable via VITE_PORT env var)
- **Database Host**: 121.43.196.106 (cloud server)
- **Database Port**: 3306
- **Database Name**: page_test

## 🌐 IP Configuration

### Current IP Settings

#### Backend Server Configuration
```javascript
// server/config/database.js
host: process.env.DB_HOST || '121.43.196.106'
port: process.env.DB_PORT || 3306
```

#### Frontend Proxy Configuration
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: process.env.VITE_API_BASE_URL || 'http://139.196.23.139:2829'
  }
}
```

### IP Management System
The system includes an IP management module that:
- Generates unique IP addresses (192.168.1.x range)
- Manages IP-to-device mappings
- Tracks IP status (在线/离线/维护)
- Supports IP role assignments

## 🗄️ Database Schema

### Complete Database Structure

The system uses **18 main tables** with comprehensive relationships:

#### Core Tables
1. **account_data** - User account information
2. **product_list** - Product inventory management
3. **device_management** - Device lifecycle tracking
4. **device_type** - Device model definitions
5. **firmware** - Firmware version management
6. **device_production** - Production tracking
7. **product_type** - Product type definitions
8. **toy_production_new** - Toy production records

#### IP Management Tables
9. **ip_management** - IP character management
10. **ipaudio** - IP audio resources
11. **ipvideo** - IP video resources
12. **ipimage** - IP image resources
13. **ipmusic** - IP music resources

#### Configuration Tables
14. **alarm** - Alarm/notification system
15. **bom** - Bill of Materials
16. **model_configuration** - AI model configurations
17. **agent_configuration** - Agent configurations
18. **toolconfiguration** - Tool configurations

### Schema Verification

#### Database Creation Script
```sql
-- Database setup
CREATE DATABASE IF NOT EXISTS hewan_page_server 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hewan_page_server;
```

#### Key Schema Features
- **Character Set**: utf8mb4_unicode_ci (supports full Unicode including emojis)
- **Engine**: InnoDB (ACID compliance, foreign key support)
- **Indexing**: Comprehensive indexing on frequently queried columns
- **Timestamps**: Automatic creation and update timestamps
- **Constraints**: Unique constraints on critical fields

## 🚀 Deployment Steps

### 1. Server Preparation

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL 8.0
sudo apt install mysql-server-8.0 -y

# Install Git
sudo apt install git -y
```

#### Environment Setup
```bash
# Create application directory
sudo mkdir -p /var/www/hewan-page-server
sudo chown -R $USER:$USER /var/www/hewan-page-server
cd /var/www/hewan-page-server

# Clone repository
git clone <your-repo-url> .
```

### 2. Database Setup

#### MySQL Configuration
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE hewan_page_server CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with remote access
CREATE USER 'hewan_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON hewan_page_server.* TO 'hewan_user'@'%';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

#### Schema Deployment
```bash
# Run the complete database setup
mysql -u hewan_user -p hewan_page_server < server/database/setup_complete_database.sql

# Verify schema
mysql -u hewan_user -p hewan_page_server -e "SHOW TABLES;"
```

### 3. Application Configuration

#### Environment Variables
Create `.env` file:
```bash
# Database Configuration
DB_HOST=121.43.196.106
DB_PORT=3306
DB_USER=hewan_user
DB_PASSWORD=your_secure_password
DB_NAME=hewan_page_server

# Server Configuration
PORT=2829
NODE_ENV=production

# Frontend Configuration
VITE_API_BASE_URL=http://139.196.23.139:2829
VITE_PORT=2830
```

#### Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies (if separate)
cd src && npm install && cd ..
```

### 4. File System Setup

#### Create Required Directories
```bash
# Create public directories
mkdir -p public/{audio,images,videos,firmware,bom-files,QRcode,barcode}

# Set permissions
chmod -R 755 public/
```

#### Static File Configuration
The server serves static files from these endpoints:
- `/audio` → `public/audio/`
- `/images` → `public/images/`
- `/videos` → `public/videos/`
- `/firmware` → `public/firmware/`
- `/bom-files` → `public/bom-files/`
- `/QRcode` → `public/QRcode/`
- `/barcode` → `public/barcode/`

### 5. Process Management

#### PM2 Setup (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hewan-page-server',
    script: 'server/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 2829
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Reverse Proxy Setup (Nginx)

#### Install Nginx
```bash
sudo apt install nginx -y
```

#### Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/hewan-page-server
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend (Vue.js)
    location / {
        root /var/www/hewan-page-server/docs;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:2829;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /audio/ {
        alias /var/www/hewan-page-server/public/audio/;
    }
    
    location /images/ {
        alias /var/www/hewan-page-server/public/images/;
    }
    
    location /videos/ {
        alias /var/www/hewan-page-server/public/videos/;
    }
    
    location /firmware/ {
        alias /var/www/hewan-page-server/public/firmware/;
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/hewan-page-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Configuration Management

### IP Address Management

#### Dynamic IP Assignment
The system automatically assigns IP addresses in the 192.168.1.x range:
```javascript
// From ipManagement.js
ipAddress = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
```

#### IP Conflict Resolution
- Checks for existing IP addresses before assignment
- Falls back to timestamp-based IP if conflicts occur
- Supports up to 10 retry attempts

### Database Connection Pooling
```javascript
// Connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || '121.43.196.106',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: password,
  database: process.env.DB_NAME || 'page_test',
  charset: 'utf8mb4',
  connectionLimit: 10,
  timezone: '+00:00'
});
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# API health check
curl http://localhost:2829/api/health

# Database connection test
mysql -u hewan_user -p -e "SELECT 1;"
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs hewan-page-server

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Maintenance
```sql
-- Check table status
SHOW TABLE STATUS;

-- Analyze tables for optimization
ANALYZE TABLE account_data, product_list, device_management;

-- Check for slow queries
SHOW PROCESSLIST;
```

## 🔒 Security Considerations

### Database Security
- Use strong passwords for database users
- Limit database user privileges
- Enable SSL for database connections
- Regular security updates

### Application Security
- Environment variable protection
- CORS configuration
- Input validation and sanitization
- File upload restrictions

### Server Security
- Firewall configuration (UFW)
- SSH key authentication
- Regular system updates
- SSL/TLS encryption

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection
mysql -u hewan_user -p -h 121.43.196.106
```

#### Port Conflicts
```bash
# Check port usage
sudo netstat -tlnp | grep :2829
sudo netstat -tlnp | grep :2830
```

#### File Permission Issues
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/hewan-page-server/public/
sudo chmod -R 755 /var/www/hewan-page-server/public/
```

### Performance Optimization

#### Database Optimization
- Regular index analysis
- Query optimization
- Connection pool tuning
- Memory allocation adjustment

#### Application Optimization
- PM2 cluster mode
- Static file caching
- Gzip compression
- CDN integration

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database replication
- Session management
- File storage solutions

### Vertical Scaling
- Server resource monitoring
- Database performance tuning
- Application optimization
- Caching strategies

## 📝 Deployment Checklist

- [ ] Server environment prepared
- [ ] Database created and configured
- [ ] Schema deployed successfully
- [ ] Application dependencies installed
- [ ] Environment variables configured
- [ ] File directories created
- [ ] Process manager configured
- [ ] Reverse proxy setup
- [ ] SSL certificate installed
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Security measures implemented
- [ ] Backup strategy in place

## 🔄 Update Procedures

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart hewan-page-server
```

### Database Updates
```bash
# Backup database
mysqldump -u hewan_user -p hewan_page_server > backup_$(date +%Y%m%d).sql

# Apply schema updates
mysql -u hewan_user -p hewan_page_server < update_script.sql
```

## 📞 Support Information

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+
- **Node.js**: 18.0+
- **MySQL**: 8.0+
- **Memory**: 2GB+ RAM
- **Storage**: 20GB+ SSD
- **Network**: Stable internet connection

### Contact Information
- **Technical Support**: [Your support email]
- **Documentation**: [Your documentation URL]
- **Issue Tracking**: [Your issue tracker URL]

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: HeWan Development Team

