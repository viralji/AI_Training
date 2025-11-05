# 🚀 Digital Ocean Deployment Checklist

## ✅ Pre-Deployment (On Local Machine)

- [ ] Build production images: `./build.sh` (no args, uses prod by default)
- [ ] Push to Docker Hub: 
  ```bash
  docker push viraljidocker/ai-training-backend:latest
  docker push viraljidocker/ai-training-frontend:latest
  ```
- [ ] Verify `docker/.env.prod` has correct production URLs
- [ ] Verify `docker/docker-compose.prod.yml` is ready

---

## 🧹 Clean Digital Ocean Server

SSH into server and run:

```bash
cd ~/AI_Training 2>/dev/null && docker-compose down 2>/dev/null || true
cd ~ && rm -rf AI_Training
docker system prune -af --volumes
mkdir -p ~/AI_Training
```

---

## 📤 Upload Files via WinSCP

1. Connect to: `139.59.87.174` as `root`
2. Navigate to `/root/AI_Training/`
3. Upload from local `AI_Training/docker/`:
   - `docker-compose.prod.yml` → rename to `docker-compose.yml`
   - `.env.prod` → rename to `.env`

---

## 🚀 Deploy on Server

```bash
ssh root@139.59.87.174
cd ~/AI_Training

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Wait for startup
sleep 10

# Check logs
docker logs ai_training_backend --tail 30
```

---

## ✅ Verify Deployment

```bash
# Check environment variables
docker exec ai_training_backend env | grep -E "FRONTEND_URL|CORS_ORIGIN|GOOGLE_REDIRECT"

# Expected output:
# FRONTEND_URL=http://aitraining.clickk.cloud
# CORS_ORIGIN=http://aitraining.clickk.cloud
# GOOGLE_REDIRECT_URI=http://aitraining.clickk.cloud/auth/google/callback

# Check container status
docker-compose ps

# Both should show "Up"
```

---

## 🧪 Test Application

1. Open: `http://aitraining.clickk.cloud`
2. Click "Continue with Google"
3. After login, verify URL is: `http://aitraining.clickk.cloud/trainer/...` (NOT localhost!)
4. Test:
   - Dashboard loads
   - Assignments visible
   - Submit assignment
   - AI scoring works

---

## 🔧 Quick Fixes

### If redirects to localhost:
```bash
docker exec ai_training_backend env | grep FRONTEND_URL
docker-compose up -d --force-recreate backend
docker logs ai_training_backend --tail 30
```

### If role issues (trainee instead of trainer):
```bash
docker exec -it ai_training_backend sh
sqlite3 /app/database.sqlite "UPDATE users SET role='trainer', approved=1 WHERE email='viralji@gmail.com';"
exit
```

---

## 📝 Maintenance

```bash
# View logs
docker-compose logs -f backend

# Restart
docker-compose restart

# Update
docker-compose pull && docker-compose up -d
```
