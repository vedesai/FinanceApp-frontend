# EC2 Deployment Guide

This guide explains how to deploy the Finance App backend to an AWS EC2 instance using the CI/CD pipeline.

## Prerequisites

1. **AWS EC2 Instance**
   - Amazon Linux 2023 or Amazon Linux 2
   - Minimum: t3.small (2 vCPU, 2 GB RAM)
   - Recommended: t3.medium (2 vCPU, 4 GB RAM)
   - Security group allowing SSH (port 22) and HTTP (port 8080)

2. **GitHub Secrets Configuration**
   - `EC2_HOST`: EC2 instance public IP or hostname
   - `EC2_USER`: SSH username (usually `ec2-user` for Amazon Linux)
   - `EC2_SSH_PRIVATE_KEY`: Private SSH key for EC2 access

3. **Database Access**
   - EC2 instance must have network access to your RDS PostgreSQL database
   - Security group rules configured appropriately

## Initial EC2 Setup

### Step 1: Launch EC2 Instance

1. Launch an EC2 instance (Amazon Linux 2023 or Amazon Linux 2)
2. Configure security group:
   - Inbound: SSH (22) from your IP
   - Inbound: Custom TCP (8080) from your frontend or public
   - Outbound: All traffic
3. Create or use an existing key pair for SSH access
4. Note the instance public IP or hostname

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `EC2_HOST`: Your EC2 instance public IP (e.g., `54.123.45.67`)
- `EC2_USER`: SSH username (usually `ec2-user`)
- `EC2_SSH_PRIVATE_KEY`: Contents of your private key file (the one matching your EC2 key pair)

**Important**: The private key should be the full contents of the `.pem` file, including the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines.

### Step 3: Initial EC2 Configuration

SSH into your EC2 instance and run the setup script:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Clone the repository (or upload scripts)
git clone <your-repo-url>
cd FinanceApp/backend

# Run setup script
chmod +x scripts/ec2-setup.sh
./scripts/ec2-setup.sh
```

Alternatively, you can manually run the setup commands from `scripts/ec2-setup.sh`.

### Step 4: Configure Environment Variables

You have two options for managing environment variables:

#### Option A: Systemd Environment File (Recommended)

Edit `/opt/finance-app/.env`:

```bash
sudo nano /opt/finance-app/.env
```

Update with your actual values:
```bash
DB_URL=jdbc:postgresql://your-rds-endpoint.region.rds.amazonaws.com:5432/financedb
DB_USERNAME=postgres
DB_PASSWORD=your_password
ICICIDIRECT_APP_KEY=your_app_key
ICICIDIRECT_CLIENT_SECRET=your_client_secret
ICICIDIRECT_USER_ID=your_user_id
ICICIDIRECT_PASSWORD=your_password
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Then update the systemd service to source this file, or set them directly in the service file.

#### Option B: AWS Systems Manager Parameter Store

Store secrets in AWS Systems Manager Parameter Store and update the systemd service to fetch them at startup.

#### Option C: Direct in Systemd Service

Edit `/etc/systemd/system/finance-app.service` and update the Environment variables directly.

**Note**: The CI/CD pipeline uses GitHub Secrets for environment variables. You may want to update the workflow to pass these as environment variables or use AWS Systems Manager.

## CI/CD Deployment

### Automatic Deployment

The pipeline automatically deploys when you push to the `main` branch with changes in the `backend/` directory.

### Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub Actions tab
2. Select "Deploy to AWS EC2" workflow
3. Click "Run workflow"

### Deployment Process

The pipeline will:

1. **Build**: Compile and package the Spring Boot application
2. **Package**: Create deployment package with JAR and scripts
3. **Deploy**: 
   - Copy package to EC2 via SSH
   - Backup existing JAR
   - Stop the service
   - Copy new JAR
   - Start the service
4. **Verify**: Check that the service is running

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the application locally
cd backend
mvn clean package -DskipTests

# Copy JAR to EC2
scp -i your-key.pem target/finance-backend-*.jar ec2-user@your-ec2-ip:/tmp/finance-backend.jar

# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Stop service
sudo systemctl stop finance-app

# Copy JAR to deployment directory
sudo cp /tmp/finance-backend.jar /opt/finance-app/
sudo chown ec2-user:ec2-user /opt/finance-app/finance-backend.jar

# Start service
sudo systemctl start finance-app

# Check status
sudo systemctl status finance-app
```

## Service Management

### Start/Stop/Restart Service

```bash
sudo systemctl start finance-app
sudo systemctl stop finance-app
sudo systemctl restart finance-app
sudo systemctl status finance-app
```

### View Logs

```bash
# View recent logs
sudo journalctl -u finance-app -n 100

# Follow logs in real-time
sudo journalctl -u finance-app -f

# View logs since boot
sudo journalctl -u finance-app -b
```

### Enable/Disable Auto-start

```bash
sudo systemctl enable finance-app   # Start on boot
sudo systemctl disable finance-app  # Don't start on boot
```

## Troubleshooting

### Service Won't Start

1. Check service status:
   ```bash
   sudo systemctl status finance-app
   ```

2. Check logs:
   ```bash
   sudo journalctl -u finance-app -n 50
   ```

3. Verify Java is installed:
   ```bash
   java -version
   ```

4. Verify JAR file exists and is readable:
   ```bash
   ls -la /opt/finance-app/finance-backend.jar
   ```

5. Test running JAR manually:
   ```bash
   cd /opt/finance-app
   java -jar finance-backend.jar
   ```

### Application Not Accessible

1. Check if service is running:
   ```bash
   sudo systemctl status finance-app
   ```

2. Check if port 8080 is listening:
   ```bash
   sudo netstat -tlnp | grep 8080
   ```

3. Verify security group allows inbound traffic on port 8080

4. Check application logs for errors:
   ```bash
   sudo journalctl -u finance-app -f
   ```

### Database Connection Issues

1. Verify RDS security group allows connections from EC2 security group
2. Check database credentials in environment variables
3. Test connection from EC2:
   ```bash
   psql -h your-rds-endpoint.region.rds.amazonaws.com -U postgres -d financedb
   ```

### Deployment Failures

1. Check GitHub Actions logs for specific errors
2. Verify SSH key is correctly configured in GitHub Secrets
3. Ensure EC2 instance is running and accessible
4. Check disk space on EC2:
   ```bash
   df -h
   ```

## Security Best Practices

1. **Use AWS Systems Manager Parameter Store** for sensitive environment variables
2. **Restrict SSH access** to specific IPs in security group
3. **Use IAM roles** instead of access keys when possible
4. **Enable CloudWatch Logs** for centralized logging
5. **Regularly update** EC2 instance and Java runtime
6. **Use HTTPS** for production (consider adding nginx reverse proxy)
7. **Rotate SSH keys** regularly
8. **Enable AWS CloudTrail** for audit logging

## Monitoring

### CloudWatch Integration

Consider setting up CloudWatch agent to monitor:
- CPU utilization
- Memory usage
- Disk I/O
- Application logs

### Health Check Endpoint

Add a health check endpoint to your Spring Boot application and configure an Application Load Balancer health check.

## Scaling

For production, consider:
- **Application Load Balancer** for high availability
- **Auto Scaling Group** for automatic scaling
- **Multiple EC2 instances** behind a load balancer
- **RDS Multi-AZ** for database high availability

## Rollback

To rollback to a previous version:

```bash
# List backups
ls -la /opt/finance-app/backups/

# Stop service
sudo systemctl stop finance-app

# Restore backup
sudo cp /opt/finance-app/backups/finance-backend-YYYYMMDD_HHMMSS.jar /opt/finance-app/finance-backend.jar

# Start service
sudo systemctl start finance-app
```

## Next Steps

- Configure custom domain with Route 53
- Set up SSL certificate with AWS Certificate Manager
- Add nginx reverse proxy for HTTPS
- Configure CloudWatch alarms
- Set up automated backups

