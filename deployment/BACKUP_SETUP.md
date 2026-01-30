# Daloy Production Deployment - Backup Automation

## 🔄 Automated Database Backups

### Setup Instructions

#### 1. Configure Backup Script

Edit the backup script with your production credentials:

```bash
sudo nano /var/www/daloy/deployment/backup-daloy.sh
```

Update these variables:
```bash
DBNAME="daloy_db"
DBUSER="your_db_user"
DBPASS="your_db_password"
RETENTION_DAYS=30  # Keep backups for 30 days
```

Make it executable:
```bash
chmod +x /var/www/daloy/deployment/backup-daloy.sh
```

---

#### 2. Set Up Cron Job

Edit crontab:
```bash
crontab -e
```

Add this line for daily backups at 2 AM:
```bash
0 2 * * * /var/www/daloy/deployment/backup-daloy.sh >> /var/log/daloy-backup.log 2>&1
```

**Alternative schedules:**
```bash
# Every 6 hours
0 */6 * * * /var/www/daloy/deployment/backup-daloy.sh >> /var/log/daloy-backup.log 2>&1

# Twice daily (2 AM and 2 PM)
0 2,14 * * * /var/www/daloy/deployment/backup-daloy.sh >> /var/log/daloy-backup.log 2>&1

# Weekly on Sunday at 3 AM
0 3 * * 0 /var/www/daloy/deployment/backup-daloy.sh >> /var/log/daloy-backup.log 2>&1
```

---

#### 3. Test Backup

Run manually to test:
```bash
sudo /var/www/daloy/deployment/backup-daloy.sh
```

Check if backup was created:
```bash
ls -lh /var/backups/daloy/
```

---

#### 4. Test Restoration

Run restore script:
```bash
sudo /var/www/daloy/deployment/restore-daloy.sh /var/backups/daloy/daloy_backup_YYYY-MM-DD_HH-MM-SS.sql.gz
```

---

#### 5. Monitor Backups

Check backup logs:
```bash
tail -f /var/log/daloy-backup.log
```

Set up monitoring alerts:
```bash
# Add to monitoring script
if [ ! -f /var/backups/daloy/daloy_backup_$(date +%Y-%m-%d)*.sql.gz ]; then
    echo "WARNING: No backup created today!" | mail -s "Daloy Backup Alert" admin@daloy.com
fi
```

---

## 📊 Backup Status

**Location:** `/var/backups/daloy/`  
**Schedule:** Daily at 2 AM  
**Retention:** 30 days  
**Format:** Compressed SQL (gzip)  

**Estimated Size:**
- Small app (~100 users): 10-50 MB
- Medium app (~1000 users): 100-500 MB
- Large app (~10000 users): 1-5 GB

---

## 🔐 Security Best Practices

1. **Encrypt backups** (if storing offsite):
```bash
gpg --encrypt --recipient admin@daloy.com $BACKUP_FILE
```

2. **Restrict permissions**:
```bash
chmod 600 /var/backups/daloy/*
chown root:root /var/backups/daloy
```

3. **Store offsite** (S3, Google Cloud, Backblaze):
```bash
# Add to backup script
aws s3 cp $BACKUP_FILE s3://daloy-backups/$(date +%Y-%m-%d)/
```

---

## ✅ Verification Checklist

- [ ] Backup script configured with correct credentials
- [ ] Script is executable (`chmod +x`)
- [ ] Cron job added
- [ ] Manual test successful
- [ ] Restore test successful
- [ ] Log file created and writable
- [ ] Backup directory has sufficient space
- [ ] Monitoring alerts configured

---

## 🚨 Disaster Recovery

**In case of data loss:**

1. Stop the application:
```bash
sudo systemctl stop daloy
```

2. Restore from latest backup:
```bash
sudo /var/www/daloy/deployment/restore-daloy.sh /var/backups/daloy/daloy_backup_LATEST.sql.gz
```

3. Verify restoration:
```bash
mysql -u root -p daloy_db -e "SELECT COUNT(*) FROM users;"
```

4. Restart application:
```bash
sudo systemctl start daloy
```

**Recovery Time Objective (RTO):** 15-30 minutes  
**Recovery Point Objective (RPO):** 24 hours (daily backups)

---

## 📝 Maintenance

**Monthly:**
- Review backup logs
- Verify backup integrity
- Test restoration process

**Quarterly:**
- Review retention policy
- Check disk space usage
- Update backup credentials if changed

**Annually:**
- Full disaster recovery drill
- Review and update backup strategy
