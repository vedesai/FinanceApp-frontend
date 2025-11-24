# EC2 Deployment Quick Start

## Prerequisites Checklist

- [ ] AWS EC2 instance running (Amazon Linux 2023 or Amazon Linux 2)
- [ ] EC2 security group configured (SSH port 22, HTTP port 8080)
- [ ] EC2 instance has network access to RDS database
- [ ] GitHub repository with Actions enabled
- [ ] SSH key pair for EC2 access

## Step 1: Configure GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_HOST` | EC2 instance public IP or hostname | `54.123.45.67` |
| `EC2_USER` | SSH username | `ec2-user` |
| `EC2_SSH_PRIVATE_KEY` | Full contents of your `.pem` file | `-----BEGIN RSA PRIVATE KEY-----...` |

**Important**: For `EC2_SSH_PRIVATE_KEY`, copy the entire contents of your `.pem` file including the header and footer lines.

## Step 2: Initial EC2 Setup

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

Run the setup script:

```bash
# Clone repository
git clone <your-repo-url>
cd FinanceApp/backend

# Run setup
chmod +x scripts/ec2-setup.sh
./scripts/ec2-setup.sh
```

## Step 3: Configure Environment Variables

Edit the environment file:

```bash
sudo nano /opt/finance-app/.env
```

Add your configuration:

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

Save and set permissions:

```bash
sudo chown ec2-user:ec2-user /opt/finance-app/.env
sudo chmod 600 /opt/finance-app/.env
```

## Step 4: Deploy

### Option A: Automatic Deployment

Push to `main` branch:

```bash
git push origin main
```

The pipeline will automatically deploy when changes are detected in the `backend/` directory.

### Option B: Manual Trigger

1. Go to GitHub Actions tab
2. Select "Deploy to AWS EC2" workflow
3. Click "Run workflow" → "Run workflow"

## Step 5: Verify Deployment

Check service status:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
sudo systemctl status finance-app
```

View logs:

```bash
sudo journalctl -u finance-app -f
```

Test API:

```bash
curl http://your-ec2-ip:8080/api/dashboard
```

## Common Commands

```bash
# Service management
sudo systemctl start finance-app
sudo systemctl stop finance-app
sudo systemctl restart finance-app
sudo systemctl status finance-app

# View logs
sudo journalctl -u finance-app -n 100    # Last 100 lines
sudo journalctl -u finance-app -f         # Follow logs

# Check if running
curl http://localhost:8080/api/dashboard
```

## Troubleshooting

**Service won't start?**
```bash
sudo journalctl -u finance-app -n 50
java -version  # Verify Java 17 is installed
```

**Can't connect to database?**
- Check RDS security group allows EC2 security group
- Verify credentials in `/opt/finance-app/.env`

**Port 8080 not accessible?**
- Check EC2 security group inbound rules
- Verify service is running: `sudo systemctl status finance-app`

For detailed troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md).

