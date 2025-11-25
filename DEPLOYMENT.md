# Frontend Deployment Guide - EC2

This guide explains how to deploy the Finance App frontend to an AWS EC2 instance using the CI/CD pipeline.

## Prerequisites

1. **AWS EC2 Instance**
   - Ubuntu 20.04+ or Amazon Linux 2023/2
   - Minimum: t3.small (2 vCPU, 2 GB RAM)
   - Recommended: t3.medium (2 vCPU, 4 GB RAM)
   - Security group allowing:
     - SSH (port 22) from GitHub Actions IPs
     - HTTP (port 80) from public (0.0.0.0/0) or specific IPs

2. **Backend API Running**
   - Backend must be deployed and running on the same EC2 instance (port 8080)
   - Or update nginx configuration to proxy to a different backend URL

3. **GitHub Secrets Configuration**
   - `EC2_HOST`: EC2 instance public IP or hostname
   - `EC2_USER`: SSH username (usually `ubuntu` for Ubuntu, `ec2-user` for Amazon Linux)
   - `EC2_SSH_PRIVATE_KEY`: Private SSH key for EC2 access
   - `REACT_APP_API_URL` (optional): Custom API URL (defaults to `/api` which uses nginx proxy)

## Initial EC2 Setup

### Step 1: Launch EC2 Instance

1. Launch an EC2 instance (Ubuntu 20.04+ recommended)
2. Configure security group:
   - Inbound: SSH (22) from your IP or GitHub Actions IPs
   - Inbound: HTTP (80) from 0.0.0.0/0 (or specific IPs for production)
   - Outbound: All traffic
3. Create or use an existing key pair for SSH access
4. Note the instance public IP or hostname

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `EC2_HOST`: Your EC2 instance public IP (e.g., `54.123.45.67`)
- `EC2_USER`: SSH username (`ubuntu` for Ubuntu, `ec2-user` for Amazon Linux)
- `EC2_SSH_PRIVATE_KEY`: Contents of your private key file (the one matching your EC2 key pair)
- `REACT_APP_API_URL` (optional): Custom backend API URL (defaults to `/api`)

**Important**: The private key should be the full contents of the `.pem` file, including the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines.

### Step 3: Initial EC2 Setup (Optional)

You can run the setup script manually to prepare the EC2 instance:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone the repository (or upload scripts)
git clone <your-repo-url>
cd FinanceApp/frontend

# Run setup script
chmod +x scripts/ec2-setup.sh
./scripts/ec2-setup.sh
```

Alternatively, the GitHub Actions workflow will automatically install and configure nginx during the first deployment.

## CI/CD Deployment

### Automatic Deployment

The pipeline automatically deploys when you push to the `main` branch with changes in the `frontend/` directory.

### Manual Deployment

You can also trigger deployment manually:

1. Go to GitHub Actions tab
2. Select "Deploy Frontend to AWS EC2" workflow
3. Click "Run workflow"

### Deployment Process

The pipeline will:

1. **Build**: Install dependencies and build the React app for production
2. **Package**: Create deployment package with built files
3. **Setup**: Install and configure Nginx on EC2 (if not already installed)
4. **Deploy**: 
   - Copy built files to `/var/www/finance-frontend`
   - Configure Nginx to serve the frontend
   - Configure Nginx to proxy `/api` requests to backend (localhost:8080)
   - Reload Nginx
5. **Verify**: Check that Nginx is running and serving the frontend

## Architecture

```
Internet
   ↓
EC2 Instance (Port 80)
   ↓
Nginx
   ├─→ / → /var/www/finance-frontend (React App)
   └─→ /api → localhost:8080 (Backend API)
