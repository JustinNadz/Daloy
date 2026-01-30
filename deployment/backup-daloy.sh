#!/bin/bash

# Daloy Database Backup Script
# This script creates automated backups with retention policy

# Configuration
BACKUPDIR="/var/backups/daloy"
DBNAME="daloy_db"
DBUSER="root"
DBPASS="your_password_here"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUPDIR

# Backup filename
BACKUP_FILE="$BACKUPDIR/daloy_backup_$DATE.sql.gz"

# Perform database backup
echo "[$(date)] Starting database backup..."
mysqldump -u $DBUSER -p$DBPASS $DBNAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup created successfully: $BACKUP_FILE"
    chmod 600 $BACKUP_FILE
    
    # Delete backups older than retention period
    echo "[$(date)] Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    find $BACKUPDIR -name "daloy_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Log success
    echo "[$(date)] Backup completed successfully"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Optional: Upload to cloud storage (S3, Google Cloud, etc.)
# aws s3 cp $BACKUP_FILE s3://your-bucket/backups/
