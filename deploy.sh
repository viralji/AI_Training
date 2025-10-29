#!/bin/bash

# Deployment script for Digital Ocean

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run setup

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm run build
cd ..

# Create logs directory
mkdir -p logs

# Start with PM2 (if installed)
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting with PM2..."
    pm2 delete training-platform 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    echo "✅ Application started with PM2"
else
    echo "⚠️  PM2 not found. Install with: npm install -g pm2"
    echo "Starting in background..."
    nohup npm start > logs/app.log 2>&1 &
fi

echo "✅ Deployment complete!"
echo "📊 Check logs with: pm2 logs training-platform"
echo "🌐 Application should be running on port 3000"

