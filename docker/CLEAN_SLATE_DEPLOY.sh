#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     CLEAN SLATE DEPLOYMENT - Digital Ocean Production         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to AI_Training directory
cd ~/AI_Training

echo "📋 Step 1: Stop all containers..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🗑️  Step 2: Remove all volumes (clean slate)..."
docker volume ls --filter name=ai_training | awk 'NR>1 {print $2}' | xargs -r docker volume rm

echo ""
echo "🗑️  Step 3: Remove old images..."
docker rmi viraljidocker/ai-training-backend:latest || true
docker rmi viraljidocker/ai-training-frontend:latest || true

echo ""
echo "📥 Step 4: Pull latest images from Docker Hub..."
docker-compose -f docker-compose.prod.yml pull

echo ""
echo "🚀 Step 5: Start containers..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting 8 seconds for services to start..."
sleep 8

echo ""
echo "📊 Step 6: Check container status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 Step 7: Backend logs (last 30 lines)..."
docker logs ai_training_backend --tail 30

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Access your application at: http://aitraining.clickk.cloud"
echo ""
echo "📌 Quick Commands:"
echo "   View backend logs:  docker logs ai_training_backend -f"
echo "   View frontend logs: docker logs ai_training_frontend -f"
echo "   Restart all:        docker-compose -f docker-compose.prod.yml restart"
echo "   Stop all:           docker-compose -f docker-compose.prod.yml down"
echo ""

