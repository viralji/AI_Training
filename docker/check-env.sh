#!/bin/bash
# Script to check environment variables on Digital Ocean

echo "🔍 Checking environment variables in Docker containers..."
echo ""

echo "📋 Backend Container Environment:"
docker exec ai_training_backend env | grep -E "(FRONTEND_URL|CORS_ORIGIN|GOOGLE_REDIRECT_URI|NODE_ENV)" | sort
echo ""

echo "📋 Backend Container Logs (last 20 lines):"
docker logs ai_training_backend --tail 20 | grep -E "(FRONTEND_URL|CORS_ORIGIN|GOOGLE_REDIRECT_URI|Environment|Security)"
echo ""

echo "📋 Checking .env.prod file:"
if [ -f ".env.prod" ]; then
    echo "✅ .env.prod exists"
    grep -E "(FRONTEND_URL|CORS_ORIGIN|GOOGLE_REDIRECT_URI)" .env.prod | head -3
else
    echo "❌ .env.prod file not found!"
fi
echo ""

echo "✅ Done!"

