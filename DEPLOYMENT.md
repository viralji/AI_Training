# 🚀 AI Training Platform - Deployment Guide

Complete guide for deploying the AI Training Platform locally or to production servers.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Digital Ocean Deployment](#digital-ocean-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Prerequisites

### Required Software:
- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** (for cloning repository)
- **Docker Hub account** (for pulling images)

### Required Credentials:
- Google OAuth credentials (Client ID & Secret)
- SMTP credentials (for email notifications - optional)
- JWT and Session secrets (for authentication)

---

## Quick Start

### **⚠️ CRITICAL: You MUST Build Frontend Locally**

**Pre-built images on Docker Hub have production URLs baked in.**
**For local development, you MUST build the frontend with local URLs.**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/AI_Training.git
cd AI_Training

# 2. Copy and edit environment
cp docker/.env.local.example docker/.env.local
nano docker/.env.local  # Add your Google OAuth credentials

# 3. BUILD with local URLs (REQUIRED - don't skip!)
./build.sh local

# 4. Start services
cd docker && ./start.sh local

# 5. Access application
open http://localhost:8080
```

### **Why Can't I Just Pull and Run?**

| Component | Can Use Pre-built? | Why |
|-----------|-------------------|-----|
| **Backend** | ✅ Yes | Reads env vars at runtime |
| **Frontend** | ❌ No | URLs compiled into JavaScript at build time |

**The frontend Docker image from Docker Hub was built with production URLs (`https://yourdomain.com`).**
**You must rebuild it with local URLs (`http://localhost:3002`) for local development.**

This is a limitation of Vite/React build process - URLs are compiled, not configurable at runtime.

---

## Local Development

### 1. **Environment Setup**

Create `docker/.env.local` from the example:

```bash
cp docker/.env.local.example docker/.env.local
```

**Required Variables:**

```bash
# Docker
DOCKER_USERNAME=yourusername

# Environment
NODE_ENV=development

# URLs (for local Docker)
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
VITE_API_URL=http://localhost:3002/api
VITE_BACKEND_URL=http://localhost:3002
VITE_SOCKET_URL=http://localhost:3002

# Ports
BACKEND_PORT=3002
FRONTEND_PORT=8080

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback

# Secrets
JWT_SECRET=local-dev-secret-change-this
SESSION_SECRET=local-dev-session-change-this

# AI
GEMINI_API_KEY=your-gemini-api-key

# Email (Optional for local)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 2. **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - Local: `http://localhost:3002/auth/google/callback`
   - Production: `http://yourdomain.com/auth/google/callback`

### 3. **Start Development Environment**

```bash
# Using pre-built images
cd docker
docker-compose --env-file .env.local up -d

# Or build from source first
cd ..
./build.sh local
cd docker
docker-compose --env-file .env.local up -d
```

### 4. **View Logs**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. **Stop Services**

```bash
docker-compose down
```

---

## Production Deployment

### 1. **Prepare Environment File**

Create `docker/.env.prod`:

```bash
cp docker/.env.prod.example docker/.env.prod
nano docker/.env.prod
```

**Critical Production Variables:**

```bash
# Environment
NODE_ENV=production

# URLs (CHANGE TO YOUR DOMAIN!)
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com
VITE_SOCKET_URL=https://yourdomain.com

# Google OAuth (UPDATE redirect URI!)
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Secrets (GENERATE STRONG SECRETS!)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Email (Required for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. **Build Production Images**

```bash
# Load production environment and build
./build.sh prod

# This builds:
# - Backend with no hardcoded URLs
# - Frontend with your production URLs baked in
```

### 3. **Verify Build**

```bash
# Check frontend has correct URLs
docker run --rm viraljidocker/ai-training-frontend:latest \
  sh -c "cat /usr/share/nginx/html/assets/*.js | grep -o 'yourdomain.com'" | head -5

# Should show your domain, NOT localhost
```

### 4. **Push to Docker Hub**

```bash
# Login to Docker Hub
docker login

# Push images
docker push viraljidocker/ai-training-backend:latest
docker push viraljidocker/ai-training-frontend:latest
```

### 5. **Deploy to Server**

See [Digital Ocean Deployment](#digital-ocean-deployment) section below.

---

## Digital Ocean Deployment

### **Prerequisites**

1. ✅ Docker images built and pushed to Docker Hub
2. ✅ `docker/.env.prod` configured with your production URLs
3. ✅ `docker/docker-compose.prod.yml` ready
4. ✅ Digital Ocean droplet created with Docker installed

---

### **Step 1: Server Setup** (One-time)

#### 1. **Create Droplet**

- OS: Ubuntu 22.04 LTS
- Plan: Basic ($6/month minimum)
- Add SSH key for access

#### 2. **Install Docker**

```bash
# SSH into server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

#### 3. **Clean Setup** (if redeploying)

```bash
# Stop and remove old containers
cd ~/AI_Training 2>/dev/null && docker-compose down 2>/dev/null || true

# Clean everything
cd ~ && rm -rf AI_Training
docker system prune -af --volumes

# Create fresh directory
mkdir -p ~/AI_Training
```

---

### **Step 2: Upload Files via WinSCP** (Recommended)

**⚠️ CRITICAL: You must manually upload these 2 files:**

1. **Connect to Server:**
   - Host: `your-server-ip`
   - Username: `root`
   - Password: `your-password`

2. **Upload Files:**
   - Navigate to `/root/AI_Training/` on server
   - From local `AI_Training/docker/` folder, upload:
     - `docker-compose.prod.yml` (keep same name)
     - `.env.prod` (keep same name)

**Alternative (SCP from terminal):**

```bash
# From your local machine
scp docker/docker-compose.prod.yml root@your-server-ip:~/AI_Training/
scp docker/.env.prod root@your-server-ip:~/AI_Training/
```

---

### **Step 3: Deploy Application**

SSH into your server and run:

```bash
ssh root@your-server-ip
cd ~/AI_Training

# Pull latest images from Docker Hub
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull

# Start services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Wait for startup
sleep 10

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

### **Step 4: Verify Deployment**

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                    STATUS
# ai_training_backend     Up X seconds
# ai_training_frontend    Up X seconds

# Check backend logs
docker logs ai_training_backend --tail 30

# Expected output:
# 🌐 FRONTEND_URL: http://aitraining.clickk.cloud
# 🔗 CORS_ORIGIN: http://aitraining.clickk.cloud
# 🔐 GOOGLE_REDIRECT_URI: http://aitraining.clickk.cloud/auth/google/callback
# 🚀 Server running on 0.0.0.0:3002

# Check frontend logs
docker logs ai_training_frontend --tail 20
```

---

### **Step 5: Test Application**

1. **Open browser:** `http://your-domain.com` or `http://your-server-ip`
2. **Click "Continue with Google"**
3. **Verify redirect:** Should redirect to `http://your-domain.com/trainer/...` (NOT localhost!)
4. **Test features:**
   - Dashboard loads
   - Assignments visible
   - Submit assignment
   - AI scoring works

---

### **Common Issues After Deployment**

#### ❌ **Issue: Redirects to localhost after login**

**Cause:** Backend not reading correct `FRONTEND_URL`

**Fix:**
```bash
# Check environment
docker exec ai_training_backend env | grep FRONTEND_URL

# If wrong, verify .env file
cat ~/AI_Training/.env | grep FRONTEND_URL

# Force recreate backend
docker-compose up -d --force-recreate backend

# Check logs again
docker logs ai_training_backend --tail 30
```

#### ❌ **Issue: 404 on /api or /auth routes**

**Cause:** Frontend Nginx not proxying correctly

**Fix:**
```bash
# Check Nginx config
docker exec ai_training_frontend cat /etc/nginx/conf.d/default.conf | grep "location /api"

# Should show proxy_pass to backend
# If not, rebuild frontend image with correct nginx.conf
```

#### ❌ **Issue: "Trainee not approved" or role issues**

**Cause:** User role not set correctly in database

**Fix:**
```bash
# Access backend container
docker exec -it ai_training_backend sh

# Check user in database
sqlite3 /app/database.sqlite "SELECT id, email, role, approved FROM users;"

# Update user role if needed
sqlite3 /app/database.sqlite "UPDATE users SET role='trainer', approved=1 WHERE email='your-email@gmail.com';"

# Exit container
exit
```

---

### **Maintenance Commands**

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update to latest images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# Clean restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

---

### **Complete Fresh Deployment** (if something goes wrong)

```bash
# On server
cd ~/AI_Training
docker-compose -f docker-compose.prod.yml down
cd ~ && rm -rf AI_Training
docker system prune -af --volumes
mkdir -p ~/AI_Training

# Upload .env.prod and docker-compose.prod.yml via WinSCP again

# Deploy
cd ~/AI_Training
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker logs ai_training_backend --tail 30
```

---

## Troubleshooting

### **Issue: Cannot connect to backend**

```bash
# Check if containers are running
docker-compose ps

# Check backend logs
docker logs ai_training_backend

# Check if services can communicate
docker exec ai_training_frontend ping -c 1 backend
```

**Solution:** Ensure both services are in the same Docker network (automatically created by docker-compose).

---

### **Issue: OAuth redirects to localhost**

```bash
# Check backend environment
docker exec ai_training_backend env | grep FRONTEND_URL
```

**Solution:** 
1. Verify `.env` has correct `FRONTEND_URL`
2. Rebuild backend: `docker-compose up -d --force-recreate backend`
3. Or pull fresh image: `docker-compose pull backend && docker-compose up -d`

---

### **Issue: 404 on /api or /auth routes**

```bash
# Check frontend Nginx config
docker exec ai_training_frontend cat /etc/nginx/conf.d/default.conf
```

**Solution:** Ensure Nginx proxies `/api`, `/auth`, `/socket.io` to backend. Rebuild frontend with:
```bash
./build.sh prod
docker push viraljidocker/ai-training-frontend:latest
```

---

### **Issue: SMTP port blocked (Email fails)**

```bash
# Test SMTP connectivity
timeout 5 bash -c '</dev/tcp/smtp.gmail.com/587' && echo "Open" || echo "Blocked"
```

**Solution:**
1. **Option 1:** Contact Digital Ocean support to enable SMTP ports
2. **Option 2:** Try port 465: `SMTP_PORT=465` and `SMTP_SECURE=true`
3. **Option 3:** Use SendGrid or other SMTP service
4. **Option 4:** Disable email (app works fine without it)

---

### **Issue: Frontend shows old code**

```bash
# Check image date
docker images | grep frontend

# Remove old image
docker rmi viraljidocker/ai-training-frontend:latest

# Pull fresh
docker-compose pull frontend

# Recreate container
docker-compose up -d --force-recreate frontend
```

---

### **Issue: Database corruption**

```bash
# Stop backend
docker-compose stop backend

# Backup database (if exists)
docker cp ai_training_backend:/app/database.sqlite ./database.backup.sqlite

# Remove volume to start fresh
docker volume rm ai_training_backend_data

# Start backend (will create new database)
docker-compose up -d backend
```

Note: With current setup (no volumes), simply restart the container to get a fresh database.

---

## Maintenance

### **Update Application**

```bash
# On your local machine - build new version
./build.sh prod
docker push viraljidocker/ai-training-backend:latest
docker push viraljidocker/ai-training-frontend:latest

# On server - pull and update
cd ~/AI_Training
docker-compose pull
docker-compose up -d
```

### **View Logs**

```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100

# Specific service
docker-compose logs -f backend
```

### **Restart Services**

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### **Backup Data**

```bash
# Backup database (if using volumes)
docker cp ai_training_backend:/app/database.sqlite ./backups/database-$(date +%Y%m%d).sqlite

# Backup uploads
docker cp ai_training_backend:/app/uploads ./backups/uploads-$(date +%Y%m%d)
```

### **Check Resource Usage**

```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Clean unused data
docker system prune -a
```

---

## Environment Variables Reference

### **Required Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend domain | `http://yourdomain.com` |
| `CORS_ORIGIN` | CORS allowed origin | `http://yourdomain.com` |
| `VITE_API_URL` | API endpoint for frontend | `http://yourdomain.com/api` |
| `VITE_BACKEND_URL` | Backend URL for frontend | `http://yourdomain.com` |
| `VITE_SOCKET_URL` | WebSocket URL | `http://yourdomain.com` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth secret | `GOCSPX-xxx` |
| `GOOGLE_REDIRECT_URI` | OAuth callback | `http://yourdomain.com/auth/google/callback` |
| `JWT_SECRET` | JWT signing secret | Random 32+ characters |
| `SESSION_SECRET` | Session secret | Random 32+ characters |
| `GEMINI_API_KEY` | AI scoring key | `AIzaSyxxx` |

### **Optional Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password | - |
| `EMAIL_FROM` | From email | `SMTP_USER` |

---

## Quick Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Update
docker-compose pull && docker-compose up -d

# Clean restart
docker-compose down && docker-compose up -d --force-recreate
```

---

## Support

- **Issues:** https://github.com/yourusername/AI_Training/issues
- **Documentation:** [README.md](README.md)
- **Docker Best Practices:** [IDEAL_DOCKER_SETUP.md](IDEAL_DOCKER_SETUP.md)
- **Cheat Sheet:** [DOCKER_CHEAT_SHEET.md](DOCKER_CHEAT_SHEET.md)

---

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ http://yourdomain.com
       ▼
┌─────────────────────────┐
│  Frontend (Nginx:80)    │
│  ┌──────────────────┐   │
│  │  React App       │   │
│  │  (Static Files)  │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │ Nginx Proxy      │   │
│  │ /api → backend   │   │
│  │ /auth → backend  │   │
│  └──────┬───────────┘   │
└─────────┼───────────────┘
          │ Docker Network
          ▼
┌─────────────────────────┐
│  Backend (Node:3002)    │
│  ┌──────────────────┐   │
│  │  Express API     │   │
│  │  Socket.IO       │   │
│  │  OAuth           │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  SQLite DB       │   │
│  │  Gemini AI       │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

---

**Key Principle:** *Build once, configure anywhere* - Same Docker images work for local and production, only environment files differ.

