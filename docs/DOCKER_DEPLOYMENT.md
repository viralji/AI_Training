# 🐳 Docker Deployment Guide - Step by Step

This guide will help you deploy the AI Training Platform using Docker on Digital Ocean.

---

## 📋 Prerequisites

1. **Digital Ocean Droplet** (Ubuntu 22.04 or newer)
2. **Domain name** (optional but recommended)
3. **SSH access** to your server

---

## 🚀 STEP 1: Install Docker on Your Server

SSH into your Digital Ocean server:

```bash
ssh deploy@your-server-ip
```

### Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in (or run: newgrp docker)
exit
```

SSH back in:
```bash
ssh deploy@your-server-ip
```

---

## 🚀 STEP 2: Prepare Your Server

### Create project directory

```bash
cd /var/www
sudo mkdir -p AI_Training
sudo chown -R $USER:$USER AI_Training
cd AI_Training
```

### Clone your repository

```bash
git clone https://github.com/viralji/AI_Training.git .
```

---

## 🚀 STEP 3: Set Up Environment Variables

### Create .env file and switch to PRODUCTION mode

```bash
# Copy example
cp env.example .env

# Switch to PRODUCTION mode (uncomments PROD vars, comments DEV vars)
./switch-env.sh prod

# Edit production values (especially domain and secrets)
nano .env
```

**Important:** After `switch-env.sh prod`, update these PRODUCTION values in `.env`:

```bash
# After switch-env.sh prod, these PROD variables should be UNCOMMENTED (active):
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://your-domain.com  # ⚠️ UPDATE THIS to your actual domain
CORS_ORIGIN=https://your-domain.com    # ⚠️ UPDATE THIS to your actual domain

# JWT Secret (generate a strong random string - MUST change from default)
JWT_SECRET=your-very-strong-secret-key-here
SESSION_SECRET=your-very-strong-session-secret  # MUST change from default

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Trainer Email (comma-separated)
TRAINER_EMAILS=your-email@gmail.com

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Email Service (for sending reports)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## 🚀 STEP 4: Create Database Directory

```bash
# Create directory for database (will be created as volume)
mkdir -p backend/database.sqlite
touch backend/database.sqlite
chmod 666 backend/database.sqlite

# Create uploads directory
mkdir -p backend/uploads
chmod 755 backend/uploads
```

---

## 🚀 STEP 5: Build and Start Docker Containers

### Build the images

```bash
docker-compose build
```

This will:
- Build backend image
- Build frontend image (with production build)

**First time takes 5-10 minutes** (downloads dependencies)

### Start the containers

```bash
docker-compose up -d
```

The `-d` flag runs containers in the background (detached mode).

### Check if containers are running

```bash
docker-compose ps
```

You should see:
```
NAME                      STATUS
ai_training_backend       Up
ai_training_frontend      Up
```

### View logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

---

## 🚀 STEP 6: Set Up Nginx (Reverse Proxy)

Since you already have Nginx on your server, we'll configure it to proxy to Docker containers.

### Update Nginx configuration

```bash
sudo nano /etc/nginx/sites-available/your-domain
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### Test and reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚀 STEP 7: Set Up SSL (HTTPS)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically update your Nginx config.

---

## 🚀 STEP 8: Verify Everything Works

### Check containers

```bash
docker-compose ps
```

### Check logs

```bash
docker-compose logs backend | tail -20
docker-compose logs frontend | tail -20
```

### Test health endpoint

```bash
curl http://localhost:3002/api/health
```

### Open in browser

Visit: `https://your-domain.com`

---

## 🔄 Common Docker Commands

### View logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only
```

### Stop containers
```bash
docker-compose stop
```

### Start containers
```bash
docker-compose start
```

### Restart containers
```bash
docker-compose restart
```

### Rebuild and restart (after code changes)
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### View running containers
```bash
docker ps
```

### Enter container shell
```bash
docker exec -it ai_training_backend sh
```

### Remove everything (start fresh)
```bash
docker-compose down -v
docker system prune -a
```

---

## 🔄 Updating the Application

When you push new code:

```bash
cd /var/www/AI_Training

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check if port is in use
sudo netstat -tulpn | grep 3002
```

### Database issues

```bash
# Check database file permissions
ls -la backend/database.sqlite

# Fix permissions
chmod 666 backend/database.sqlite
```

### Frontend not loading

```bash
# Check if frontend built correctly
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

### Can't connect to backend

```bash
# Check backend logs
docker-compose logs backend

# Check environment variables
docker exec ai_training_backend env | grep -E "PORT|FRONTEND_URL"
```

---

## 📊 Monitoring

### View resource usage

```bash
docker stats
```

### View container details

```bash
docker inspect ai_training_backend
```

---

## ✅ Summary

Your application is now running in Docker containers:
- **Backend**: Port 3002 (internal, accessible from localhost only)
- **Frontend**: Port 8080 (internal, accessible from localhost only)
- **Nginx**: Reverse proxy on ports 80/443 (external, public-facing)
- **Database**: Persisted in `backend/database.sqlite` (volume mounted)
- **Uploads**: Persisted in `backend/uploads` (volume mounted)

Access your application at: `https://your-domain.com`

---

## 🔄 Quick Reference: Updating Your Application

### When you push new code:

```bash
cd /var/www/AI_Training

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Or use the deployment script:

```bash
cd /var/www/AI_Training
./deploy-docker.sh
```

---

## 🎉 Next Steps

1. Set up automatic backups for `backend/database.sqlite`
2. Configure log rotation
3. Set up monitoring (optional)
4. Enable auto-restart on server reboot (Docker handles this with `restart: unless-stopped`)

---

**Need help?** Check logs first: `docker-compose logs -f`

