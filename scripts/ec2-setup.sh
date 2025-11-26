#!/bin/bash
# EC2 Setup Script for Frontend Deployment
# This script sets up Nginx and required directories on EC2 for frontend deployment

set -e

echo "========================================="
echo "Finance Frontend - EC2 Setup Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

echo ""
echo "Step 1: Updating system packages..."
sudo apt-get update -qq

echo ""
echo "Step 2: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    echo -e "${GREEN}✓ Nginx installed successfully${NC}"
else
    echo -e "${GREEN}✓ Nginx is already installed${NC}"
    nginx -v
fi

echo ""
echo "Step 3: Creating deployment directories..."
FRONTEND_DIR="/var/www/finance-frontend"
BACKUP_DIR="/var/www/finance-frontend/backups"

sudo mkdir -p $FRONTEND_DIR
sudo mkdir -p $BACKUP_DIR
sudo chown -R $USER:$USER $FRONTEND_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

echo -e "${GREEN}✓ Directories created:${NC}"
echo "  - Frontend: $FRONTEND_DIR"
echo "  - Backups: $BACKUP_DIR"

echo ""
echo "Step 4: Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/finance-frontend"

# Create nginx configuration
sudo tee $NGINX_CONF > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;
    root /var/www/finance-frontend;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONFIG

# Enable site
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/finance-frontend

# Remove default nginx site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
    echo -e "${GREEN}✓ Removed default Nginx site${NC}"
fi

echo ""
echo "Step 5: Testing Nginx configuration..."
sudo nginx -t || {
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
}

echo ""
echo "Step 6: Starting and enabling Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Verify nginx is running
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running successfully!${NC}"
else
    echo -e "${RED}❌ Nginx failed to start!${NC}"
    sudo systemctl status nginx --no-pager -l || true
    exit 1
fi

echo ""
echo "Step 7: Configuring firewall (if ufw is active)..."
if command -v ufw &> /dev/null && sudo ufw status | grep -q "Status: active"; then
    echo "UFW is active. Checking HTTP port..."
    if ! sudo ufw status | grep -q "80/tcp"; then
        echo -e "${YELLOW}⚠ HTTP port 80 is not open in UFW${NC}"
        echo "To allow HTTP traffic, run: sudo ufw allow 80/tcp"
    else
        echo -e "${GREEN}✓ HTTP port 80 is already allowed${NC}"
    fi
fi

echo ""
echo "========================================="
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Ensure EC2 security group allows inbound HTTP (port 80) traffic"
echo "2. Deploy frontend using GitHub Actions workflow"
echo "3. Access frontend at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_EC2_IP')"
echo ""
echo "To check Nginx status: sudo systemctl status nginx"
echo "To view Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""

