# Deploy on Digital Ocean - Simple Steps

## Your Server Structure
```
root@ubuntu-project-01-drp:~/AI_Training#
├── .env.prod                    (copy via WinSCP)
└── docker-compose.prod.yml       (copy via WinSCP)
```

**Note:** No volumes are used. Database is ephemeral - restarting containers will reset data. This is a clean slate approach.

## Step 1: Copy Files to Server (Using WinSCP)

Using WinSCP, copy these files to: `~/AI_Training/` (or `/root/AI_Training/`)

1. **docker-compose.prod.yml** - Copy from your local `docker/docker-compose.prod.yml`
2. **.env.prod** - Copy from your local `docker/.env.prod`

**Destination path on server:** `/root/AI_Training/`

## Step 2: SSH into Your Server

```bash
ssh root@ubuntu-project-01-drp
```

## Step 3: Navigate to Project Directory

```bash
cd ~/AI_Training
```

## Step 4: Verify Files Are Present

```bash
ls -la
```

You should see:
- `.env.prod`
- `docker-compose.prod.yml`

## Step 5: Pull Latest Docker Images

**IMPORTANT:** Make sure to pull the latest images to get all fixes!

```bash
docker-compose -f docker-compose.prod.yml pull
```

This will pull:
- `viraljidocker/ai-training-backend:latest` (with FRONTEND_URL logging)
- `viraljidocker/ai-training-frontend:latest`

**If you already have containers running, you MUST pull and restart:**
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Step 6: Stop Existing Containers (if running)

```bash
docker-compose -f docker-compose.prod.yml down
```

## Step 7: Start Containers

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Step 8: Verify Deployment

### Check container status:
```bash
docker-compose -f docker-compose.prod.yml ps
```

Both containers should show "Up" status.

### Check backend logs:
```bash
docker logs ai_training_backend --tail 30
```

**Look for these critical lines:**
```
🌐 FRONTEND_URL: http://aitraining.clickk.cloud
🔗 CORS_ORIGIN: http://aitraining.clickk.cloud
🔐 GOOGLE_REDIRECT_URI: http://aitraining.clickk.cloud/auth/google/callback
```

**If you DON'T see these lines, you're using an OLD image. Run:**
```bash
docker-compose -f docker-compose.prod.yml pull backend
docker-compose -f docker-compose.prod.yml restart backend
docker logs ai_training_backend --tail 30
```

**If you see:**
```
🌐 FRONTEND_URL: ⚠️ NOT SET (using fallback: http://localhost:5173)
❌ CRITICAL: FRONTEND_URL is not set in production!
```

Then check your `.env.prod` file has `FRONTEND_URL=http://aitraining.clickk.cloud`

### Check frontend logs:
```bash
docker logs ai_training_frontend --tail 20
```

## Step 9: Test the Application

1. Open browser: `http://aitraining.clickk.cloud`
2. Click "Login"
3. Click "Continue with Google"
4. After Google auth, you should be redirected to `http://aitraining.clickk.cloud/login?token=...` (NOT localhost:5173)

## Quick Commands Reference

```bash
# Navigate to project
cd ~/AI_Training

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart only backend
docker-compose -f docker-compose.prod.yml restart backend

# View logs
docker logs ai_training_backend --tail 50 -f
docker logs ai_training_frontend --tail 50 -f

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check environment variables in container
docker exec ai_training_backend env | grep FRONTEND_URL
docker exec ai_training_backend env | grep CORS_ORIGIN
```

## Troubleshooting

### Issue: Still redirecting to localhost:5173

1. **Check environment variables in container:**
   ```bash
   docker exec ai_training_backend env | grep FRONTEND_URL
   ```

2. **Check .env.prod file:**
   ```bash
   cat ~/AI_Training/.env.prod | grep FRONTEND_URL
   ```
   
   Should show:
   ```
   FRONTEND_URL=http://aitraining.clickk.cloud
   ```

3. **Restart backend:**
   ```bash
   docker-compose -f docker-compose.prod.yml restart backend
   ```

4. **Check logs again:**
   ```bash
   docker logs ai_training_backend --tail 20
   ```

### Issue: Containers won't start

1. **Check for errors:**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```
   (Remove `-d` to see logs in foreground)

2. **Check port conflicts:**
   ```bash
   netstat -tulpn | grep :3002
   netstat -tulpn | grep :80
   ```

### Issue: Files not found

Make sure you're in the correct directory:
```bash
pwd
# Should show: /root/AI_Training

ls -la
# Should show: .env.prod and docker-compose.prod.yml
```

## Summary Workflow

1. ✅ Copy `.env.prod` and `docker-compose.prod.yml` to `/root/AI_Training/` via WinSCP
2. ✅ SSH to server: `ssh root@ubuntu-project-01-drp`
3. ✅ Navigate: `cd ~/AI_Training`
4. ✅ Pull images: `docker-compose -f docker-compose.prod.yml pull`
5. ✅ Start containers: `docker-compose -f docker-compose.prod.yml up -d`
6. ✅ Verify: `docker logs ai_training_backend --tail 20`

That's it! The images are already on Docker Hub with all fixes. Just pull and run!
