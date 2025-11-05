# Docker Hub Workflow - Complete Guide

## 🎯 Overview

Docker Hub is like GitHub, but for Docker images. You build images locally, push them to Docker Hub, then pull them on your production server.

---

## 📦 Step-by-Step Workflow

### 1. **Build Images Locally** (on your development machine)

```bash
# Build backend image
docker build -t viralji/ai-training-backend:latest ./backend

# Build frontend image
docker build -t viralji/ai-training-frontend:latest ./frontend
```

**Or use the script:**
```bash
./build-and-push.sh
```

### 2. **Login to Docker Hub**

```bash
docker login
# Username: viralji
# Password: [your Docker Hub password]
```

### 3. **Push Images to Docker Hub**

```bash
# Push backend
docker push viralji/ai-training-backend:latest

# Push frontend
docker push viralji/ai-training-frontend:latest
```

**Or use the script (does both build and push):**
```bash
./build-and-push.sh
```

### 4. **On Production Server** (Digital Ocean)

```bash
# Pull latest images
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# Start containers
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 How to Check if Images are Pushed

### Check Locally (what images you have):

```bash
docker images | grep viralji
```

### Check Docker Hub (what's online):

1. Go to: https://hub.docker.com/u/viralji
2. Look for:
   - `ai-training-backend`
   - `ai-training-frontend`

### Check via Command Line:

```bash
# Login first
docker login

# Check if image exists on Docker Hub
docker manifest inspect viralji/ai-training-backend:latest
docker manifest inspect viralji/ai-training-frontend:latest
```

---

## 🚀 Quick Commands

### Build and Push Everything:

```bash
# Make sure you're logged in
docker login

# Build and push (uses build-and-push.sh)
./build-and-push.sh
```

### Check What You Have:

```bash
# Local images
docker images | grep viralji

# Check if logged in
docker info | grep Username
```

### On Production Server:

```bash
# Pull latest
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# Start
docker-compose -f docker-compose.prod.yml up -d
```

---

## ⚠️ Important Notes

1. **Image Names Must Match:**
   - Local: `viralji/ai-training-backend:latest`
   - Docker Hub: `viralji/ai-training-backend:latest`
   - Docker Compose: `viralji/ai-training-backend:latest`

2. **After Code Changes:**
   - Rebuild images
   - Push to Docker Hub
   - Pull on production
   - Restart containers

3. **Versioning (Optional):**
   ```bash
   # Instead of :latest, use version tags
   docker tag viralji/ai-training-backend:latest viralji/ai-training-backend:v1.0.0
   docker push viralji/ai-training-backend:v1.0.0
   ```

---

## 🔄 Complete Workflow Example

### On Your Development Machine:

```bash
# 1. Make code changes
# ... edit files ...

# 2. Build and push
docker login
./build-and-push.sh

# Verify
docker images | grep viralji
```

### On Digital Ocean Server:

```bash
# 1. Pull latest
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# 2. Stop old containers
docker-compose -f docker-compose.prod.yml down

# 3. Start new containers
docker-compose -f docker-compose.prod.yml up -d

# 4. Check logs
docker logs ai_training_backend
```

---

## 🐛 Troubleshooting

### "unauthorized: authentication required"
```bash
# You need to login
docker login
```

### "image not found" on production
```bash
# Make sure you pushed the image
# Check Docker Hub: https://hub.docker.com/u/viralji
```

### "tag does not exist"
```bash
# The image name must match exactly
# Check: docker images | grep viralji
```

---

## 📋 Checklist

Before deploying to production:

- [ ] Code changes are committed
- [ ] Images are built locally
- [ ] Logged into Docker Hub (`docker login`)
- [ ] Images are pushed (`./build-and-push.sh`)
- [ ] Verified on Docker Hub website
- [ ] On production: Pulled latest images
- [ ] On production: Restarted containers

---

## 🎓 Summary

**Think of it like this:**
- **GitHub** = Code repository
- **Docker Hub** = Image repository

**Workflow:**
1. Write code → Commit to GitHub
2. Build image → Push to Docker Hub
3. On server → Pull from Docker Hub → Run

