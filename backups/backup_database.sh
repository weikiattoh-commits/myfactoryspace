#!/usr/bin/env bash
# ==============================================================================
# MyFactorySpace - Supabase Local Database Backup Utility
# Backs up all tables from Supabase into local JSON snapshots
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${SCRIPT_DIR}/snapshots/${TIMESTAMP}"
LATEST_DIR="${SCRIPT_DIR}/latest"

mkdir -p "${BACKUP_DIR}"
mkdir -p "${LATEST_DIR}"

SUPABASE_URL="https://vnsinkesbbikeqbywxfd.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2lua2VzYmJpa2VxYnl3eGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzE2NTMsImV4cCI6MjEwNjI0NzY1M30.gaZwIgcxixKIZXya0yrIaQ36mSAzZHMwsaQXZj9aEZA"

TABLES=(
  "properties"
  "parks"
  "agents"
  "app_users"
  "site_settings"
  "owner_listings"
  "leads"
  "automation_templates"
)

echo "📦 Starting Supabase Backup for [vnsinkesbbikeqbywxfd] at $(date)..."

for TABLE in "${TABLES[@]}"; do
  OUTPUT_FILE="${BACKUP_DIR}/${TABLE}.json"
  LATEST_FILE="${LATEST_DIR}/${TABLE}.json"
  
  HTTP_STATUS=$(curl -s -w "%{http_code}" -o "${OUTPUT_FILE}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    "${SUPABASE_URL}/rest/v1/${TABLE}?select=*")

  if [[ "${HTTP_STATUS}" == "200" ]]; then
    COUNT=$(grep -o '"id":' "${OUTPUT_FILE}" | wc -l || echo "0")
    echo "  ✅ ${TABLE}: ${COUNT} records backed up"
    cp "${OUTPUT_FILE}" "${LATEST_FILE}"
  else
    echo "  ⚠️ ${TABLE}: HTTP status ${HTTP_STATUS}"
  fi
done

echo "🎉 Backup complete! Saved snapshot to:"
echo "   ${BACKUP_DIR}"
