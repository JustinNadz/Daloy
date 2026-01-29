#!/bin/bash

################################################################################
# Daloy Database Backup Script
# Performs MySQL database backup with compression and rotation
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="daloy_production"
DB_USER="daloy_user"
DB_PASSWORD=""  # Will be read from .env or MySQL config file
BACKUP_DIR="/var/backups/daloy"
RETENTION_DAYS=30
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/daloy_backup_$DATE.sql.gz"
LATEST_LINK="$BACKUP_DIR/latest.sql.gz"

# Slack/Discord webhook for notifications (optional)
WEBHOOK_URL=""

# Log file
LOG_FILE="$BACKUP_DIR/backup.log"

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send notification
notify() {
    local message="$1"
    local status="$2"  # success or error
    
    log "$message"
    
    # Send to webhook if configured
    if [ -n "$WEBHOOK_URL" ]; then
        if [ "$status" == "error" ]; then
            curl -X POST "$WEBHOOK_URL" \
                -H 'Content-Type: application/json' \
                -d "{\"text\":\"🔴 Daloy Backup Failed: $message\"}" \
                > /dev/null 2>&1 || true
        else
            curl -X POST "$WEBHOOK_URL" \
                -H 'Content-Type: application/json' \
                -d "{\"text\":\"✅ Daloy Backup: $message\"}" \
                > /dev/null 2>&1 || true
        fi
    fi
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting database backup..."

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    notify "MySQL service is not running!" "error"
    exit 1
fi

# Perform backup
log "Backing up database: $DB_NAME"

if mysqldump \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --quick \
    --lock-tables=false \
    "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    
    # Create symlink to latest backup
    ln -sf "$BACKUP_FILE" "$LATEST_LINK"
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    notify "Backup completed successfully! Size: $BACKUP_SIZE" "success"
else
    notify "Backup failed!" "error"
    exit 1
fi

# Remove old backups
log "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "daloy_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "daloy_backup_*.sql.gz" -type f | wc -l)
log "Total backups retained: $BACKUP_COUNT"

# Verify backup integrity
log "Verifying backup integrity..."
if gzip -t "$BACKUP_FILE"; then
    log "Backup integrity verified successfully"
else
    notify "Backup integrity check failed!" "error"
    exit 1
fi

# Optional: Upload to S3/Cloud Storage
# if command -v aws &> /dev/null; then
#     log "Uploading backup to S3..."
#     aws s3 cp "$BACKUP_FILE" "s3://your-bucket/daloy-backups/"
# fi

log "Backup process completed"
exit 0
