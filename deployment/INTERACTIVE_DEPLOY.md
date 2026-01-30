# 🚀 INTERACTIVE DEPLOYMENT GUIDE

**Time Required:** 6-7 hours  
**Difficulty:** Intermediate  
**Cost:** $24-48/month

---

## 📋 What You'll Need

### Before Starting:
- [ ] **Domain name** purchased (e.g., yourdomain.com)
- [ ] **Credit card** for server payment
- [ ] **Email address** for notifications
- [ ] **2-3 hours** of uninterrupted time
- [ ] **Coffee** ☕ (recommended!)

### Accounts to Create:
- [ ] Server provider (DigitalOcean/AWS/Vultr)
- [ ] Sentry.io (free tier)
- [ ] Google Cloud (for OAuth - free)
- [ ] reCAPTCHA (free)

---

## 🎯 PHASE 1: SERVER PROVISIONING (30-45 min)

### Option A: DigitalOcean (Recommended for Beginners)

#### Step 1: Create Account
1. Go to https://www.digitalocean.com/
2. Sign up (get $200 free credit with referral)
3. Verify email
4. Add payment method

#### Step 2: Create Droplet
1. Click **"Create"** → **"Droplets"**
2. **Choose Image:** Ubuntu 22.04 LTS
3. **Choose Plan:** 
   - Basic ($24/mo): 2 GB RAM, 2 CPUs, 60 GB SSD
   - Recommended ($48/mo): 4 GB RAM, 2 CPUs, 80 GB SSD
4. **Datacenter:** Choose closest to your users
5. **Authentication:** SSH Key (recommended) or Password
6. **Hostname:** daloy-production
7. Click **"Create Droplet"**
8. Wait 1-2 minutes for provisioning

#### Step 3: Get Server IP
- Copy your server's **IP address** (e.g., 123.45.67.89)
- Save it for DNS configuration

---

### Option B: AWS Lightsail

#### Step 1: Create Account
1. Go to https://aws.amazon.com/lightsail/
2. Sign up (12 months free tier)
3. Complete verification

#### Step 2: Create Instance
1. Click **"Create instance"**
2. **Platform:** Linux/Unix
3. **Blueprint:** OS Only → Ubuntu 22.04 LTS
4. **Instance plan:** $24/mo or $48/mo
5. **Name:** daloy-production
6. Click **"Create instance"**

#### Step 3: Configure Networking
1. Go to instance → **Networking** tab
2. Note the **Public IP**
3. Open ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)

---

### Option C: Vultr (Budget-Friendly)

#### Step 1: Create Account
1. Go to https://www.vultr.com/
2. Sign up ($100 free credit available)
3. Verify account

#### Step 2: Deploy Server
1. Click **"Deploy +"**
2. **Choose Server:** Cloud Compute
3. **Location:** Choose closest region
4. **Image:** Ubuntu 22.04 LTS
5. **Plan:** $18-24/mo (2-4 GB RAM)
6. **Server Hostname:** daloy-production
7. Click **"Deploy Now"**

---

## 🌐 PHASE 2: DNS CONFIGURATION (15 min)

### Configure Domain DNS

1. **Go to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Find DNS settings**
3. **Add these records:**

```
Type   | Name | Value              | TTL
-------|------|--------------------|---------
A      | @    | YOUR_SERVER_IP     | 3600
A      | www  | YOUR_SERVER_IP     | 3600
CNAME  | admin| yourdomain.com     | 3600
```

4. **Wait 5-30 minutes** for DNS propagation
5. **Test:** `ping yourdomain.com` (should show your server IP)

---

## 💻 PHASE 3: CONNECT TO SERVER (5 min)

### Windows (PowerShell):
```powershell
ssh root@YOUR_SERVER_IP
# OR if using SSH key:
ssh -i path\to\your\key.pem root@YOUR_SERVER_IP
```

### Mac/Linux:
```bash
ssh root@YOUR_SERVER_IP
# OR if using SSH key:
ssh -i ~/.ssh/your_key.pem root@YOUR_SERVER_IP
```

### First-time connection:
- Type `yes` when asked about fingerprint
- Enter password (check email from provider)

