#!/bin/bash

# Production Deployment Script for Digital Ocean
# Run this on your Digital Ocean server after cloning the repository

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root. Use your deploy user.${NC}"
   exit 1
fi

# Get project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "📝 Copying from env.example..."
    cp env.example .env
    echo -e "${RED}❌ IMPORTANT: Edit .env file with your production values before continuing!${NC}"
    echo "   Required: PORT, FRONTEND_URL, Google OAuth, Gemini API key, JWT_SECRET"
    read -p "Press Enter after you've edited .env file..."
fi

# Check PORT is set
if ! grep -q "^PORT=" .env; then
    echo -e "${RED}❌ PORT not set in .env file!${NC}"
    exit 1
fi

PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
echo -e "${GREEN}✅ PORT=$PORT found in .env${NC}"
echo ""

# Check frontend .env
if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found!${NC}"
    echo "📝 Copying from frontend/env.example..."
    cp frontend/env.example frontend/.env
    echo -e "${RED}❌ IMPORTANT: Edit frontend/.env with production URLs!${NC}"
    read -p "Press Enter after you've edited frontend/.env file..."
fi

echo "📦 Installing dependencies..."
echo ""

# Install root dependencies (if package.json exists)
if [ -f package.json ]; then
    npm install --production 2>&1 | grep -v "npm WARN" || true
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production 2>&1 | grep -v "npm WARN" || true
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install 2>&1 | grep -v "npm WARN" || true
echo ""

# Build frontend
echo "🏗️  Building frontend for production..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"
cd ..

# Update nginx configuration
echo ""
echo "🔧 Updating nginx configuration..."
if [ -f update-nginx.sh ]; then
    chmod +x update-nginx.sh
    ./update-nginx.sh
    
    if [ -f nginx.conf ]; then
        echo "📋 Copying nginx.conf to /etc/nginx/sites-available/ai-training"
        sudo cp nginx.conf /etc/nginx/sites-available/ai-training
        
        echo "🔗 Creating symlink..."
        sudo ln -sf /etc/nginx/sites-available/ai-training /etc/nginx/sites-enabled/ai-training
        
        echo "🧪 Testing nginx configuration..."
        sudo nginx -t
        if [ $? -eq 0 ]; then
            echo "♻️  Reloading nginx..."
            sudo systemctl reload nginx
            echo -e "${GREEN}✅ Nginx configured successfully${NC}"
        else
            echo -e "${RED}❌ Nginx configuration test failed!${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  nginx.conf not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  update-nginx.sh not found${NC}"
fi

# Create logs directory
mkdir -p logs

# Start/restart PM2
echo ""
echo "🚀 Starting application with PM2..."
pm2 delete ai-training-platform 2>/dev/null || true
pm2 start ecosystem.config.js --env production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application started${NC}"
    
    # Save PM2 config
    pm2 save
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "🔍 Checking application health..."
    sleep 2
    
    # Test health endpoint
    HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/api/health || echo "FAILED")
    if [[ "$HEALTH_RESPONSE" == *"healthy"* ]] || [[ "$HEALTH_RESPONSE" == *"status"* ]]; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check response: $HEALTH_RESPONSE${NC}"
        echo "   (This might be okay if backend is still starting)"
    fi
    
else
    echo -e "${RED}❌ Failed to start application${NC}"
    echo "Check logs with: pm2 logs"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Setup SSL: sudo certbot --nginx -d aitraining.cloudextel.com"
echo "   2. Check logs: pm2 logs"
echo "   3. Verify: curl http://localhost:$PORT/api/health"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart application"
echo "   sudo nginx -t       - Test nginx config"
echo ""

