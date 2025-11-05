# Docker Desktop - Step-by-Step Guide

## 🎯 Quick Steps for Docker Desktop

### Step 1: Verify Docker Desktop is Running

1. Open Docker Desktop application
2. Check bottom-left corner - should show "Docker Desktop is running"
3. If not running, click "Start"

---

### Step 2: Check if You're Logged into Docker Hub

**Option A: Via Docker Desktop UI**
1. Click the gear icon (⚙️) in top-right
2. Go to "Resources" → "Docker Hub"
3. Check if you see your username (viralji)

**Option B: Via Terminal**
```bash
docker login
# Enter username: viralji
# Enter password: [your Docker Hub password]
```

---

### Step 3: Check if Images are Already on Docker Hub

**Easiest Method - Use the Script:**
```bash
cd /home/viral/code/work/AI_Training
./check-docker-hub.sh
```

**Or Check Manually:**
1. Open browser: https://hub.docker.com/u/viralji
2. Login with `viralji@gmail.com`
3. Look for repositories:
   - `ai-training-backend`
   - `ai-training-frontend`

---

### Step 4: Build and Push Images (if needed)

**If images are NOT on Docker Hub, run:**

```bash
cd /home/viral/code/work/AI_Training
./build-and-push.sh
```

**What happens:**
1. Script builds backend image
2. Script builds frontend image
3. Shows you the images
4. Asks: "Test locally first? (y/n)" → Type `n` (skip testing)
5. Asks: "Push to Docker Hub? (y/n)" → Type `y` (push them)

**Or do it manually:**
```bash
# Build images
docker build -t viralji/ai-training-backend:latest ./backend
docker build -t viralji/ai-training-frontend:latest ./frontend

# Push to Docker Hub
docker push viralji/ai-training-backend:latest
docker push viralji/ai-training-frontend:latest
```

---

### Step 5: Verify Images are Pushed

**Check Docker Desktop UI:**
1. Open Docker Desktop
2. Go to "Images" tab
3. Look for `viralji/ai-training-backend` and `viralji/ai-training-frontend`
4. They should show "Pushed" status

**Or check via browser:**
- Go to: https://hub.docker.com/u/viralji
- You should see both repositories listed

---

## 📋 Complete Workflow Summary

### For First Time Setup:

```bash
# 1. Login to Docker Hub
docker login
# Username: viralji
# Password: [your password]

# 2. Build and push images
cd /home/viral/code/work/AI_Training
./build-and-push.sh

# When prompted:
# - Test locally? → n (no)
# - Push to Docker Hub? → y (yes)
```

### For Subsequent Updates (after code changes):

```bash
# 1. Make sure you're logged in
docker login

# 2. Build and push updated images
./build-and-push.sh

# When prompted:
# - Test locally? → n (optional, you can test if you want)
# - Push to Docker Hub? → y (yes)
```

---

## 🔍 Visual Guide - Docker Desktop

### Docker Desktop Main Window:

```
┌─────────────────────────────────────┐
│  Docker Desktop                     │
│                                     │
│  [Images]  [Containers]  [Volumes] │
│                                     │
│  📦 Images Tab:                    │
│  ┌─────────────────────────────┐   │
│  │ viralji/ai-training-backend │   │
│  │   Tag: latest               │   │
│  │   Size: 629MB               │   │
│  │   Status: Pushed ✅          │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ viralji/ai-training-frontend│   │
│  │   Tag: latest               │   │
│  │   Size: 80.4MB              │   │
│  │   Status: Pushed ✅          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ⚡ Quick Commands Reference

```bash
# Check if logged in
docker info | grep Username

# Login to Docker Hub
docker login

# List your local images
docker images | grep viralji

# Check if image exists on Docker Hub
docker manifest inspect viralji/ai-training-backend:latest

# Build and push (interactive)
./build-and-push.sh

# Check Docker Hub status
./check-docker-hub.sh
```

---

## 🐛 Troubleshooting

### "Cannot connect to Docker daemon"
- **Fix:** Make sure Docker Desktop is running
- Check: Docker Desktop should show "Running" status

### "unauthorized: authentication required"
- **Fix:** Login to Docker Hub
- Run: `docker login`

### "denied: requested access to the resource is denied"
- **Fix:** Make sure you're pushing to the correct repository
- Repository name must be: `viralji/ai-training-backend`
- Not just: `ai-training-backend`

### Images not showing in Docker Desktop
- **Fix:** Refresh Docker Desktop (restart if needed)
- Or check via terminal: `docker images | grep viralji`

---

## ✅ Checklist

Before deploying to Digital Ocean:

- [ ] Docker Desktop is running
- [ ] Logged into Docker Hub (`docker login`)
- [ ] Images are built locally (`docker images | grep viralji`)
- [ ] Images are pushed to Docker Hub (check https://hub.docker.com/u/viralji)
- [ ] Verified on Docker Hub website

---

## 🚀 Next Steps (After Pushing)

Once images are on Docker Hub, on your Digital Ocean server:

```bash
# Pull latest images
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# Start containers
docker-compose -f docker-compose.prod.yml up -d
```

