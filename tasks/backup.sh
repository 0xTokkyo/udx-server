#!/bin/bash
DB_FILE_NAME="${DB_FILE_NAME:-udx.db}"
DB_PATH="./data/${DB_FILE_NAME}"
BACKUP_DIR="./backup"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_BASE_NAME=$(basename "$DB_FILE_NAME" .db)
BACKUP_FILE="${DB_BASE_NAME}_backup_${DATE}.db"

mkdir -p $BACKUP_DIR

sqlite3 $DB_PATH ".backup $BACKUP_DIR/$BACKUP_FILE"

cd $BACKUP_DIR
ls -t ${DB_BASE_NAME}_backup_*.db | tail -n +11 | xargs -r rm

echo "$(date): Backup created : $BACKUP_FILE"