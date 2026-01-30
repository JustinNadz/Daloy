# 🧪 Production Testing Checklist

**Time Required:** 1-2 hours  
**When to Run:** After deployment, before launch

---

## 🎯 CRITICAL TESTS (Must Pass)

### Authentication Flow
- [ ] **Register new account**
  - Fill registration form
  - Submit
  - Expected: Success message, redirect to verify email
  - Check email received

- [ ] **Email verification**
  - Click link in email
  - Expected: "Email verified" message
  - Can now access protected features

- [ ] **Login**
  - Enter credentials
  - Expected: Redirect to feed
  - User menu appears
  - Token stored in localStorage

- [ ] **Logout**
  - Click logout
  - Expected: Redirect to login
  - Token cleared
  - Cannot access protected routes

- [ ] **Password reset**
  - Click "Forgot password"
  - Enter email
  - Check email received
  - Click reset link
  - Enter new password
  - Expected: Can login with new password

---

## 🔐 Security Tests

### Rate Limiting
- [ ] **Login rate limit**
  - Try logging in 6+ times quickly
  - Expected: "Too many attempts" after 5 tries
  - Must wait 1 minute

- [ ] **Registration rate limit**
  - Try registering 4+ accounts in an hour
  - Expected: Blocked after 3 registrations

- [ ] **Post creation rate limit**
  - Try creating 51+ posts in a day
  - Expected: Blocked after 50 posts

### HTTPS & SSL
- [ ] **HTTPS redirect**
  - Visit `http://yourdomain.com`
  - Expected: Redirects to `https://`

- [ ] **SSL certificate valid**
  - Check padlock icon in browser
  - Expected: Valid certificate, no warnings

- [ ] **Mixed content**
  - Open console (F12)
  - Expected: No mixed content warnings

---

## 📝 Core Features

### Posts
- [ ] **Create text post**
  - Write post
  - Click submit
  - Expected: Appears in feed immediately

- [ ] **Upload image post**
  - Select image
  - Add caption
  - Post
  - Expected: Image displays correctly

- [ ] **Like post**
  - Click heart icon
  - Expected: Count increases, icon fills red
  - Refresh: Like persists

- [ ] **Comment on post**
  - Write comment
  - Submit
  - Expected: Appears under post
  - Comment count increases

- [ ] **Share post**
  - Click share
  - Expected: Share modal appears
  - Can reshare to feed

### Direct Messages
- [ ] **Send message**
  - Open messages
  - Select user
  - Type message
  - Send
  - Expected: Delivered instantly

- [ ] **Receive message**
  - Have another user send you message
  - Expected: Notification appears
  - Message shows in conversation

### Real-Time Features
- [ ] **Live notifications**
  - Have someone like your post
  - Expected: Notification toast appears
  - Sound plays (if enabled)

- [ ] **WebSocket connection**
  - Open browser console
  - Check Network → WS
  - Expected: Connection to port 8080
  - Status: "Connected"

- [ ] **Online status**
  - Check friend's profile
  - Expected: Green dot if online

---

## 👨‍💼 Admin Panel

### Authentication
- [ ] **Admin login**
  - Go to `/admin`
  - Login with admin credentials
  - Expected: Dashboard appears

### User Management
- [ ] **View users**
  - Click "Users"
  - Expected: List of all users

- [ ] **Suspend user**
  - Click "Suspend" on a user
  - Expected: User cannot login
  - Shows "Account suspended" message

- [ ] **Ban user**
  - Click "Ban"
  - Expected: User permanently blocked

### Content Moderation
- [ ] **View reports**
  - Click "Reports"
  - Expected: List of user reports

- [ ] **Delete post**
  - Find reported post
  - Click "Delete"
  - Expected: Post removed from platform

### Analytics
- [ ] **View dashboard**
  - Check analytics
  - Expected: Shows user stats, post counts

---

## 🌐 GDPR Compliance

### Data Export
- [ ] **Export user data**
  - Go to Settings → Privacy
  - Click "Download My Data"
  - Expected: JSON file downloads
  - Contains all user data

### Account Deletion
- [ ] **Request deletion**
  - Click "Delete Account"
  - Enter password
  - Type "DELETE MY ACCOUNT"
  - Submit
  - Expected: 30-day grace period message
  - Account scheduled for deletion

- [ ] **Cancel deletion**
  - Click "Cancel Deletion"
  - Expected: Deletion cancelled
  - Can still login

