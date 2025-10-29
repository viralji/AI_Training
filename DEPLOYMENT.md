# AI Training Platform - Production Deployment Guide

## 🚀 Quick Deployment to Digital Ocean

This guide will help you deploy the AI Training Platform to Digital Ocean with minimal configuration.

### Prerequisites

1. **Digital Ocean Droplet** (Ubuntu 20.04+ recommended)
2. **Domain name** (optional, for SSL)
3. **Google OAuth credentials** (for authentication)
4. **Gemini API key** (optional, for AI scoring)

### Step 1: Prepare Your Droplet

```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot (for SSL)
apt install -y certbot python3-certbot-nginx

# Create app directory
mkdir -p /var/www/ai-training-platform
chown -R www-data:www-data /var/www/ai-training-platform
```

### Step 2: Configure Environment Variables

```bash
# Copy the production environment template
cp env.production.template .env

# Edit the environment file
nano .env
```

**Required Environment Variables:**

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
SESSION_SECRET=your-super-secure-session-secret-key-change-this-in-production

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Optional: Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional: Domain for SSL
DOMAIN=your-domain.com
EMAIL=your-email@example.com
```

### Step 3: Deploy Using the Script

```bash
# Make the deployment script executable
chmod +x deploy-digital-ocean.sh

# Set your droplet IP
export DROPLET_IP=your-droplet-ip-address
export DOMAIN=your-domain.com  # Optional
export EMAIL=your-email@example.com  # Optional

# Run the deployment script
./deploy-digital-ocean.sh
```

### Step 4: Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Upload files to server
rsync -avz --progress backend/ root@your-droplet-ip:/var/www/ai-training-platform/backend/
rsync -avz --progress frontend/dist/ root@your-droplet-ip:/var/www/ai-training-platform/frontend/dist/
rsync -avz --progress ecosystem.config.js root@your-droplet-ip:/var/www/ai-training-platform/
rsync -avz --progress nginx.conf root@your-droplet-ip:/var/www/ai-training-platform/

# On the server
ssh root@your-droplet-ip
cd /var/www/ai-training-platform/backend
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

The deployment script automatically configures Nginx, but you can verify:

```bash
# Check Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

### Step 6: Setup SSL (Optional)

If you have a domain name:

```bash
# Get SSL certificate
certbot --nginx -d your-domain.com --email your-email@example.com --agree-tos --non-interactive

# Test automatic renewal
certbot renew --dry-run
```

### Step 7: Monitor Your Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart ai-training-platform

# Check health endpoint
curl http://your-domain.com/health
```

## 🔧 Configuration Details

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://your-domain.com/auth/google/callback` (development)
   - `https://your-domain.com/auth/google/callback` (production)

### Gemini AI Setup (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file

### Database Management

```bash
# Backup database
cp /var/www/ai-training-platform/backend/database.sqlite /var/www/ai-training-platform/backups/database-$(date +%Y%m%d).sqlite

# Restore database
cp /var/www/ai-training-platform/backups/database-20240101.sqlite /var/www/ai-training-platform/backend/database.sqlite
pm2 restart ai-training-platform
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 not accessible**
   ```bash
   # Check if port is open
   ufw allow 3000
   ```

2. **Nginx 502 Bad Gateway**
   ```bash
   # Check PM2 status
   pm2 status
   
   # Check logs
   pm2 logs ai-training-platform
   ```

3. **Google OAuth errors**
   - Verify redirect URIs in Google Cloud Console
   - Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

4. **File upload issues**
   ```bash
   # Check upload directory permissions
   chown -R www-data:www-data /var/www/ai-training-platform/backend/uploads
   chmod -R 755 /var/www/ai-training-platform/backend/uploads
   ```

### Health Checks

```bash
# Application health
curl http://your-domain.com/health

# Detailed metrics
curl http://your-domain.com/metrics

# Status for load balancers
curl http://your-domain.com/status
```

## 📊 Performance Optimization

### PM2 Cluster Mode

The application runs in cluster mode by default, utilizing all CPU cores:

```bash
# Check cluster status
pm2 status

# Scale to specific number of instances
pm2 scale ai-training-platform 4
```

### Nginx Optimization

The included `nginx.conf` includes:
- Gzip compression
- Static file caching
- Security headers
- Rate limiting

### Database Optimization

- SQLite with proper indexes
- Connection pooling
- Automatic backups

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting
- CORS protection
- Input validation
- File upload restrictions
- SQL injection prevention

## 📈 Monitoring

### Built-in Monitoring

- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`
- PM2 monitoring: `pm2 monit`

### Log Management

```bash
# View application logs
pm2 logs ai-training-platform

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Rotate logs
pm2 flush
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild frontend
cd frontend && npm run build

# Restart application
pm2 restart ai-training-platform
```

### System Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js (if needed)
npm install -g n
n stable
```

## 📞 Support

For issues or questions:
1. Check the health endpoint: `/health`
2. Review logs: `pm2 logs`
3. Check Nginx status: `systemctl status nginx`
4. Verify environment variables are set correctly

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Google OAuth credentials set
- [ ] SSL certificate installed (if using domain)
- [ ] Database backed up
- [ ] PM2 configured for auto-restart
- [ ] Nginx configured and running
- [ ] Health checks passing
- [ ] File uploads working
- [ ] All assignments accessible
- [ ] Image uploads working (Assignment 5)

Your AI Training Platform is now ready for production! 🎉


