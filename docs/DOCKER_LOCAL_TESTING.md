# 🧪 Local Docker Testing Guide

Test your Docker images locally before pushing to Docker Hub or deploying to production.

---

## 🚀 Quick Start

### Option 1: Use Test Script (Recommended)

```bash
# Test locally
./test-docker-local.sh
```

This script will:
- ✅ Build images if they don't exist
- ✅ Create test directories
- ✅ Start backend and frontend containers
- ✅ Test health endpoints
- ✅ Show you how to access your app

### Option 2: Use Docker Compose

```bash
# Create test directories
mkdir -p backend/test-db backend/test-uploads
touch backend/test-db/database.sqlite
chmod 666 backend/test-db/database.sqlite

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Use Docker Hub Images Locally

```bash
# Make sure you've built and pushed images first
./build-and-push.sh

# Use docker-compose.local.yml (uses Docker Hub images)
docker-compose -f docker-compose.local.yml up -d
```

---

## 📋 Step-by-Step Testing

### STEP 1: Build Images Locally

```bash
# Build backend
docker build -t viralji/ai-training-backend:latest ./backend

# Build frontend
docker build -t viralji/ai-training-frontend:latest ./frontend
```

### STEP 2: Set Up Environment

```bash
# Copy env.example to .env
cp env.example .env

# Edit .env with your local values
nano .env
```

**Minimum required in .env:**
```bash
NODE_ENV=development
PORT=3002
JWT_SECRET=your-local-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# IMPORTANT: For Docker, use port 8080 (or 80 if using docker-compose.yml)
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
```

### STEP 3: Create Test Directories

```bash
mkdir -p backend/test-db backend/test-uploads
touch backend/test-db/database.sqlite
chmod 666 backend/test-db/database.sqlite
chmod 755 backend/test-uploads
```

### STEP 4: Test Backend

```bash
# Start backend container
docker run -d \
  --name ai_training_backend_test \
  -p 3002:3002 \
  --env-file .env \
  -v $(pwd)/backend/test-db/database.sqlite:/app/database.sqlite \
  -v $(pwd)/backend/test-uploads:/app/uploads \
  viralji/ai-training-backend:latest

# Check logs
docker logs -f ai_training_backend_test

# Test health endpoint
curl http://localhost:3002/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### STEP 5: Test Frontend

```bash
# Start frontend container
docker run -d \
  --name ai_training_frontend_test \
  -p 8080:80 \
  viralji/ai-training-frontend:latest

# Open browser: http://localhost:8080
```

### STEP 6: Test Together

```bash
# Start both with docker-compose
docker-compose up -d

# Access:
# Frontend: http://localhost:8080
# Backend API: http://localhost:3002/api/health
```

---

## 🔍 Verification Checklist

- [ ] Backend container starts without errors
- [ ] Backend health endpoint returns `{"status":"ok"}`
- [ ] Frontend container starts without errors
- [ ] Frontend is accessible at http://localhost:8080
- [ ] Database file is created in `backend/test-db/`
- [ ] Uploads directory is writable

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker logs ai_training_backend_test

# Common issues:
# - Missing .env file
# - Port 3002 already in use
# - Database permissions
```

### Frontend shows blank page

```bash
# Check logs
docker logs ai_training_frontend_test

# Check if backend is running
curl http://localhost:3002/api/health
```

### Database errors

```bash
# Fix permissions
chmod 666 backend/test-db/database.sqlite
chmod 755 backend/test-db

# Remove and recreate
rm backend/test-db/database.sqlite
touch backend/test-db/database.sqlite
chmod 666 backend/test-db/database.sqlite
```

---

## 🧹 Cleanup

```bash
# Stop and remove test containers
docker stop ai_training_backend_test ai_training_frontend_test
docker rm ai_training_backend_test ai_training_frontend_test

# Or use docker-compose
docker-compose down

# Remove test directories (optional)
rm -rf backend/test-db backend/test-uploads
```

---

## 📚 Related Files

- `test-docker-local.sh` - Automated testing script
- `build-and-push.sh` - Build and push to Docker Hub
- `docker-compose.yml` - Local development setup
- `docker-compose.local.yml` - Use Docker Hub images locally
- `DOCKER_HUB_GUIDE.md` - Docker Hub instructions