---

## ⚡ Performance Tests

### Page Load Speed
```bash
# Test with curl
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Create curl-format.txt:
echo "time_namelookup: %{time_namelookup}\ntime_connect: %{time_connect}\ntime_starttransfer: %{time_starttransfer}\ntime_total: %{time_total}\n" > curl-format.txt
```

**Targets:**
- [ ] Homepage < 2 seconds
- [ ] API response < 500ms
- [ ] Time to first byte < 1 second

### WebPageTest
- [ ] **Run test**
  - Go to: https://www.webpagetest.org/
  - Enter: https://yourdomain.com
  - Expected: Score > 80

### Google PageSpeed
- [ ] **Run test**
  - Go to: https://pagespeed.web.dev/
  - Test: https://yourdomain.com
  - Expected: Mobile > 60, Desktop > 80

---

## 📊 Monitoring & Logging

### Sentry
- [ ] **Error tracking works**
  - Trigger test error
  - Expected: Appears in Sentry dashboard
  - Stack trace visible

### Logs
- [ ] **Application logs**
  ```bash
  tail -f /var/www/daloy/backend/storage/logs/laravel.log
  ```
  - Expected: No errors during normal usage

- [ ] **Nginx logs**
  ```bash
  tail -f /var/log/nginx/error.log
  ```
  - Expected: No 500 errors

### Queue Processing
- [ ] **Queue workers running**
  ```bash
  sudo supervisorctl status daloy-worker:*
  ```
  - Expected: All RUNNING

---

## 🔄 Backup & Recovery

### Automated Backups
- [ ] **Backup runs daily**
  ```bash
  # Check cron
  crontab -l | grep backup
  
  # Test backup manually
  sudo /var/www/daloy/deployment/backup-daloy.sh
  ```
  - Expected: Backup file created
  - Located in `/var/backups/daloy/`

### Restore Test
- [ ] **Can restore from backup**
  ```bash
  # Test restoration (use test database!)
  sudo /var/www/daloy/deployment/restore-daloy.sh /var/backups/daloy/latest.sql.gz
  ```
  - Expected: Database restored
  - All data intact

---

## 🌍 Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive design works

---

## 📱 API Testing

### Health Check
```bash
curl https://yourdomain.com/api/health
```
**Expected:**
```json
{"status":"ok","timestamp":"..."}
```

### Authentication
```bash
# Register
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123456"}'

# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### Protected Endpoints
```bash
# Get user profile (requires token)
curl https://yourdomain.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Stress Testing (Optional)

### Load Test with Apache Bench
```bash
# Install if needed
sudo apt install apache2-utils

# Test homepage (100 requests, 10 concurrent)
ab -n 100 -c 10 https://yourdomain.com/

# Test API
ab -n 100 -c 10 https://yourdomain.com/api/posts/public
```

**Targets:**
- [ ] Can handle 100 concurrent users
- [ ] No errors under load
- [ ] Response time acceptable

---

## ✅ FINAL VERIFICATION

### Pre-Launch Checklist
- [ ] All critical tests passing
- [ ] No console errors
- [ ] HTTPS working
- [ ] Real-time features working
- [ ] Email sending working
- [ ] Backups automated
- [ ] Monitoring active
- [ ] Performance acceptable
- [ ] Admin panel working
- [ ] GDPR features working

### Sign-Off
- [ ] **Development team:** Approved
- [ ] **QA testing:** Passed
- [ ] **Security review:** Approved
- [ ] **Performance:** Acceptable
- [ ] **Ready to launch:** YES ✅

---

## 📝 Test Results Template

```markdown
# Daloy Production Test Results
Date: YYYY-MM-DD
Tester: [Name]

## Critical Tests
- Authentication: ✅ PASS
- Real-Time: ✅ PASS
- Security: ✅ PASS
- Performance: ✅ PASS
- GDPR: ✅ PASS
- Admin: ✅ PASS

## Issues Found
1. None

## Performance Metrics
- Homepage Load: 1.8s
- API Response: 180ms
- PageSpeed Score: 85

## Recommendation
✅ READY FOR LAUNCH

Tested by: [Name]
Approved by: [Name]
Date: [Date]
```

---

## 🎉 Testing Complete!

If all tests pass, you're ready to launch! 🚀

**Next:** Monitor closely for first 24-48 hours
