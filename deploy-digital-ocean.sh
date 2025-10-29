#!/bin/bash

# AI Training Platform - Digital Ocean Deployment Script
# This script automates the deployment process to Digital Ocean

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ai-training-platform"
DROPLET_IP="${DROPLET_IP:-}"  # Set this environment variable
DROPLET_USER="${DROPLET_USER:-root}"
DOMAIN="${DOMAIN:-}"  # Optional domain name
EMAIL="${EMAIL:-}"  # For SSL certificate

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

check_requirements() {
    log "Checking requirements..."
    
    if [ -z "$DROPLET_IP" ]; then
        error "DROPLET_IP environment variable is required"
    fi
    
    if ! command -v ssh &> /dev/null; then
        error "SSH is required but not installed"
    fi
    
    if ! command -v rsync &> /dev/null; then
        error "rsync is required but not installed"
    fi
    
    success "Requirements check passed"
}

prepare_local() {
    log "Preparing local files..."
    
    # Create production build
    log "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    # Create deployment package
    log "Creating deployment package..."
    tar -czf deployment.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='database.sqlite' \
        --exclude='uploads' \
        --exclude='.env' \
        backend/ \
        frontend/dist/ \
        ecosystem.config.js \
        nginx.conf \
        package.json \
        README.md
    
    success "Local preparation completed"
}

deploy_to_server() {
    log "Deploying to server $DROPLET_IP..."
    
    # Upload files
    log "Uploading files..."
    rsync -avz --progress deployment.tar.gz $DROPLET_USER@$DROPLET_IP:/tmp/
    
    # Execute deployment on server
    log "Executing deployment on server..."
    ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
        set -e
        
        # Create app directory
        mkdir -p /var/www/ai-training-platform
        cd /var/www/ai-training-platform
        
        # Extract files
        tar -xzf /tmp/deployment.tar.gz
        
        # Install dependencies
        cd backend
        npm install --production
        
        # Create necessary directories
        mkdir -p uploads/submissions
        mkdir -p logs
        mkdir -p backups
        
        # Set permissions
        chown -R www-data:www-data /var/www/ai-training-platform
        chmod -R 755 /var/www/ai-training-platform
        
        # Install PM2 globally if not installed
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        
        # Start application with PM2
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
        
        # Setup nginx
        cp nginx.conf /etc/nginx/sites-available/ai-training-platform
        ln -sf /etc/nginx/sites-available/ai-training-platform /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Test nginx configuration
        nginx -t
        
        # Reload nginx
        systemctl reload nginx
        
        # Setup SSL if domain is provided
        if [ ! -z "$DOMAIN" ] && [ ! -z "$EMAIL" ]; then
            # Install certbot if not installed
            if ! command -v certbot &> /dev/null; then
                apt-get update
                apt-get install -y certbot python3-certbot-nginx
            fi
            
            # Get SSL certificate
            certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
        fi
        
        echo "Deployment completed successfully!"
EOF
    
    success "Deployment to server completed"
}

cleanup() {
    log "Cleaning up..."
    rm -f deployment.tar.gz
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting AI Training Platform deployment to Digital Ocean..."
    
    check_requirements
    prepare_local
    deploy_to_server
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Your application should be available at:"
    if [ ! -z "$DOMAIN" ]; then
        echo "  https://$DOMAIN"
    else
        echo "  http://$DROPLET_IP"
    fi
    log "Monitor your application with: ssh $DROPLET_USER@$DROPLET_IP 'pm2 monit'"
}

# Run main function
main "$@"