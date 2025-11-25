#!/bin/bash

# EC2 Initial Setup Script
# Run this script once on a fresh EC2 instance to set up the environment

set -e

echo "Starting EC2 setup for Finance App..."

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Java 17
echo "Installing Java 17..."
sudo yum install -y java-17-amazon-corretto-devel

# Verify Java installation
java -version

# Create application directory
echo "Creating application directories..."
sudo mkdir -p /opt/finance-app
sudo mkdir -p /opt/finance-app/backups
sudo mkdir -p /opt/finance-app/logs
sudo chown -R ubuntu:ubuntu /opt/finance-app

# Install systemd service file
if [ -f "finance-app.service" ]; then
  echo "Installing systemd service..."
  sudo cp finance-app.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable finance-app
  echo "Service installed (not started yet - will start after first deployment)"
else
  echo "Warning: finance-app.service not found. Service will be installed during first deployment."
fi

# Setup environment variables file (optional - can be managed via systemd or AWS Systems Manager)
echo "Creating environment file template..."
sudo tee /opt/finance-app/.env > /dev/null << 'EOF'
# Database Configuration
DB_URL=jdbc:postgresql://your-rds-endpoint.region.rds.amazonaws.com:5432/financedb
DB_USERNAME=postgres
DB_PASSWORD=your_password

# ICICIDirect API Configuration
ICICIDIRECT_APP_KEY=your_app_key
ICICIDIRECT_CLIENT_SECRET=your_client_secret
ICICIDIRECT_USER_ID=your_user_id
ICICIDIRECT_PASSWORD=your_password

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF

sudo chown ubuntu:ubuntu /opt/finance-app/.env
sudo chmod 600 /opt/finance-app/.env

# Configure firewall (if using security groups, this may not be necessary)
echo "Checking firewall configuration..."
if command -v firewall-cmd &> /dev/null; then
  sudo firewall-cmd --permanent --add-port=8080/tcp || true
  sudo firewall-cmd --reload || true
fi

# Setup log rotation
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/finance-app > /dev/null << 'EOF'
/opt/finance-app/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 ubuntu ubuntu
    sharedscripts
}
EOF

echo ""
echo "=========================================="
echo "EC2 setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update /opt/finance-app/.env with your actual configuration values"
echo "2. Or set environment variables via AWS Systems Manager Parameter Store"
echo "3. Deploy the application using the CI/CD pipeline"
echo ""
echo "To manually deploy:"
echo "1. Copy finance-backend.jar to /opt/finance-app/"
echo "2. Start the service: sudo systemctl start finance-app"
echo "3. Check status: sudo systemctl status finance-app"
echo "4. View logs: sudo journalctl -u finance-app -f"
echo ""

