#!/bin/bash

# Quick start script for production
# Usage: ./start-prod.sh

set -e

cd "$(dirname "$0")"

echo "🚀 Starting production environment..."
echo ""

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ .env.prod not found!"
    if [ -f .env.prod.example ]; then
        echo "📝 Copying from example..."
        cp .env.prod.example .env.prod
        echo ""
        echo "⚠️  IMPORTANT: Edit .env.prod with your production values:"
        echo "   - FRONTEND_URL"
        echo "   - CORS_ORIGIN"
        echo "   - JWT_SECRET"
        echo "   - SESSION_SECRET"
        echo "   - Google OAuth credentials"
        echo ""
        echo "Then run this script again"
        exit 1
    else
        echo "❌ .env.prod.example not found!"
        exit 1
    fi
fi

# Create required directories
mkdir -p ../backend/uploads
touch ../backend/database.sqlite 2>/dev/null || true
chmod 666 ../backend/database.sqlite 2>/dev/null || true

# Pull latest images
echo "📥 Pulling latest images from Docker Hub..."
docker pull viraljidocker/ai-training-backend:latest || echo "⚠️  Failed to pull backend image"
docker pull viraljidocker/ai-training-frontend:latest || echo "⚠️  Failed to pull frontend image"

# Start containers
echo ""
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Production environment started!"
echo ""
echo "📋 Container status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "📝 Useful commands:"
echo "   View logs:  docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop:       docker-compose -f docker-compose.prod.yml down"
echo "   Restart:    docker-compose -f docker-compose.prod.yml restart"
echo ""

