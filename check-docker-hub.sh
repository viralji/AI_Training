#!/bin/bash

# Check if Docker images are on Docker Hub
# Usage: ./check-docker-hub.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOCKER_USERNAME="viraljidocker"
BACKEND_IMAGE="${DOCKER_USERNAME}/ai-training-backend:latest"
FRONTEND_IMAGE="${DOCKER_USERNAME}/ai-training-frontend:latest"

echo "🔍 Checking Docker Hub for your images..."
echo ""

# Check if logged in
if ! docker info 2>/dev/null | grep -q Username; then
    echo -e "${YELLOW}⚠️  Not logged into Docker Hub${NC}"
    echo ""
    read -p "Login now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker login
    else
        echo "Skipping login. You can check manually at: https://hub.docker.com/u/viralji"
        exit 0
    fi
fi

echo ""
echo "Checking backend image..."
if docker manifest inspect ${BACKEND_IMAGE} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend image is on Docker Hub${NC}"
    BACKEND_EXISTS=true
else
    echo -e "${RED}❌ Backend image NOT found on Docker Hub${NC}"
    BACKEND_EXISTS=false
fi

echo ""
echo "Checking frontend image..."
if docker manifest inspect ${FRONTEND_IMAGE} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend image is on Docker Hub${NC}"
    FRONTEND_EXISTS=true
else
    echo -e "${RED}❌ Frontend image NOT found on Docker Hub${NC}"
    FRONTEND_EXISTS=false
fi

echo ""
echo "=========================================="

if [ "$BACKEND_EXISTS" = true ] && [ "$FRONTEND_EXISTS" = true ]; then
    echo -e "${GREEN}✅ Both images are on Docker Hub!${NC}"
    echo ""
    echo "🔗 View them at:"
    echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/ai-training-backend"
    echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/ai-training-frontend"
elif [ "$BACKEND_EXISTS" = false ] || [ "$FRONTEND_EXISTS" = false ]; then
    echo -e "${YELLOW}⚠️  Some images are missing${NC}"
    echo ""
    read -p "Push images now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "📤 Pushing images..."
        ./build-and-push.sh
    else
        echo ""
        echo "To push later, run: ./build-and-push.sh"
    fi
fi

echo ""

