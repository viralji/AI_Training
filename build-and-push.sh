#!/bin/bash

# Build and Push Docker Images to Docker Hub
# Usage: ./build-and-push.sh [version]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Docker Hub username
DOCKER_USERNAME="viraljidocker"
BACKEND_IMAGE="${DOCKER_USERNAME}/ai-training-backend"
FRONTEND_IMAGE="${DOCKER_USERNAME}/ai-training-frontend"

# Version from argument or use latest
VERSION=${1:-latest}

echo -e "${GREEN}🐳 Building Docker Images...${NC}"
echo ""

# Build backend
echo "🔨 Building backend image..."
docker build -t ${BACKEND_IMAGE}:${VERSION} ./backend
docker tag ${BACKEND_IMAGE}:${VERSION} ${BACKEND_IMAGE}:latest

# Build frontend
echo "🔨 Building frontend image..."
docker build -t ${FRONTEND_IMAGE}:${VERSION} ./frontend
docker tag ${FRONTEND_IMAGE}:${VERSION} ${FRONTEND_IMAGE}:latest

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "📦 Images created:"
docker images | grep ${DOCKER_USERNAME}

echo ""
read -p "🧪 Test locally first? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧪 Testing locally..."
    
    # Create test directories
    mkdir -p backend/uploads backend/test-db
    touch backend/test-db/database.sqlite
    chmod 666 backend/test-db/database.sqlite
    
    # Test backend
    echo "Testing backend..."
    docker run -d \
        --name ai_training_backend_test \
        -p 3002:3002 \
        -v $(pwd)/backend/test-db/database.sqlite:/app/database.sqlite \
        -v $(pwd)/backend/uploads:/app/uploads \
        -e NODE_ENV=development \
        -e PORT=3002 \
        ${BACKEND_IMAGE}:latest || true
    
    sleep 5
    
    # Test health
    if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
    fi
    
    # Cleanup
    docker stop ai_training_backend_test 2>/dev/null || true
    docker rm ai_training_backend_test 2>/dev/null || true
    
    echo ""
fi

echo ""
read -p "📤 Push to Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Pushing to Docker Hub..."
    
    # Check if logged in
    if ! docker info | grep -q Username; then
        echo "🔐 Please login to Docker Hub first:"
        docker login
    fi
    
    # Push backend
    echo "📤 Pushing backend image..."
    docker push ${BACKEND_IMAGE}:${VERSION}
    docker push ${BACKEND_IMAGE}:latest
    
    # Push frontend
    echo "📤 Pushing frontend image..."
    docker push ${FRONTEND_IMAGE}:${VERSION}
    docker push ${FRONTEND_IMAGE}:latest
    
    echo ""
    echo -e "${GREEN}✅ Push complete!${NC}"
    echo ""
    echo "🔗 View your images at:"
    echo "   https://hub.docker.com/r/${BACKEND_IMAGE}"
    echo "   https://hub.docker.com/r/${FRONTEND_IMAGE}"
fi

echo ""
echo -e "${GREEN}✅ Done!${NC}"

