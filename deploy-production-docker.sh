#!/bin/bash

# Production Docker Deployment Script for Digital Ocean
# This script handles the complete production deployment including env switching

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Production Docker Deployment${NC}"
echo ""

# Get project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

# Check if docker/.env.prod exists
if [ ! -f docker/.env.prod ]; then
    echo -e "${YELLOW}⚠️  docker/.env.prod file not found!${NC}"
    if [ -f docker/.env.prod.example ]; then
        echo "📝 Copying from example..."
        cp docker/.env.prod.example docker/.env.prod
        echo -e "${RED}❌ IMPORTANT: Edit docker/.env.prod with your production values!${NC}"
        echo "   Required: FRONTEND_URL, CORS_ORIGIN, JWT_SECRET, SESSION_SECRET, Google OAuth, Gemini API key"
        exit 1
    else
        echo -e "${RED}❌ docker/.env.prod.example not found!${NC}"
        exit 1
    fi
fi

# Verify PROD variables are set
if grep -q "^FRONTEND_URL=https://" docker/.env.prod 2>/dev/null; then
    PROD_URL=$(grep "^FRONTEND_URL=" docker/.env.prod | cut -d '=' -f2-)
    echo -e "${GREEN}✅ Production environment detected${NC}"
    echo -e "${GREEN}   FRONTEND_URL: $PROD_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: FRONTEND_URL doesn't start with https:// in docker/.env.prod${NC}"
    echo "   Please verify your docker/.env.prod file has production domain set"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run validation
echo ""
echo -e "${GREEN}🔍 Running deployment validation...${NC}"
if [ -f validate-deployment.sh ]; then
    if ./validate-deployment.sh; then
        echo -e "${GREEN}✅ Validation passed!${NC}"
    else
        echo -e "${RED}❌ Validation failed!${NC}"
        echo "   Please fix errors before deploying"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  validate-deployment.sh not found - skipping validation${NC}"
fi

# Create required directories
echo ""
echo "📁 Creating required directories..."
mkdir -p backend/uploads
touch backend/database.sqlite 2>/dev/null || true
chmod 666 backend/database.sqlite 2>/dev/null || true
chmod 755 backend/uploads

# Check if docker/.env.prod exists
if [ ! -f docker/.env.prod ]; then
    echo -e "${YELLOW}⚠️  docker/.env.prod not found!${NC}"
    if [ -f docker/.env.prod.example ]; then
        echo "📝 Copying from example..."
        cp docker/.env.prod.example docker/.env.prod
        echo -e "${RED}❌ IMPORTANT: Edit docker/.env.prod with your production values!${NC}"
        exit 1
    else
        echo -e "${RED}❌ docker/.env.prod.example not found!${NC}"
        exit 1
    fi
fi

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
cd docker
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
cd ..

# Build or pull images
echo ""
read -p "Build images locally or pull from Docker Hub? (build/pull) [build]: " -n 5 -r
echo
if [[ $REPLY =~ ^[Pp]ull$ ]]; then
    echo "📥 Pulling images from Docker Hub..."
    docker pull viraljidocker/ai-training-backend:latest || echo "⚠️  Backend image not found in Docker Hub"
    docker pull viraljidocker/ai-training-frontend:latest || echo "⚠️  Frontend image not found in Docker Hub"
else
    echo "🔨 Building images locally..."
    docker-compose -f docker-compose.prod.yml build --no-cache
fi

# Start containers
echo ""
echo "🚀 Starting containers..."
cd docker
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
echo ""
echo "⏳ Waiting for containers to start..."
sleep 5

# Check container status
echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

# Check logs
echo ""
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20
cd ..

# Verify
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🧪 Verification steps:"
echo "  1. Check health: curl http://localhost:3002/api/health"
echo "  2. Check logs: docker logs ai_training_backend | grep -i 'auto-seed\|scoring'"
echo "  3. Test login: https://your-domain.com/login"
echo ""
echo "📝 Useful commands:"
echo "  View logs:        cd docker && docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:            cd docker && docker-compose -f docker-compose.prod.yml down"
echo "  Restart:         cd docker && docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "📁 All Docker configs are in: docker/"
echo "   - docker/docker-compose.prod.yml"
echo "   - docker/.env.prod"
echo ""

