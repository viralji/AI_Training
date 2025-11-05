#!/bin/bash
set -e

# Start AI Training Platform
# Usage: ./start.sh [local|prod]

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Determine environment
ENV=${1:-local}

if [ "$ENV" = "prod" ]; then
    ENV_FILE=".env.prod"
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "${BLUE}🚀 Starting PRODUCTION environment...${NC}"
else
    ENV_FILE=".env.local"
    COMPOSE_FILE="docker-compose.local.yml"
    echo -e "${BLUE}🚀 Starting LOCAL development environment...${NC}"
fi

echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  ${ENV_FILE} not found!${NC}"
    if [ -f "${ENV_FILE}.example" ]; then
        echo "📝 Copying from example..."
        cp "${ENV_FILE}.example" "$ENV_FILE"
        echo ""
        echo -e "${YELLOW}⚠️  Please edit ${ENV_FILE} with your values, then run again${NC}"
        exit 1
    else
        echo -e "${YELLOW}❌ ${ENV_FILE}.example not found!${NC}"
        exit 1
    fi
fi

# Pull images if production
if [ "$ENV" = "prod" ]; then
    echo "📥 Pulling latest images from Docker Hub..."
    docker-compose -f "$COMPOSE_FILE" pull || echo "⚠️  Some images failed to pull, will try to use local"
    echo ""
fi

# Start containers
echo "🚀 Starting containers..."
docker-compose -f "$COMPOSE_FILE" up -d

echo ""
echo -e "${GREEN}✅ Environment started!${NC}"
echo ""
echo "📋 Container status:"
docker-compose -f "$COMPOSE_FILE" ps
echo ""

if [ "$ENV" = "local" ]; then
    echo "📋 Services:"
    echo "   Frontend: http://localhost:8080"
    echo "   Backend:  http://localhost:3002"
    echo "   API:      http://localhost:3002/api"
else
    echo "📋 Check your domain for access"
fi

echo ""
echo "📝 Useful commands:"
echo "   View logs:  docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop:       docker-compose -f $COMPOSE_FILE down"
echo "   Restart:    docker-compose -f $COMPOSE_FILE restart"
echo ""

