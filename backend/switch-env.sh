#!/bin/bash

# Script to switch between DEV and PROD environment configurations
# Usage: ./switch-env.sh [dev|prod]
#
# How it works:
# - DEV mode: DEV variables are uncommented (active), PROD variables are commented
# - PROD mode: PROD variables are uncommented (active), DEV variables are commented

set -e

ENV_FILE=".env"
MODE=${1:-dev}

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found!"
    echo "   Run: cp env.example .env"
    exit 1
fi

# Create a backup
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo "📦 Backup created: ${ENV_FILE}.backup"

if [ "$MODE" = "dev" ]; then
    echo "🔄 Switching to DEVELOPMENT mode..."
    
    # Comment all PROD variables (lines starting with # === PROD: through next section)
    sed -i '/^# === PROD: /,/^# === DEV: \|^# === HOW TO SWITCH/s/^\([^#][A-Z][A-Z_]*=\)/#\1/g' "$ENV_FILE"
    
    # Uncomment all DEV variables (lines starting with # === DEV: through PROD section)
    sed -i '/^# === DEV: /,/^# === PROD: /s/^#\([A-Z][A-Z_]*=\)/\1/g' "$ENV_FILE"
    
    echo "✅ Switched to DEVELOPMENT mode"
    echo "   ✅ Active: DEV variables (localhost URLs)"
    echo "   ❌ Commented: PROD variables"
    
elif [ "$MODE" = "prod" ]; then
    echo "🔄 Switching to PRODUCTION mode..."
    
    # Comment all DEV variables (lines starting with # === DEV: through PROD section)
    sed -i '/^# === DEV: /,/^# === PROD: /s/^\([^#][A-Z][A-Z_]*=\)/#\1/g' "$ENV_FILE"
    
    # Uncomment all PROD variables (lines starting with # === PROD: through HOW TO SWITCH)
    sed -i '/^# === PROD: /,/^# === HOW TO SWITCH/s/^#\([A-Z][A-Z_]*=\)/\1/g' "$ENV_FILE"
    
    echo "✅ Switched to PRODUCTION mode"
    echo "   ✅ Active: PROD variables (production URLs)"
    echo "   ❌ Commented: DEV variables"
    echo ""
    echo "⚠️  IMPORTANT: Update PROD secrets (JWT_SECRET, SESSION_SECRET) before deploying!"
    
else
    echo "❌ Invalid mode: $MODE"
    echo "Usage: ./switch-env.sh [dev|prod]"
    exit 1
fi

echo ""
echo "📋 Current active variables (first 5):"
grep -E "^[A-Z][A-Z_]*=" "$ENV_FILE" | head -5
echo ""
echo "💡 Tip: Check full file with: cat .env | grep -E '^[A-Z]|^# ==='"