```

## Accessing the Application

After deployment, access the frontend at:

```
http://YOUR_EC2_PUBLIC_IP
```

Example:
```
http://54.123.45.67
```

The frontend will automatically proxy API requests to `/api` which Nginx forwards to the backend on `localhost:8080`.

## Nginx Configuration

The deployment creates an Nginx configuration at `/etc/nginx/sites-available/finance-frontend`:

- Serves static files from `/var/www/finance-frontend`
- Handles React Router (SPA) routing with `try_files`
- Proxies `/api/*` requests to backend on `localhost:8080`
- Enables gzip compression
- Sets appropriate cache headers

## Service Management

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### View Nginx Logs

```bash
# Error logs
sudo tail -f /var/log/nginx/error.log

# Access logs
sudo tail -f /var/log/nginx/access.log
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

### Reload Nginx Configuration

```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx  # Reload without downtime
```

## Troubleshooting

### Frontend Not Accessible

1. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

2. Check if port 80 is listening:
   ```bash
   sudo netstat -tlnp | grep :80
   ```

3. Verify security group allows HTTP (port 80) traffic

4. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

5. Verify frontend files exist:
   ```bash
   ls -la /var/www/finance-frontend/
   ```

### API Requests Failing

1. Verify backend is running:
   ```bash
   sudo systemctl status finance-app
   curl http://localhost:8080/api/dashboard
   ```

2. Check Nginx proxy configuration:
   ```bash
   sudo cat /etc/nginx/sites-available/finance-frontend
   ```

3. Test Nginx configuration:
   ```bash
   sudo nginx -t
   ```

### Build Errors

1. Check GitHub Actions logs for specific errors
2. Verify Node.js version compatibility
3. Check for dependency issues in `package.json`

### Deployment Failures

1. Check GitHub Actions logs for specific errors
2. Verify SSH key is correctly configured in GitHub Secrets
3. Ensure EC2 instance is running and accessible
4. Check disk space on EC2:
   ```bash
   df -h
   ```

## Custom API URL

If your backend is hosted elsewhere, you can configure a custom API URL:

1. Set `REACT_APP_API_URL` in GitHub Secrets (e.g., `https://api.example.com/api`)
2. Update Nginx configuration to proxy to the custom URL instead of `localhost:8080`

Or update the API service in `src/services/api.js` to use environment variables.

## Security Best Practices

1. **Use HTTPS**: Set up SSL certificate with Let's Encrypt or AWS Certificate Manager
2. **Restrict SSH access**: Limit SSH (port 22) to specific IPs in security group
3. **Use IAM roles**: Use IAM roles instead of access keys when possible
4. **Enable CloudWatch Logs**: Monitor Nginx access and error logs
5. **Regular updates**: Keep EC2 instance and Nginx updated
6. **Firewall**: Use UFW or security groups to restrict unnecessary ports
7. **Backup**: Regularly backup `/var/www/finance-frontend` directory

## SSL/HTTPS Setup (Optional)

To enable HTTPS:

1. Install Certbot:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. Certbot will automatically update Nginx configuration

## Rollback

To rollback to a previous version:

```bash
# List backups
ls -la /var/www/finance-frontend/backups/

# Stop Nginx
sudo systemctl stop nginx

# Restore backup
cd /var/www/finance-frontend
sudo rm -rf *
sudo tar -xzf backups/frontend-YYYYMMDD_HHMMSS.tar.gz

# Restart Nginx
sudo systemctl start nginx
```

## Monitoring

### CloudWatch Integration

Consider setting up CloudWatch agent to monitor:
- Nginx access logs
- Nginx error logs
- EC2 instance metrics (CPU, memory, disk)

### Health Checks

Add a health check endpoint or monitor:
- HTTP response codes from Nginx
- Backend API availability
- Frontend load time

## Scaling

For production, consider:
- **Application Load Balancer**: For high availability
- **Auto Scaling Group**: For automatic scaling
- **CloudFront CDN**: For global content delivery
- **Multiple EC2 instances**: Behind a load balancer

## Next Steps

- Configure custom domain with Route 53
- Set up SSL certificate with AWS Certificate Manager or Let's Encrypt
- Configure CloudWatch alarms
- Set up automated backups
- Enable CloudFront CDN for better performance

