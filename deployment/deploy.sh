#!/bin/bash

################################################################################
# DALOY PLATFORM - AUTOMATED DEPLOYMENT SCRIPT
# This script automates the deployment of Daloy to a fresh Ubuntu 22.04 server
################################################################################

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Configuration (Edit these!)
DOMAIN="yourdomain.com"
DB_NAME="daloy_db"
DB_USER="daloy_user"
DB_PASSWORD="CHANGE_ME_$(openssl rand -base64 32 | tr -d '=/+')"
ADMIN_EMAIL="admin@yourdomain.com"
GIT_REPO="https://github.com/yourusername/daloy.git"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Run as a regular user with sudo privileges."
   exit 1
fi

log_info "Starting Daloy Deployment..."
log_info "Domain: $DOMAIN"

# Step 1: System Update
log_info "Step 1/10: Updating system packages..."
sudo apt update && sudo apt upgrade -y
log_success "System updated"

# Step 2: Install Dependencies
log_info "Step 2/10: Installing dependencies..."
sudo apt install -y \
    nginx \
    mysql-server \
    php8.2-fpm \
    php8.2-mysql \
    php8.2-cli \
    php8.2-mbstring \
    php8.2-xml \
    php8.2-zip \
    php8.2-curl \
    php8.2-gd \
    php8.2-bcmath \
    php8.2-redis \
    redis-server \
    git \
    unzip \
    curl \
    supervisor \
    certbot \
    python3-certbot-nginx
log_success "Dependencies installed"

# Step 3: Install Composer
log_info "Step 3/10: Installing Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi
log_success "Composer installed"

# Step 4: Install Node.js
log_info "Step 4/10: Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi
log_success "Node.js installed: $(node -v)"

# Step 5: Configure MySQL
log_info "Step 5/10: Configuring MySQL..."
sudo mysql <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
log_success "MySQL configured"
log_warning "Database Password: ${DB_PASSWORD}"
log_warning "Save this password! It won't be shown again."

# Step 6: Clone/Deploy Application
log_info "Step 6/10: Deploying application..."
sudo mkdir -p /var/www/daloy
sudo chown -R $USER:$USER /var/www/daloy

if [ -d "/var/www/daloy/.git" ]; then
    log_info "Updating existing repository..."
    cd /var/www/daloy
    git pull
else
    log_info "Cloning repository..."
    git clone $GIT_REPO /var/www/daloy
    cd /var/www/daloy
fi

# Step 7: Backend Setup
log_info "Step 7/10: Setting up backend..."
cd /var/www/daloy/backend

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Configure .env
    php artisan key:generate
    
    # Update database credentials
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
    sed -i "s/APP_URL=.*/APP_URL=https:\/\/${DOMAIN}/" .env
    sed -i "s/APP_ENV=.*/APP_ENV=production/" .env
    sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/" .env
fi

# Run migrations
php artisan migrate --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

log_success "Backend configured"

# Step 8: Frontend Build
log_info "Step 8/10: Building frontend..."
cd /var/www/daloy

# Install dependencies
npm install

# Build
npm run build

# Create frontend directory
sudo mkdir -p /var/www/daloy/public_html
sudo cp -r dist/* /var/www/daloy/public_html/
sudo chown -R www-data:www-data /var/www/daloy/public_html

log_success "Frontend built"

# Step 9: Configure Nginx
log_info "Step 9/10: Configuring Nginx..."

sudo tee /etc/nginx/sites-available/daloy > /dev/null <<'NGINX_CONFIG'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    
    root /var/www/daloy/public_html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        alias /var/www/daloy/backend/public;
        try_files $uri $uri/ @api;
        
        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/daloy/backend/public/index.php;
        }
    }
    
    location @api {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }

    # Broadcasting endpoint
    location /broadcasting {
        alias /var/www/daloy/backend/public;
        try_files $uri $uri/ @broadcasting;
        
        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/daloy/backend/public/index.php;
        }
    }
    
    location @broadcasting {
        rewrite /broadcasting/(.*)$ /broadcasting/index.php?/$1 last;
    }

    # WebSocket (Reverb)
    location /app {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_CONFIG

# Replace domain placeholder
sudo sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/daloy

# Enable site
sudo ln -sf /etc/nginx/sites-available/daloy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

log_success "Nginx configured"

# Step 10: Setup Supervisor (Queue & Reverb)
log_info "Step 10/10: Setting up background services..."

# Queue Worker
sudo tee /etc/supervisor/conf.d/daloy-worker.conf > /dev/null <<EOF
[program:daloy-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/daloy/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/daloy/backend/storage/logs/worker.log
EOF

# Reverb Server
sudo tee /etc/supervisor/conf.d/daloy-reverb.conf > /dev/null <<EOF
[program:daloy-reverb]
command=php /var/www/daloy/backend/artisan reverb:start --host=0.0.0.0 --port=8080
directory=/var/www/daloy/backend
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/daloy/backend/storage/logs/reverb.log
EOF

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start daloy-worker:*
sudo supervisorctl start daloy-reverb

log_success "Background services started"

# SSL Certificate (Optional but recommended)
log_info "Installing SSL certificate..."
read -p "Install SSL certificate now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL
    log_success "SSL installed"
else
    log_warning "Skipping SSL. Run: sudo certbot --nginx -d $DOMAIN"
fi

# Final steps
log_success "========================================="
log_success "DEPLOYMENT COMPLETE! 🎉"
log_success "========================================="
log_info ""
log_info "Your Daloy platform is now running at:"
log_info "  Frontend: https://${DOMAIN}"
log_info "  API: https://${DOMAIN}/api"
log_info "  Admin: https://${DOMAIN}/admin"
log_info ""
log_warning "IMPORTANT - Save these credentials:"
log_warning "  Database: ${DB_NAME}"
log_warning "  User: ${DB_USER}"
log_warning "  Password: ${DB_PASSWORD}"
log_info ""
log_info "Next Steps:"
log_info "  1. Update .env with your API keys (Sentry, OAuth, etc.)"
log_info "  2. Run: cd /var/www/daloy/backend && php artisan config:cache"
log_info "  3. Test all features"
log_info "  4. Set up backups: crontab -e"
log_info ""
log_info "Logs:"
log_info "  App: /var/www/daloy/backend/storage/logs/laravel.log"
log_info "  Nginx: /var/log/nginx/error.log"
log_info "  Worker: /var/www/daloy/backend/storage/logs/worker.log"
log_info ""
log_success "Happy launching! 🚀"
