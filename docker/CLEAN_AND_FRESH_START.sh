#!/bin/bash
# Complete cleanup and fresh start script for Digital Ocean server

set -e

echo "🧹 Starting complete cleanup..."

# Stop all containers
echo "Stopping all containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove all containers
echo "Removing all containers..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Remove all images
echo "Removing all images..."
docker rmi -f $(docker images -q) 2>/dev/null || true

# Clean up Docker system
echo "Cleaning Docker system..."
docker system prune -a -f --volumes

# Remove any leftover volumes
echo "Removing volumes..."
docker volume prune -f

# Clean up network
echo "Cleaning networks..."
docker network prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Current state:"
docker ps -a
docker images
docker volume ls

echo ""
echo "🚀 Ready for fresh deployment!"

