# SSH Key Troubleshooting Guide

If you're getting "Permission denied (publickey)" errors, follow these steps:

## Step 1: Verify Your Private Key Format

Your `EC2_SSH_PRIVATE_KEY` secret should contain the **entire** private key file, including headers:

```
-----BEGIN RSA PRIVATE KEY-----
[your key content here]
-----END RSA PRIVATE KEY-----
```

Or for newer keys:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[your key content here]
-----END OPENSSH PRIVATE KEY-----
```

**Common Issues:**
- ❌ Missing header/footer lines
- ❌ Extra spaces or newlines at the beginning/end
- ❌ Only partial key content
- ❌ Wrong key file (using public key instead of private key)

## Step 2: Verify Public Key is on EC2 Instance

SSH into your EC2 instance and check:

```bash
# SSH into EC2 manually
ssh -i your-key.pem ec2-user@your-ec2-ip

# Check authorized_keys
cat ~/.ssh/authorized_keys

# Your public key should be listed here
```

If your public key is NOT in `~/.ssh/authorized_keys`, add it:

```bash
# On your local machine, get your public key
ssh-keygen -y -f your-key.pem > public_key.pub

# Copy public key to EC2
cat public_key.pub | ssh -i your-key.pem ec2-user@your-ec2-ip "cat >> ~/.ssh/authorized_keys"

# Set correct permissions
ssh -i your-key.pem ec2-user@your-ec2-ip "chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"
```

## Step 3: Verify EC2 Instance Configuration

### Check EC2 User
Different AMIs use different default users:
- Amazon Linux 2023/2: `ec2-user`
- Ubuntu: `ubuntu`
- Debian: `admin`
- RHEL: `ec2-user` or `root`
- SUSE: `ec2-user`

Verify by checking your EC2 instance details in AWS Console.

### Check Security Group
Your EC2 security group must allow SSH (port 22) from:
- Your IP address (for manual testing)
- GitHub Actions IP ranges (for CI/CD)

GitHub Actions IPs change, so consider:
- Allowing SSH from `0.0.0.0/0` temporarily (not recommended for production)
- Using a bastion host
- Using AWS Systems Manager Session Manager instead of SSH

## Step 4: Test SSH Connection Locally

Test your SSH connection from your local machine:

```bash
# Test connection
ssh -i your-key.pem ec2-user@your-ec2-ip

# If that works, test with verbose output
ssh -v -i your-key.pem ec2-user@your-ec2-ip
```

If this works locally but fails in GitHub Actions, the issue is likely:
1. Key format in GitHub Secrets
2. Key mismatch (different key pair)

## Step 5: Verify GitHub Secrets

Double-check your GitHub Secrets:

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Verify `EC2_SSH_PRIVATE_KEY` contains:
   - Complete private key
   - Header line (`-----BEGIN...`)
   - Footer line (`-----END...`)
   - No extra spaces before/after
3. Verify `EC2_HOST` is just the IP or hostname (no `http://` or port)
4. Verify `EC2_USER` matches your AMI's default user

## Step 6: Extract Public Key from Private Key

If you only have the private key, extract the public key:

```bash
# For RSA keys
ssh-keygen -y -f your-private-key.pem > public-key.pub

# For OpenSSH format keys
ssh-keygen -y -f your-private-key.pem > public-key.pub
```

Then add the public key to EC2:

```bash
cat public-key.pub | ssh -i your-private-key.pem ec2-user@your-ec2-ip "cat >> ~/.ssh/authorized_keys"
```

## Step 7: Alternative - Use EC2 Instance Connect

If SSH keys continue to fail, you can use AWS Systems Manager Session Manager:

1. Install SSM Agent on EC2 (usually pre-installed on Amazon Linux)
2. Attach IAM role with `AmazonSSMManagedInstanceCore` policy
3. Use AWS CLI to connect without SSH keys

## Common Error Messages

### "Permission denied (publickey)"
- Public key not in `~/.ssh/authorized_keys` on EC2
- Wrong private key in GitHub Secrets
- Key format issues

### "Host key verification failed"
- EC2 host key changed (usually harmless, workflow handles this)

### "Connection timed out"
- Security group blocking SSH
- EC2 instance not running
- Wrong IP address

### "Could not resolve hostname"
- Wrong `EC2_HOST` value
- DNS issues

## Quick Fix Script

Run this on your EC2 instance to ensure SSH is properly configured:

```bash
#!/bin/bash
# Run as ec2-user on EC2 instance

# Ensure .ssh directory exists with correct permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Ensure authorized_keys has correct permissions
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Verify SSH service is running
sudo systemctl status sshd || sudo systemctl status ssh

echo "SSH configuration verified!"
```

## Still Having Issues?

1. Check GitHub Actions logs for detailed error messages
2. Compare your local SSH connection (that works) with GitHub Actions
3. Consider using AWS CodeDeploy or other deployment methods
4. Verify EC2 instance is running and accessible

