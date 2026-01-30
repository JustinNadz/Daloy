# Daloy Production Deployment Guide

**Platform:** Daloy Social Media Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-01-30

---

## 📋 Pre-Deployment Checklist

### Code Ready
- [x] All P0 features implemented (100%)
- [x] Real-time features working (Reverb)
- [x] GDPR compliance complete
- [x] Rate limiting configured
- [x] Error tracking (Sentry) configured
- [x] Backup scripts ready

### Requirements
- [ ] Server provisioned (Ubuntu 22.04 LTS recommended)
- [ ] Domain name purchased
- [ ] Email service configured (for notifications)
- [ ] SSL certificate (Let's Encrypt)
- [ ] Database credentials secured

---

## 🖥️ Server Requirements

**Minimum:**
- 2 CPU cores
- 4 GB RAM
- 40 GB SSD storage
- Ubuntu 22.04 LTS

**Recommended:**
- 4 CPU cores
- 8 GB RAM
- 80 GB SSD storage
- Ubuntu 22.04 LTS

**Providers:**
- DigitalOcean ($24-48/month)
- AWS Lightsail ($20-40/month)
- Vultr ($18-36/month)
- Linode ($24-48/month)

---

## 🚀 Deployment Steps

### 1. Server Provisioning (30 minutes)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-mysql php8.2-cli \
    php8.2-mbstring php8.2-xml php8.2-zip php8.2-curl php8.2-gd \
    php8.2-bcmath php8.2-redis git unzip curl supervisor certbot

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### 2. MySQL Database Setup (10 minutes)

```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

```sql
CREATE DATABASE daloy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'daloy_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON daloy_db.* TO 'daloy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 3. Deploy Backend (30 minutes)

```bash
# Create directory
sudo mkdir -p /var/www/daloy
cd /var/www/daloy

# Clone or upload your code
git clone https://github.com/yourusername/daloy.git .
# OR
scp -r ./backend user@server:/var/www/daloy/

# Install dependencies
cd /var/www/daloy/backend
composer install --optimize-autoloader --no-dev

# Setup environment
cp .env.production .env
nano .env
```

**Update `.env`:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_DATABASE=daloy_db
DB_USERNAME=daloy_user
DB_PASSWORD=your_strong_password

# Generate new keys
APP_KEY=  # Run: php artisan key:generate
```

```bash
# Run migrations
php artisan migrate --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/daloy/backend/storage
sudo chown -R www-data:www-data /var/www/daloy/backend/bootstrap/cache
sudo chmod -R 775 /var/www/daloy/backend/storage
sudo chmod -R 775 /var/www/daloy/backend/bootstrap/cache
```

---

### 4. Configure Nginx (15 minutes)

```bash
sudo nano /etc/nginx/sites-available/daloy
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/daloy/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/daloy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 5. SSL Certificate (10 minutes)

```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

### 6. Deploy Frontend (20 minutes)

```bash
cd /var/www/daloy
nano .env.local
```

**Update frontend `.env`:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_REVERB_HOST=yourdomain.com
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=wss
VITE_SENTRY_DSN=your_sentry_dsn
```

```bash
# Build frontend
npm install
npm run build

# Serve built files
sudo cp -r dist/* /var/www/daloy/frontend/
```

Configure Nginx for frontend:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    root /var/www/daloy/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy for Reverb
    location /app {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

### 7. Setup Supervisor (Queue Workers) (10 minutes)

```bash
sudo nano /etc/supervisor/conf.d/daloy-worker.conf
```

```ini
[program:daloy-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/daloy/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/daloy/backend/storage/logs/worker.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start daloy-worker:*
```

---

### 8. Setup Laravel Reverb (WebSocket Server) (10 minutes)

```bash
sudo nano /etc/supervisor/conf.d/daloy-reverb.conf
```

```ini
[program:daloy-reverb]
command=php /var/www/daloy/backend/artisan reverb:start --host=0.0.0.0 --port=8080
directory=/var/www/daloy/backend
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/daloy/backend/storage/logs/reverb.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start daloy-reverb
```

---

### 9. Configure Backups (5 minutes)

```bash
# Setup backup cron
crontab -e
```

Add:
```bash
0 2 * * * /var/www/daloy/deployment/backup-daloy.sh >> /var/log/daloy-backup.log 2>&1
```

---

### 10. Final Checks (15 minutes)

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo supervisorctl status

# Test application
curl https://yourdomain.com
curl https://yourdomain.com/api/health

# Check logs
tail -f /var/www/daloy/backend/storage/logs/laravel.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Security Hardening

### Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Hide Nginx Version
```bash
sudo nano /etc/nginx/nginx.conf
```
Add: `server_tokens off;`

### Disable PHP Expose
```bash
sudo nano /etc/php/8.2/fpm/php.ini
```
Set: `expose_php = Off`

---

## 📊 Monitoring

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/daloy
```

```
/var/www/daloy/backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Health Checks
- Backend: `https://yourdomain.com/api/health`
- WebSocket: Check port 8080 connectivity
- Database: Monitor connections
- Queue: Check worker status

---

## 🚨 Troubleshooting

**500 Error:**
```bash
# Check logs
tail -f /var/www/daloy/backend/storage/logs/laravel.log

# Check permissions
sudo chown -R www-data:www-data storage bootstrap/cache
```

**WebSocket Not Working:**
```bash
# Check Reverb status
sudo supervisorctl status daloy-reverb

# Check port
netstat -tuln | grep 8080

# Restart Reverb
sudo supervisorctl restart daloy-reverb
```

**Queue Not Processing:**
```bash
# Check worker status
sudo supervisorctl status daloy-worker:*

# Restart workers
sudo supervisorctl restart daloy-worker:*
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via HTTPS
- [ ] API endpoints working
- [ ] WebSocket connection successful
- [ ] Users can register/login
- [ ] Email sending working
- [ ] Real-time notifications working
- [ ] Queue workers running
- [ ] Backups configured
- [ ] SSL certificate valid
- [ ] Logs rotating properly
- [ ] Sentry receiving errors
- [ ] Monitoring alerts configured

---

## 🎉 Launch!

Your Daloy platform is now live! 🚀

**Next Steps:**
1. Monitor logs for first 24 hours
2. Test all critical flows
3. Invite beta users
4. Gather feedback
5. Iterate and improve

**Support:**
- Documentation: Check `/deployment` folder
- Logs: `/var/www/daloy/backend/storage/logs/`
- Backups: `/var/backups/daloy/`
