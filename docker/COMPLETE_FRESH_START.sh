#!/bin/bash
# Complete fresh start - cleanup and deploy
# Run this on the server after SSH

set -e

cd ~/AI_Training

echo "🧹 Step 1: Complete cleanup..."
echo ""

# Stop and remove all containers
echo "Stopping containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Remove all images
echo "Removing images..."
docker rmi -f $(docker images -q) 2>/dev/null || true

# Clean Docker system
echo "Cleaning Docker system..."
docker system prune -a -f --volumes

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Current state:"
echo "Containers: $(docker ps -aq | wc -l)"
echo "Images: $(docker images -q | wc -l)"
echo ""

echo "🚀 Step 2: Fresh deployment..."
echo ""

# Verify files
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ docker-compose.prod.yml not found in ~/AI_Training/"
    exit 1
fi

if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod not found in ~/AI_Training/"
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for startup
echo "⏳ Waiting for containers to start (10 seconds)..."
sleep 10

# Check status
echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Check backend logs
echo ""
echo "📋 Backend logs (last 50 lines):"
echo "=================================="
docker logs ai_training_backend --tail 50

# Verify environment variables
echo ""
echo "🔍 Environment variables in container:"
docker exec ai_training_backend env | grep -E "(FRONTEND_URL|CORS_ORIGIN|GOOGLE_REDIRECT)" || echo "⚠️  Not found"

# Verify code exists
echo ""
echo "🔍 Verifying logging code in container:"
docker exec ai_training_backend cat /app/src/server.js | grep -B 2 -A 3 "FRONTEND_URL" | head -8 || echo "⚠️  Code not found"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Check the logs above for FRONTEND_URL logging"

