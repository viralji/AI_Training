#!/bin/bash

# Script to update nginx.conf from .env file

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load PORT from .env file
if [ -f .env ]; then
    PORT=$(grep "^PORT=" .env | cut -d '=' -f2 | tr -d '[:space:]' || echo "")
fi

if [ -z "$PORT" ]; then
    echo "❌ Error: PORT not found in .env file"
    echo "Please ensure .env file contains: PORT=3002 (or your desired port)"
    exit 1
fi

echo "📝 Using PORT=$PORT from .env file"

# Replace BACKEND_PORT in nginx.conf
if [ -f nginx.conf ]; then
    sed -i.bak "s/BACKEND_PORT/$PORT/g" nginx.conf
    echo "✅ Updated nginx.conf with PORT=$PORT"
    rm -f nginx.conf.bak 2>/dev/null || true
else
    echo "❌ Error: nginx.conf not found"
    exit 1
fi

# Copy to nginx sites-available if running as root/sudo
if [ "$EUID" -eq 0 ]; then
    cp nginx.conf /etc/nginx/sites-available/ai-training 2>/dev/null || true
    echo "✅ Copied nginx.conf to /etc/nginx/sites-available/ai-training"
    echo "⚠️  Remember to: sudo nginx -t && sudo systemctl reload nginx"
else
    echo "ℹ️  Run as sudo to automatically copy to nginx directory"
    echo "   Or manually copy: sudo cp nginx.conf /etc/nginx/sites-available/ai-training"
fi

