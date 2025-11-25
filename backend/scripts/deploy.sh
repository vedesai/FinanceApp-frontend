#!/bin/bash

# Deployment script for Finance App on EC2
# This script is called during CI/CD deployment

set -e

DEPLOY_DIR="/opt/finance-app"
BACKUP_DIR="/opt/finance-app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SERVICE_NAME="finance-app"

echo "Starting deployment..."

# Create directories if they don't exist
sudo mkdir -p $DEPLOY_DIR
sudo mkdir -p $BACKUP_DIR

# Backup existing JAR if it exists
if [ -f "$DEPLOY_DIR/finance-backend.jar" ]; then
  echo "Backing up existing JAR..."
  sudo cp $DEPLOY_DIR/finance-backend.jar $BACKUP_DIR/finance-backend-$TIMESTAMP.jar
  echo "Backup created: $BACKUP_DIR/finance-backend-$TIMESTAMP.jar"
fi

# Stop the service
echo "Stopping service..."
sudo systemctl stop $SERVICE_NAME || true

# Copy new JAR (assuming it's in the current directory)
if [ -f "finance-backend.jar" ]; then
  echo "Copying new JAR..."
  sudo cp finance-backend.jar $DEPLOY_DIR/
  sudo chown ubuntu:ubuntu $DEPLOY_DIR/finance-backend.jar
else
  echo "Error: finance-backend.jar not found in current directory"
  exit 1
fi

# Copy and setup systemd service if it doesn't exist
if [ ! -f /etc/systemd/system/$SERVICE_NAME.service ]; then
  echo "Setting up systemd service..."
  sudo cp finance-app.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable $SERVICE_NAME
fi

# Start the service
echo "Starting service..."
sudo systemctl start $SERVICE_NAME

# Wait a bit and check status
sleep 5
if sudo systemctl is-active --quiet $SERVICE_NAME; then
  echo "Service started successfully!"
  sudo systemctl status $SERVICE_NAME --no-pager
else
  echo "Error: Service failed to start"
  sudo systemctl status $SERVICE_NAME --no-pager
  exit 1
fi

echo "Deployment completed successfully!"

