#!/bin/bash

################################################################################
# Daloy Backup Monitoring Script
# Checks if backups are running successfully and alerts on failures
################################################################################

set -e

# Configuration
BACKUP_DIR="/var/backups/daloy"
ALERT_EMAIL="admin@daloy.com"
WEBHOOK_URL=""  # Slack/Discord webhook
MAX_AGE_HOURS=25  # Alert if latest backup is older than 25 hours

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Find latest backup
LATEST_BACKUP=$(find "$BACKUP_DIR" -name "daloy_backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}ERROR: No backups found!${NC}"
    
    # Send alert
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d '{"text":"🔴 ALERT: No Daloy database backups found!"}' \
            > /dev/null 2>&1
    fi
    
    exit 1
fi

# Check backup age
BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")))
BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))

echo "Latest backup: $LATEST_BACKUP"
echo "Age: $BACKUP_AGE_HOURS hours"

if [ $BACKUP_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo -e "${RED}WARNING: Latest backup is older than $MAX_AGE_HOURS hours!${NC}"
    
    # Send alert
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"⚠️ WARNING: Daloy backup is $BACKUP_AGE_HOURS hours old!\"}" \
            > /dev/null 2>&1
    fi
    
    exit 1
else
    echo -e "${GREEN}Backup is current (less than $MAX_AGE_HOURS hours old)${NC}"
fi

# Verify backup integrity
if gzip -t "$LATEST_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}Backup integrity: OK${NC}"
else
    echo -e "${RED}ERROR: Backup file is corrupted!${NC}"
    
    # Send alert
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d '{"text":"🔴 ALERT: Latest Daloy backup is corrupted!"}' \
            > /dev/null 2>&1
    fi
    
    exit 1
fi

# Check backup size (should be at least 1MB for production database)
BACKUP_SIZE=$(stat -c%s "$LATEST_BACKUP")
MIN_SIZE=1048576  # 1MB in bytes

if [ $BACKUP_SIZE -lt $MIN_SIZE ]; then
    echo -e "${YELLOW}WARNING: Backup size ($BACKUP_SIZE bytes) seems too small${NC}"
fi

# Count total backups
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "daloy_backup_*.sql.gz" -type f | wc -l)
echo "Total backups: $TOTAL_BACKUPS"

echo -e "${GREEN}All checks passed!${NC}"
exit 0