---

## 🚀 PHASE 4: AUTOMATED DEPLOYMENT (2-3 hours)

### Option A: One-Command Deploy (Automated) ⚡ **RECOMMENDED**

```bash
# 1. Create deployment user
adduser daloy
usermod -aG sudo daloy
su - daloy

# 2. Download deployment script
curl -o deploy.sh https://raw.githubusercontent.com/yourusername/daloy/main/deployment/deploy.sh
chmod +x deploy.sh

# 3. Edit configuration
nano deploy.sh
# Update these lines:
# DOMAIN="yourdomain.com"
# ADMIN_EMAIL="your@email.com"
# GIT_REPO="https://github.com/yourusername/daloy.git"

# 4. Run deployment (grab coffee ☕)
./deploy.sh
```

**This will automatically:**
- ✅ Install all dependencies
- ✅ Configure MySQL database
- ✅ Setup Laravel backend
- ✅ Build React frontend
- ✅ Configure Nginx
- ✅ Start queue workers
- ✅ Start WebSocket server
- ✅ Install SSL certificate
- ✅ Everything! 🎉

**Time:** 20-30 minutes (mostly automated)

---

### Option B: Manual Step-by-Step (If automated fails)

Follow the detailed guide in `PRODUCTION_DEPLOYMENT.md`

---

## 🔧 PHASE 5: CONFIGURATION (30 min)

### Update Environment Variables

```bash
cd /var/www/daloy/backend
nano .env
```

**Required Updates:**
```env
# Your domain
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Sentry (get from sentry.io)
SENTRY_LARAVEL_DSN=https://your-dsn@sentry.io/project

# reCAPTCHA (get from google.com/recaptcha)
RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Email (Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Clear cache after editing:**
```bash
php artisan config:cache
php artisan route:cache
sudo supervisorctl restart daloy-worker:*
sudo supervisorctl restart daloy-reverb
```

---

## ✅ PHASE 6: TESTING (1 hour)

### Automated Tests

```bash
cd /var/www/daloy/backend

# Run backend tests
php artisan test

# Check services
sudo systemctl status nginx
sudo systemctl status mysql
sudo supervisorctl status
```

### Manual Tests

#### 1. Homepage (2 min)
- Go to: https://yourdomain.com
- Should load without errors
- Check: No console errors (F12)

#### 2. Registration (5 min)
- Click "Sign Up"
- Register new account
- Check email for verification
- Verify email works

#### 3. Login (2 min)
- Login with credentials
- Should redirect to feed
- Check: User menu appears

#### 4. Post Creation (5 min)
- Create a text post
- Upload image post
- Check: Posts appear in feed

#### 5. Real-Time (5 min)
- Open two browser windows
- Post from window 1
- Check: Appears instantly in window 2

#### 6. WebSocket (5 min)
- Open browser console (F12)
- Should see: "WebSocket connected"
- Check Network tab: WS connection to port 8080

#### 7. Direct Messages (5 min)
- Send message to another user
- Check: Delivered instantly
- Check: Notification appears

#### 8. GDPR (5 min)
- Go to Settings → Privacy
- Click "Download My Data"
- Check: JSON file downloads
- Verify: Contains your data

#### 9. Admin Panel (10 min)
- Go to: https://yourdomain.com/admin
- Login as admin
- Check all sections load
- Test user management

#### 10. Performance (15 min)
- Use: https://pagespeed.web.dev/
- Test: https://yourdomain.com
- Target: Score > 80

### Testing Checklist

**Critical Features:**
- [ ] Homepage loads (HTTPS)
- [ ] User can register
- [ ] Email verification works
- [ ] User can login
- [ ] Can create posts
- [ ] Can upload images
- [ ] Real-time updates work
- [ ] WebSocket connected
- [ ] Direct messages work
- [ ] Notifications appear
- [ ] Admin panel accessible
- [ ] API responding
- [ ] No console errors

**Security:**
- [ ] HTTPS working (padlock icon)
- [ ] HTTP redirects to HTTPS
- [ ] Rate limiting active (try spamming login)
- [ ] SQL injection protected
- [ ] XSS protected

**Performance:**
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Images loading
- [ ] No broken links

---

## 🐛 TROUBLESHOOTING

### Issue: "502 Bad Gateway"
```bash
# Check PHP-FPM
sudo systemctl status php8.2-fpm
sudo systemctl restart php8.2-fpm

