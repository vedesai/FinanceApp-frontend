# EC2 Connection Troubleshooting Guide

If you're getting "destination is not reachable" or connection timeout errors, follow these steps:

## Step 1: Verify EC2 Instance Status

1. Go to AWS Console → EC2 → Instances
2. Find your instance
3. Check the **State** - it should be **Running**
4. If stopped, start it and wait for it to be in "Running" state

## Step 2: Check Security Group Configuration

Your EC2 security group must allow SSH (port 22) from GitHub Actions.

### Option A: Allow SSH from Anywhere (Quick Test - Not Recommended for Production)

1. Go to EC2 → Security Groups → Select your security group
2. Edit Inbound Rules
3. Add rule:
   - Type: SSH
   - Protocol: TCP
   - Port: 22
   - Source: `0.0.0.0/0` (Anywhere-IPv4)
   - Description: "Allow SSH from GitHub Actions"

**⚠️ Warning**: This allows SSH from anywhere. For production, use Option B.

### Option B: Allow SSH from Specific IPs (Recommended)

GitHub Actions uses dynamic IPs, but you can:

1. Use GitHub's IP ranges: https://api.github.com/meta
2. Or use AWS Systems Manager Session Manager (no SSH needed)
3. Or use a bastion host/VPN

### Option C: Use AWS Systems Manager Session Manager (Best for Production)

This doesn't require opening SSH port:

1. Attach IAM role to EC2 instance with `AmazonSSMManagedInstanceCore` policy
2. Install SSM Agent (usually pre-installed on Amazon Linux/Ubuntu)
3. Use AWS CLI to connect instead of SSH

## Step 3: Verify EC2_HOST Secret

Your GitHub Secret `EC2_HOST` should be:

- **Public IP address**: `54.123.45.67` (if using public IP)
- **Public DNS**: `ec2-3-233-226-50.compute-1.amazonaws.com` (if using hostname)
- **Private IP**: Only works if GitHub Actions is in same VPC (not possible)

**To find your EC2 public IP/DNS:**
1. Go to EC2 → Instances → Select your instance
2. Check **Public IPv4 address** or **Public IPv4 DNS**

## Step 4: Test Connection Locally

Test SSH from your local machine first:

```bash
# Test with public IP
ssh -i your-key.pem ubuntu@54.123.45.67

# Or test with hostname
ssh -i your-key.pem ubuntu@ec2-3-233-226-50.compute-1.amazonaws.com
```

If this works locally but fails in GitHub Actions:
- Security group is blocking GitHub Actions IPs
- Or GitHub Secrets are incorrect

## Step 5: Check Network ACLs

If using a VPC:

1. Go to VPC → Network ACLs
2. Check inbound/outbound rules allow SSH traffic
3. Default ACLs usually allow all traffic

## Step 6: Verify Instance Has Public IP

1. Go to EC2 → Instances → Select your instance
2. Check **Public IPv4 address** - should not be blank
3. If blank:
   - Stop instance
   - Actions → Networking → Change source/dest. check → Enable
   - Or launch new instance with "Auto-assign Public IP" enabled

## Step 7: Check Route Tables

If instance is in a VPC:

1. Go to VPC → Route Tables
2. Verify route to Internet Gateway (0.0.0.0/0 → igw-xxxxx)
3. Subnet should have route to Internet Gateway

## Common Issues and Solutions

### Issue: "Connection timed out"
- **Cause**: Security group blocking SSH
- **Solution**: Add SSH rule to security group (see Step 2)

### Issue: "Host key verification failed"
- **Cause**: Host key changed (usually harmless)
- **Solution**: Workflow handles this with `StrictHostKeyChecking=no`

### Issue: "Permission denied (publickey)"
- **Cause**: SSH key mismatch
- **Solution**: Verify public key is in `~/.ssh/authorized_keys` on EC2

### Issue: "Destination host unreachable"
- **Cause**: Instance stopped, wrong IP, or network issue
- **Solution**: 
  1. Verify instance is running
  2. Verify correct public IP/DNS
  3. Check security group

## Quick Fix Checklist

- [ ] EC2 instance is **Running**
- [ ] Security group allows **SSH (22)** from `0.0.0.0/0` (for testing) or GitHub IPs
- [ ] Instance has **Public IP** assigned
- [ ] `EC2_HOST` secret is correct (public IP or DNS)
- [ ] `EC2_USER` secret is `ubuntu` (for Ubuntu instances)
- [ ] `EC2_SSH_PRIVATE_KEY` secret contains complete private key
- [ ] Can SSH from local machine successfully

## Alternative: Use Elastic IP

For a stable IP address:

1. Go to EC2 → Elastic IPs → Allocate Elastic IP address
2. Associate it with your EC2 instance
3. Use the Elastic IP in `EC2_HOST` secret

## Alternative: Use AWS Systems Manager

Instead of SSH, use AWS Systems Manager Session Manager:

1. Attach IAM role with `AmazonSSMManagedInstanceCore` policy
2. No SSH port needed in security group
3. More secure and easier to manage

## Still Having Issues?

1. Check EC2 instance **System Log** in AWS Console
2. Check **CloudWatch Logs** for any errors
3. Verify VPC configuration if using custom VPC
4. Try launching a new instance with default settings to test

