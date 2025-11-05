#!/bin/bash
# Fresh deployment script - runs after cleanup

set -e

cd ~/AI_Training

echo "🚀 Starting fresh deployment..."

# Verify files exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ docker-compose.prod.yml not found!"
    exit 1
fi

if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod not found!"
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for startup
echo "⏳ Waiting for containers to start..."
sleep 8

# Check status
echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Check backend logs
echo ""
echo "📋 Backend logs (last 40 lines):"
docker logs ai_training_backend --tail 40

# Verify FRONTEND_URL is set
echo ""
echo "🔍 Checking environment variables:"
docker exec ai_training_backend env | grep -E "(FRONTEND_URL|CORS_ORIGIN|GOOGLE_REDIRECT)" || echo "⚠️  Environment variables not found"

# Verify code exists in container
echo ""
echo "🔍 Verifying code in container:"
docker exec ai_training_backend cat /app/src/server.js | grep -A 2 "FRONTEND_URL" | head -5 || echo "⚠️  Code not found in container"

echo ""
echo "✅ Deployment complete!"

