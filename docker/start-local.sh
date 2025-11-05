#!/bin/bash

# Quick start script for local development
# Usage: ./start-local.sh

set -e

cd "$(dirname "$0")"

echo "🚀 Starting local development environment..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    if [ -f .env.local.example ]; then
        echo "📝 Copying from example..."
        cp .env.local.example .env.local
        echo "✅ Created .env.local - please update with your values"
        echo ""
        echo "Edit .env.local and run this script again"
        exit 1
    else
        echo "❌ .env.local.example not found!"
        exit 1
    fi
fi

# Create required directories
mkdir -p ../backend/uploads
touch ../backend/database.sqlite 2>/dev/null || true
chmod 666 ../backend/database.sqlite 2>/dev/null || true

# Start containers
docker-compose -f docker-compose.local.yml up -d

echo ""
echo "✅ Local environment started!"
echo ""
echo "📋 Services:"
echo "   Backend:  http://localhost:3002"
echo "   Frontend: http://localhost:8080"
echo ""
echo "📝 Useful commands:"
echo "   View logs:  docker-compose -f docker-compose.local.yml logs -f"
echo "   Stop:       docker-compose -f docker-compose.local.yml down"
echo ""

