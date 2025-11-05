# Clean Slate Deployment - Summary

## ✅ What Was Fixed

### The Problem
Docker was using a volume (`backend_data:/app`) that **cached old code** from previous builds. Even after rebuilding and pushing new images, the stale code from the volume was being used instead of the fresh code from the image.

### The Solution
**Removed all volume mounts** from `docker-compose.prod.yml`. Now containers run with fresh code from Docker images every time.

---

## 🎯 Current State

### ✅ Working
- Frontend and backend Docker images built and pushed to Docker Hub
- Environment variables correctly configured for production
- OAuth redirect URLs fixed (no more localhost:5173)
- Auto-seeding of assignments on startup
- Clean slate deployment (no persistent volumes)

### ⚠️ Trade-off
- **Database is ephemeral** - restarting the backend container will reset all data
- This is intentional for the "clean slate" approach
- If you need persistence, you'll need to add back a volume mount for just the database

---

## 📁 Updated Files

### 1. `docker/docker-compose.prod.yml`
- Removed `volumes: - backend_data:/app`
- Removed `volumes: backend_data:` section
- Containers now use fresh code from images

### 2. `docker/DEPLOY_ON_DIGITAL_OCEAN.md`
- Updated deployment instructions
- Documented the clean slate approach

### 3. `docker/CLEAN_SLATE_DEPLOY.sh` (NEW)
- Automated deployment script
- Stops containers, removes volumes, pulls fresh images, starts containers
- Shows logs and status

---

## 🚀 How to Deploy to Digital Ocean

### Option 1: Manual Steps

1. **Copy files to server via WinSCP:**
   - `docker/docker-compose.prod.yml` → `/root/AI_Training/docker-compose.prod.yml`
   - `docker/.env.prod` → `/root/AI_Training/.env.prod`

2. **SSH into server:**
   ```bash
   ssh root@139.59.87.174
   cd ~/AI_Training
   ```

3. **Deploy:**
   ```bash
   # Stop and remove everything
   docker-compose -f docker-compose.prod.yml down
   docker volume rm ai_training_backend_data || true
   
   # Pull latest images
   docker-compose -f docker-compose.prod.yml pull
   
   # Start fresh
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check logs
   docker logs ai_training_backend --tail 30
   ```

### Option 2: Automated Script

1. **Copy script to server:**
   - `docker/CLEAN_SLATE_DEPLOY.sh` → `/root/AI_Training/CLEAN_SLATE_DEPLOY.sh`

2. **Make it executable and run:**
   ```bash
   chmod +x ~/AI_Training/CLEAN_SLATE_DEPLOY.sh
   ~/AI_Training/CLEAN_SLATE_DEPLOY.sh
   ```

---

## 🔍 Verification

After deployment, you should see in the logs:
```
🌐 FRONTEND_URL: http://aitraining.clickk.cloud
🔗 CORS_ORIGIN: http://aitraining.clickk.cloud
🔐 GOOGLE_REDIRECT_URI: http://aitraining.clickk.cloud/auth/google/callback
🚀 Server running on 0.0.0.0:3002
📊 Environment: production
🔒 Security: Production
```

---

## 📝 Next Steps

1. **Copy updated `docker-compose.prod.yml` to your server** (via WinSCP)
2. **Run the deployment commands** (manual or automated)
3. **Test the application:**
   - Visit http://aitraining.clickk.cloud
   - Click "Continue with Google"
   - Verify it stays on `aitraining.clickk.cloud` (no redirect to localhost)
4. **Verify OAuth is working** and you can log in successfully

---

## 🔧 Future Updates

When you need to update the application:

```bash
# On your local machine - build and push
cd /home/viral/code/work/AI_Training
./build-and-push.sh

# On Digital Ocean server - pull and restart
cd ~/AI_Training
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

**Note:** Since there are no volumes, the database will be reset on container restart.

---

## ⚠️ Important Notes

1. **No data persistence** - Database resets on container restart
2. **Auto-seeding** - Assignments are automatically seeded on startup
3. **Fresh code always** - No volume caching issues
4. **Easy updates** - Just pull and restart

---

## 📞 Quick Commands

```bash
# View logs
docker logs ai_training_backend -f
docker logs ai_training_frontend -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all
docker-compose -f docker-compose.prod.yml down

# Fresh start
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

