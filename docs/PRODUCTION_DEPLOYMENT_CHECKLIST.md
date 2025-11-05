# Production Deployment Checklist

This checklist ensures a smooth deployment to Digital Ocean without the errors we encountered.

---

## Pre-Deployment Validation

### 1. Run Validation Script

```bash
chmod +x validate-deployment.sh
./validate-deployment.sh
```

This will check:
- ✅ All required environment variables are set
- ✅ Database path configuration is correct
- ✅ Docker files exist
- ✅ Auto-seeding is enabled
- ✅ Scoring queue is fixed
- ✅ File permissions are correct

### 2. Test Locally with Docker

```bash
# Build images
docker build -t viralji/ai-training-backend:latest ./backend
docker build -t viralji/ai-training-frontend:latest ./frontend

# Start containers
docker-compose -f docker-compose.local.yml up -d

# Test endpoints
curl http://localhost:3002/api/health
curl http://localhost:8080

# Check logs
docker logs ai_training_backend_local | grep -i "auto-seed\|scoring\|error"
```

**Expected logs:**
- `✅ Auto-seeded 6 assignments` (or `Found X existing assignments`)
- `✅ Gemini 2.0 Flash model initialized successfully`
- `[ScoringQueue] Initialized with concurrency limit: 10`

### 3. Test Full Flow

1. **Login** - Should redirect to correct URL (not localhost:5173)
2. **Start Assignment** - Should work without "Assignment not found" error
3. **Submit Assignment** - Should work
4. **Check Scoring** - Should see scoring logs and score appear

---

## Deployment to Digital Ocean

### Step 1: Push Images to Docker Hub

```bash
# Build and push
./build-and-push.sh
```

### Step 2: Prepare Server

```bash
# SSH into server
ssh deploy@your-server-ip

# Create directory
cd /var/www
sudo mkdir -p AI_Training
sudo chown -R $USER:$USER AI_Training
cd AI_Training

# Clone repository
git clone https://github.com/viralji/AI_Training.git .
```

### Step 3: Configure Environment

```bash
# Copy example
cp env.example .env

# Switch to PRODUCTION mode (uncomments PROD vars, comments DEV vars)
./switch-env.sh prod

# Edit production values (especially domain and secrets)
nano .env
```

**Critical settings to update in .env:**
```bash
# These should be UNCOMMENTED (active) after switch-env.sh prod:
FRONTEND_URL=https://your-domain.com  # Your actual production domain
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=your-very-strong-secret-here  # Generate strong secret
SESSION_SECRET=your-very-strong-session-secret  # Generate strong secret

# These should be COMMENTED (inactive):
# FRONTEND_URL=http://localhost:5173  # DEV variable (should be commented)
```

**Note:** The `switch-env.sh prod` script automatically:
- ✅ Uncomments all PROD variables
- ✅ Comments all DEV variables
- ✅ Sets up correct domain configuration

### Step 4: Create Database Directory

```bash
# Create database file (will be auto-initialized)
touch backend/database.sqlite
chmod 666 backend/database.sqlite

# Create uploads directory
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Step 5: Deploy with Docker

```bash
# Ensure PROD mode is active
./switch-env.sh prod

# Verify PROD variables are active
grep "^FRONTEND_URL=" .env  # Should show https://your-domain.com

# Pull images from Docker Hub
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker logs ai_training_backend | grep -i "auto-seed\|scoring\|error"
```

**Important:** Docker compose will use the active variables from `.env`. The `docker-compose.prod.yml` also sets `DATABASE_PATH=/app/database.sqlite` and `FRONTEND_URL` explicitly, but it will use your `.env` values for other variables.

### Step 6: Configure Nginx

```bash
# Use the nginx-docker.conf template
sudo cp nginx-docker.conf /etc/nginx/sites-available/your-domain
sudo nano /etc/nginx/sites-available/your-domain
# Update server_name to your domain

# Enable site
sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Set Up SSL

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://your-domain.com/api/health
```

Should return: `{"status":"healthy",...}`

### 2. Check Logs

```bash
docker logs ai_training_backend | tail -50
```

Look for:
- ✅ `Auto-seeded 6 assignments` (first time only)
- ✅ `✅ Gemini 2.0 Flash model initialized successfully`
- ✅ No errors

### 3. Test Full Flow

1. **Login** - Should work and redirect correctly
2. **View Assignments** - Should see all 6 assignments
3. **Start Assignment** - Should work without errors
4. **Submit Assignment** - Should work
5. **Check Scoring** - Should see score appear automatically

### 4. Monitor Scoring Queue

```bash
# Check queue stats (as trainer, via API)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/submissions/queue/stats
```

---

## Common Issues & Solutions

### Issue: "Assignment not found"
**Cause:** Assignments not seeded  
**Solution:** Check logs for "Auto-seeded" message. If missing, restart backend.

### Issue: "Database disk image is malformed"
**Cause:** Database corruption  
**Solution:** 
```bash
# Backup corrupted database
cp backend/database.sqlite backend/database.sqlite.backup
# Remove and let it recreate
rm backend/database.sqlite
touch backend/database.sqlite
chmod 666 backend/database.sqlite
# Restart backend - will auto-seed
docker-compose -f docker-compose.prod.yml restart backend
```

### Issue: Scoring not working
**Cause:** Queue promise not returned correctly  
**Solution:** Already fixed in code. Rebuild image if using old version.

### Issue: Redirect to localhost:5173
**Cause:** FRONTEND_URL not set correctly  
**Solution:** Set `FRONTEND_URL=https://your-domain.com` in .env

---

## Monitoring Commands

### Check Container Status
```bash
docker ps
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Backend only
docker logs -f ai_training_backend

# Recent errors
docker logs ai_training_backend 2>&1 | grep -i error | tail -20
```

### Check Database
```bash
# Size
ls -lh backend/database.sqlite

# Count assignments
docker exec ai_training_backend node -e \
  "import Database from 'better-sqlite3'; \
   const db = new Database('/app/database.sqlite'); \
   const count = db.prepare('SELECT COUNT(*) as c FROM assignments').get(); \
   console.log('Assignments:', count.c); \
   db.close();"
```

### Check Scoring Queue Stats
```bash
# Via API (requires auth token)
curl -H "Authorization: Bearer TOKEN" \
  https://your-domain.com/api/submissions/queue/stats
```

---

## Why We Had Issues

1. **Database Path Mismatch**: Code used hardcoded path, Docker mounted different path
   - **Fixed**: Now uses `DATABASE_PATH` env var consistently

2. **No Auto-Seeding**: Manual seeding required
   - **Fixed**: Auto-seeds on startup if no assignments exist

3. **Scoring Queue Bug**: Returned `true` instead of promise
   - **Fixed**: Now returns promise correctly

4. **Complex Docker Setup**: Multiple compose files, confusing paths
   - **Fixed**: Simplified, consistent paths

---

## Prevention Strategy

1. **Always run validation script** before deployment
2. **Test locally** with Docker before pushing to production
3. **Check logs** immediately after deployment
4. **Monitor** scoring queue stats
5. **Use consistent paths** - always use `DATABASE_PATH` env var

---

## Quick Reference

```bash
# Validation
./validate-deployment.sh

# Local testing
docker-compose -f docker-compose.local.yml up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker logs -f ai_training_backend

# Restart
docker-compose -f docker-compose.prod.yml restart
```

