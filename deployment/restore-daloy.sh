#!/bin/bash

################################################################################
# Daloy Database Restore Script
# Restores MySQL database from backup file
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

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Daloy Database Restore${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# List available backups
echo -e "${GREEN}Available backups:${NC}"
ls -lh "$BACKUP_DIR"/daloy_backup_*.sql.gz | awk '{print NR".", $9, "("$5")"}'

echo ""
read -p "Enter backup number to restore (or path to backup file): " BACKUP_CHOICE

# Determine backup file
if [[ "$BACKUP_CHOICE" =~ ^[0-9]+$ ]]; then
    # User entered a number
    BACKUP_FILE=$(ls "$BACKUP_DIR"/daloy_backup_*.sql.gz | sed -n "${BACKUP_CHOICE}p")
elif [ -f "$BACKUP_CHOICE" ]; then
    # User entered a file path
    BACKUP_FILE="$BACKUP_CHOICE"
else
    echo -e "${RED}Invalid selection!${NC}"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Selected backup: $BACKUP_FILE${NC}"
echo -e "${RED}WARNING: This will replace all data in database '$DB_NAME'!${NC}"
read -p "Are you sure you want to continue? (type 'YES' to confirm): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Create a safety backup first
echo -e "${GREEN}Creating safety backup of current database...${NC}"
SAFETY_BACKUP="$BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
mysqldump \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    --single-transaction \
    "$DB_NAME" | gzip > "$SAFETY_BACKUP"

echo -e "${GREEN}Safety backup created: $SAFETY_BACKUP${NC}"

# Restore database
echo -e "${GREEN}Restoring database from backup...${NC}"

if gunzip < "$BACKUP_FILE" | mysql \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    "$DB_NAME"; then
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}Restore completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${YELLOW}Safety backup: $SAFETY_BACKUP${NC}"
    echo -e "${YELLOW}You can delete it once you verify the restore.${NC}"
else
    echo -e "${RED}Restore failed!${NC}"
    echo -e "${YELLOW}Restoring from safety backup...${NC}"
    
    gunzip < "$SAFETY_BACKUP" | mysql \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        "$DB_NAME"
    
    echo -e "${GREEN}Rolled back to safety backup.${NC}"
    exit 1
fi

exit 0
