#!/bin/bash

################################################################################
# Daloy SSL/HTTPS Setup Script
# This script automates Let's Encrypt SSL certificate installation
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Daloy SSL/HTTPS Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Configuration
DOMAIN_BACKEND="api.daloy.com"
DOMAIN_FRONTEND="daloy.com"
EMAIL="admin@daloy.com"  # Update with your email

echo -e "${YELLOW}This script will:${NC}"
echo "1. Install certbot (Let's Encrypt client)"
echo "2. Stop Nginx temporarily"
echo "3. Generate SSL certificates for:"
echo "   - $DOMAIN_BACKEND"
echo "   - $DOMAIN_FRONTEND"
echo "4. Configure automatic renewal"
echo "5. Start Nginx with SSL"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Install certbot
echo -e "${GREEN}[1/6] Installing certbot...${NC}"
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Step 2: Stop Nginx
echo -e "${GREEN}[2/6] Stopping Nginx...${NC}"
systemctl stop nginx

# Step 3: Generate SSL certificate for backend
echo -e "${GREEN}[3/6] Generating SSL certificate for $DOMAIN_BACKEND...${NC}"
certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN_BACKEND

# Step 4: Generate SSL certificate for frontend
echo -e "${GREEN}[4/6] Generating SSL certificate for $DOMAIN_FRONTEND...${NC}"
certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN_FRONTEND \
    -d www.$DOMAIN_FRONTEND

# Step 5: Set up automatic renewal
echo -e "${GREEN}[5/6] Configuring automatic renewal...${NC}"

# Test renewal process
certbot renew --dry-run

# Add cron job for automatic renewal (runs twice daily)
CRON_JOB="0 */12 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}Automatic renewal configured (runs twice daily)${NC}"

# Step 6: Start Nginx with SSL
echo -e "${GREEN}[6/6] Starting Nginx with SSL...${NC}"
systemctl start nginx
systemctl enable nginx

# Verify SSL
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}SSL Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${GREEN}Certificates installed for:${NC}"
echo "  ✓ $DOMAIN_BACKEND"
echo "  ✓ $DOMAIN_FRONTEND"
echo "  ✓ www.$DOMAIN_FRONTEND"
echo ""
echo -e "${YELLOW}Certificate Details:${NC}"
certbot certificates

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update Nginx configurations to use SSL"
echo "2. Update .env files with HTTPS URLs"
echo "3. Test HTTPS: https://$DOMAIN_FRONTEND"
echo "4. Test API: https://$DOMAIN_BACKEND/api"
echo "5. Enable HSTS preload at: https://hstspreload.org/"
echo ""
echo -e "${GREEN}Certificates will auto-renew before expiration!${NC}"
