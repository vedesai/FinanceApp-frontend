# Service Troubleshooting Guide

If your service is stuck in "activating" state or fails to start, follow these steps:

## Step 1: Check Service Status

```bash
sudo systemctl status finance-app
```

Look for:
- **Active: active (running)** - Service is running ✓
- **Active: activating** - Service is trying to start (check logs)
- **Active: failed** - Service failed to start (check logs)

## Step 2: Check Service Logs

```bash
# View recent logs
sudo journalctl -u finance-app -n 50 --no-pager

# Follow logs in real-time
sudo journalctl -u finance-app -f

# View logs since boot
sudo journalctl -u finance-app -b
```

Common errors to look for:
- `java: command not found` - Java not installed
- `No such file or directory` - JAR file missing
- `Address already in use` - Port 8080 in use
- `Connection refused` - Database connection issue
- `Permission denied` - File permission issue

## Step 3: Verify Java Installation

```bash
# Check if Java is installed
java -version

# Find Java location
which java

# If not found, install Java 17
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

# Or install default JDK
sudo apt-get install -y default-jdk
```

## Step 4: Verify JAR File

```bash
# Check if JAR exists
ls -lh /opt/finance-app/finance-backend.jar

# Check permissions
sudo chown ubuntu:ubuntu /opt/finance-app/finance-backend.jar
sudo chmod 644 /opt/finance-app/finance-backend.jar

# Test running JAR manually
cd /opt/finance-app
sudo -u ubuntu java -jar finance-backend.jar
```

## Step 5: Check Port Availability

```bash
# Check if port 8080 is in use
sudo netstat -tlnp | grep :8080

# Or use ss
sudo ss -tlnp | grep :8080

# If port is in use, find and stop the process
sudo lsof -i :8080
sudo kill -9 <PID>
```

## Step 6: Verify Environment Variables

```bash
# Check if .env file exists
ls -lh /opt/finance-app/.env

# View environment variables (be careful with passwords)
sudo cat /opt/finance-app/.env

# Test with environment variables
cd /opt/finance-app
source .env
sudo -u ubuntu java -jar finance-backend.jar
```

## Step 7: Check Service File

```bash
# View service file
sudo cat /etc/systemd/system/finance-app.service

# Verify paths in service file are correct
# - WorkingDirectory should exist
# - ExecStart path should be correct
# - User/Group should exist
```

## Step 8: Test Service Manually

```bash
# Stop the service
sudo systemctl stop finance-app

# Run as ubuntu user to test
sudo -u ubuntu bash -c 'cd /opt/finance-app && java -jar finance-backend.jar'

# If this works, the issue is with systemd configuration
# If this fails, check the error message
```

## Common Issues and Solutions

### Issue: "java: command not found"
**Solution:**
```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk
# Verify installation
java -version
```

### Issue: "No such file or directory"
**Solution:**
```bash
# Check if JAR exists
ls -lh /opt/finance-app/finance-backend.jar

# If missing, redeploy or copy manually
sudo cp /path/to/finance-backend.jar /opt/finance-app/
sudo chown ubuntu:ubuntu /opt/finance-app/finance-backend.jar
```

### Issue: "Address already in use" (Port 8080)
**Solution:**
```bash
# Find process using port 8080
sudo lsof -i :8080
# Kill the process
sudo kill -9 <PID>
# Or change port in application.properties
```

### Issue: "Connection refused" (Database)
**Solution:**
- Verify database is running and accessible
- Check security group allows connections from EC2
- Verify database credentials in `/opt/finance-app/.env`
- Test connection: `psql -h <host> -U <user> -d <database>`

### Issue: "Permission denied"
**Solution:**
```bash
# Fix ownership
sudo chown -R ubuntu:ubuntu /opt/finance-app
# Fix permissions
sudo chmod 644 /opt/finance-app/finance-backend.jar
sudo chmod 600 /opt/finance-app/.env
```

### Issue: Service keeps restarting
**Solution:**
- Check logs for the error causing restart
- Verify environment variables are set correctly
- Check database connectivity
- Verify JAR file is not corrupted

## Step 9: Reload and Restart Service

After making changes:

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Restart service
sudo systemctl restart finance-app

# Check status
sudo systemctl status finance-app

# View logs
sudo journalctl -u finance-app -f
```

## Step 10: Verify Service is Running

```bash
# Check if service is active
sudo systemctl is-active finance-app

# Check if port is listening
sudo netstat -tlnp | grep :8080

# Test API endpoint
curl http://localhost:8080/api/dashboard
```

## Debugging Tips

1. **Run JAR manually first** - This helps isolate if the issue is with the JAR or systemd
2. **Check logs immediately after start** - Errors appear quickly
3. **Verify all paths** - Ensure all paths in service file exist
4. **Test as ubuntu user** - Run commands as the service user
5. **Check system resources** - Ensure enough memory/disk space

## Quick Fix Script

Run this script to diagnose common issues:

```bash
#!/bin/bash
echo "=== Java Check ==="
java -version || echo "Java not installed"
which java || echo "Java not in PATH"

echo ""
echo "=== JAR File Check ==="
ls -lh /opt/finance-app/finance-backend.jar || echo "JAR file not found"

echo ""
echo "=== Port Check ==="
sudo netstat -tlnp | grep :8080 || echo "Port 8080 not in use"

echo ""
echo "=== Service Status ==="
sudo systemctl status finance-app --no-pager -l | head -20

echo ""
echo "=== Recent Logs ==="
sudo journalctl -u finance-app -n 20 --no-pager
```

## Still Having Issues?

1. Check EC2 instance logs in AWS Console
2. Verify EC2 instance has enough resources (CPU, memory)
3. Check CloudWatch logs if configured
4. Try running a minimal Spring Boot app to test Java/systemd setup
5. Review application.properties for configuration issues

