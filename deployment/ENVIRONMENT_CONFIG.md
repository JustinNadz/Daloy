# Production Environment Configuration

## Backend (.env.production)

```env
# Application
APP_NAME="Daloy"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_APP_KEY_HERE  # Run: php artisan key:generate
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=daloy_db
DB_USERNAME=daloy_user
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_CLIENT=predis

# Broadcasting (Laravel Reverb)
BROADCAST_DRIVER=reverb
REVERB_APP_ID=YOUR_REVERB_APP_ID
REVERB_APP_KEY=YOUR_REVERB_APP_KEY
REVERB_APP_SECRET=YOUR_REVERB_APP_SECRET
REVERB_HOST=yourdomain.com
REVERB_PORT=8080
REVERB_SCHEME=wss

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# CORS
FRONTEND_URL=https://yourdomain.com

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/auth/facebook/callback

# Sentry
SENTRY_LARAVEL_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.1

# reCAPTCHA (v3)
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Storage
FILESYSTEM_DISK=local
# For S3/Cloud Storage:
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
LOG_DEPRECATIONS_CHANNEL=null

# Queue
QUEUE_FAILED_DRIVER=database-uuids
```

---

## Frontend (.env.production)

```env
# API
VITE_API_URL=https://yourdomain.com/api

# Reverb WebSocket
VITE_REVERB_APP_KEY=YOUR_REVERB_APP_KEY
VITE_REVERB_HOST=yourdomain.com
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=wss

# Sentry
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0

# OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

---

## Admin Panel (.env.production)

```env
# API
VITE_API_URL=https://yourdomain.com/api

# Admin Authentication
VITE_ADMIN_URL=https://admin.yourdomain.com

# Reverb WebSocket
VITE_REVERB_APP_KEY=YOUR_REVERB_APP_KEY
VITE_REVERB_HOST=yourdomain.com
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=wss

# Sentry
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## Security Checklist

### Before Going Live:

- [ ] Change all default passwords
- [ ] Generate new APP_KEY
- [ ] Set APP_DEBUG=false
- [ ] Configure proper CORS domains
- [ ] Set secure SESSION_DOMAIN
- [ ] Use strong DB passwords (20+ characters)
- [ ] Enable SSL/TLS for all services
- [ ] Configure rate limiting
- [ ] Set up firewall rules
- [ ] Enable log monitoring
- [ ] Configure backup encryption
- [ ] Set up intrusion detection

### API Keys to Generate:

1. **Laravel APP_KEY:**
   ```bash
   php artisan key:generate --force
   ```

2. **Reverb Credentials:**
   ```bash
   php artisan reverb:install
   ```

3. **Google OAuth:**
   - Go to: https://console.cloud.google.com/
   - Create OAuth 2.0 credentials

4. **Facebook OAuth:**
   - Go to: https://developers.facebook.com/
   - Create app and get credentials

5. **Sentry DSN:**
   - Go to: https://sentry.io/
   - Create project and copy DSN

6. **reCAPTCHA:**
   - Go to: https://www.google.com/recaptcha/admin
   - Register site and get keys

---

## Server Configuration

### Ubuntu 22.04 LTS

**PHP 8.2 Configuration (`/etc/php/8.2/fpm/php.ini`):**
```ini
memory_limit = 256M
upload_max_filesize = 20M
post_max_size = 20M
max_execution_time = 60
expose_php = Off
```

**MySQL Configuration (`/etc/mysql/mysql.conf.d/mysqld.cnf`):**
```ini
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
```

**Redis Configuration (`/etc/redis/redis.conf`):**
```ini
maxmemory 512mb
maxmemory-policy allkeys-lru
```

---

## Performance Optimization

### OpCache (PHP)
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### Laravel Optimization
```bash
# Production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear all caches
php artisan optimize:clear
```

---

## Monitoring & Alerts

### Services to Monitor:

1. **Uptime:**
   - Use: UptimeRobot, Pingdom
   - Monitor: https://yourdomain.com

2. **Performance:**
   - Use: New Relic, Datadog
   - Track: Response times, throughput

3. **Errors:**
   - Use: Sentry
   - Alert on: Critical errors

4. **Server:**
   - Use: Netdata, Prometheus
   - Monitor: CPU, RAM, Disk

5. **Database:**
   - Monitor: Connection pool, slow queries
   - Alert on: High connections, locks

---

## Backup Strategy

**Files to Backup:**
- Database (daily)
- Uploaded media (daily)
- Configuration files (weekly)
- Logs (monthly archive)

**Backup Locations:**
- Local: `/var/backups/daloy/`
- Offsite: S3/Google Cloud/Backblaze
- Retention: 30 days local, 90 days offsite

---

## Disaster Recovery

**RTO (Recovery Time Objective):** 30 minutes  
**RPO (Recovery Point Objective):** 24 hours

**Recovery Steps:**
1. Provision new server
2. Install dependencies
3. Restore latest backup
4. Update DNS
5. Test all features
6. Monitor for issues

---

## Cost Estimate

**Monthly Costs:**
- Server (4GB RAM): $24-48
- Domain: $1-2
- Email (SendGrid): $15-30
- Backups (S3): $5-10
- SSL: $0 (Let's Encrypt)
- **Total: $45-90/month**

**Free Tier Services:**
- Laravel Reverb: $0
- Sentry (5K errors): $0
- reCAPTCHA: $0
