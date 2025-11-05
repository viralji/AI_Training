#!/bin/bash
set -e

# Build Docker Images with Production URLs
# Usage: ./build.sh [local|prod]

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Determine environment
ENV=${1:-prod}

if [ "$ENV" = "local" ]; then
    ENV_FILE="docker/.env.local"
else
    ENV_FILE="docker/.env.prod"
fi

echo -e "${BLUE}📋 Loading environment from ${ENV_FILE}${NC}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  ${ENV_FILE} not found!${NC}"
    echo "Please create it from ${ENV_FILE}.example"
    exit 1
fi

# Load environment variables safely
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    # Export the variable
    export "$key=$value"
done < <(grep -v '^#' "$ENV_FILE" | grep -v '^$')

echo -e "${GREEN}🐳 Building Docker Images for ${ENV} environment...${NC}"
echo ""

# Build backend (no build args - runtime config only)
echo "🔨 Building backend..."
docker build -t ${DOCKER_USERNAME:-viraljidocker}/ai-training-backend:latest ./backend

echo ""
echo "🔨 Building frontend with production URLs..."
echo "   VITE_API_URL: ${VITE_API_URL}"
echo "   VITE_BACKEND_URL: ${VITE_BACKEND_URL}"
echo "   VITE_SOCKET_URL: ${VITE_SOCKET_URL}"
echo ""

# Build frontend with build args (Vite needs URLs at build time)
docker build \
  --build-arg VITE_API_URL="${VITE_API_URL}" \
  --build-arg VITE_BACKEND_URL="${VITE_BACKEND_URL}" \
  --build-arg VITE_SOCKET_URL="${VITE_SOCKET_URL}" \
  -t ${DOCKER_USERNAME:-viraljidocker}/ai-training-frontend:latest \
  ./frontend

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "📦 Images created:"
docker images | grep "${DOCKER_USERNAME:-viraljidocker}/ai-training"

echo ""
echo -e "${BLUE}📤 To push to Docker Hub:${NC}"
echo "   docker push ${DOCKER_USERNAME:-viraljidocker}/ai-training-backend:latest"
echo "   docker push ${DOCKER_USERNAME:-viraljidocker}/ai-training-frontend:latest"
echo ""
echo -e "${BLUE}🚀 To deploy locally:${NC}"
echo "   cd docker && docker-compose --env-file .env.local up -d"
echo ""
echo -e "${BLUE}🚀 To deploy to production:${NC}"
echo "   cd docker && docker-compose --env-file .env.prod up -d"
echo ""