# Check logs
tail -f /var/log/nginx/error.log
```

### Issue: "WebSocket not connecting"
```bash
# Check Reverb
sudo super visorctl status daloy-reverb
sudo supervisorctl restart daloy-reverb

# Check port
netstat -tuln | grep 8080

# Check logs
tail -f /var/www/daloy/backend/storage/logs/reverb.log
```

### Issue: "Email not sending"
```bash
# Test email
cd /var/www/daloy/backend
php artisan tinker
Mail::raw('Test', function($m) { $m->to('test@example.com')->subject('Test'); });

# Check logs
tail -f storage/logs/laravel.log
```

### Issue: "Queue not processing"
```bash
# Check workers
sudo supervisorctl status daloy-worker:*

# Restart
sudo supervisorctl restart daloy-worker:*

# Test manually
php artisan queue:work
```

---

## 📊 MONITORING SETUP (30 min)

### 1. Setup Uptime Monitoring (5 min)

**UptimeRobot (Free):**
1. Go to: https://uptimerobot.com/
2. Sign up
3. Add monitor:
   - Type: HTTPS
   - URL: https://yourdomain.com
   - Interval: 5 minutes
4. Add email alert

### 2. Enable Sentry Alerts (5 min)
1. Go to sentry.io → Your Project
2. Alerts → Create Alert
3. "When an issue is first seen"
4. Add email notification

### 3. Server Monitoring (10 min)
```bash
# Install Netdata (optional)
wget -O /tmp/netdata-kickstart.sh https://my-netdata.io/kickstart.sh
sudo sh /tmp/netdata-kickstart.sh

# Access at: http://YOUR_IP:19999
```

### 4. Backup Verification (10 min)
```bash
# Setup backup cron
crontab -e

# Add:
0 2 * * * /var/www/daloy/deployment/backup-daloy.sh >> /var/log/daloy-backup.log 2>&1

# Test backup
sudo /var/www/daloy/deployment/backup-daloy.sh

# Verify
ls -lh /var/backups/daloy/
```

---

## 🎉 LAUNCH CHECKLIST

### Pre-Launch (Check all)
- [ ] All tests passing
- [ ] SSL certificate valid
- [ ] Domain pointing correctly
- [ ] Email sending working
- [ ] Real-time features working
- [ ] Admin panel accessible
- [ ] Backups automated
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Performance acceptable

### Launch Day
- [ ] Final test of critical flows
- [ ] Monitor logs closely
- [ ] Have rollback plan ready
- [ ] Announce to users
- [ ] Celebrate! 🎊

---

## 📞 SUPPORT

### If Something Goes Wrong:

1. **Check logs:**
   ```bash
   tail -f /var/www/daloy/backend/storage/logs/laravel.log
   tail -f /var/log/nginx/error.log
   ```

2. **Check Sentry:** https://sentry.io/

3. **Reset everything:**
   ```bash
   sudo supervisorctl restart all
   sudo systemctl restart nginx php8.2-fpm mysql
   ```

4. **Rollback:**
   ```bash
   cd /var/www/daloy
   git checkout main
   ./deploy.sh
   ```

---

## ⏱️ TIME BREAKDOWN

| Phase | Time | Difficulty |
|-------|------|------------|
| Server Provisioning | 30-45 min | Easy |
| DNS Configuration | 15 min | Easy |
| Connect to Server | 5 min | Easy |
| Automated Deployment | 20-30 min | Automated! |
| Configuration | 30 min | Medium |
| Testing | 1 hour | Medium |
| Monitoring | 30 min | Easy |
| **TOTAL** | **3-4 hours** | **Medium** |

---

## 🚀 YOU'RE LIVE!

**Congratulations!** 🎉 

Your Daloy platform is now running in production!

**Next Steps:**
1. Invite beta users
2. Gather feedback
3. Monitor performance
4. Plan improvements
5. Scale as needed

**You did it!** 🎊
