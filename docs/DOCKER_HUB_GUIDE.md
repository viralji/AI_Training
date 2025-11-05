# 🐳 Docker Hub Guide - Build, Push, and Test Locally

This guide will help you:
1. Build Docker images locally
2. Push images to Docker Hub
3. Test everything locally before deploying

---

## 📋 Prerequisites

1. **Docker Desktop** installed on your local machine
2. **Docker Hub account** (viralji@gmail.com)
3. **Docker Hub credentials**

---

## 🚀 STEP 1: Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub username and password when prompted.

**Username:** `viralji` (or your Docker Hub username)
**Password:** Your Docker Hub password

To check if you're logged in:
```bash
docker info | grep Username
```

---

## 🚀 STEP 2: Build Docker Images Locally

### Build Backend Image

```bash
cd /home/viral/code/work/AI_Training

# Build backend image
docker build -t viralji/ai-training-backend:latest ./backend

# Tag with version (optional)
docker tag viralji/ai-training-backend:latest viralji/ai-training-backend:1.0.1
```

### Build Frontend Image

```bash
# Build frontend image
docker build -t viralji/ai-training-frontend:latest ./frontend

# Tag with version (optional)
docker tag viralji/ai-training-frontend:latest viralji/ai-training-frontend:1.0.1
```

### Or Build Both at Once

```bash
# Build both images
docker-compose build

# Or build production versions
docker-compose -f docker-compose.prod.yml build
```

---

## 🚀 STEP 3: Test Images Locally

### Test Backend Container

```bash
# Create .env file if it doesn't exist
cp env.example .env
# Edit .env with your local values

# Create database directory
mkdir -p backend/uploads
touch backend/database.sqlite
chmod 666 backend/database.sqlite

# Run backend container
docker run -d \
  --name ai_training_backend_test \
  -p 3002:3002 \
  --env-file .env \
  -v $(pwd)/backend/database.sqlite:/app/database.sqlite \
  -v $(pwd)/backend/uploads:/app/uploads \
  viralji/ai-training-backend:latest

# Check logs
docker logs -f ai_training_backend_test

# Test health endpoint
curl http://localhost:3002/api/health

# Stop and remove
docker stop ai_training_backend_test
docker rm ai_training_backend_test
```

### Test Frontend Container

```bash
# Run frontend container
docker run -d \
  --name ai_training_frontend_test \
  -p 8080:80 \
  viralji/ai-training-frontend:latest

# Open browser: http://localhost:8080

# Stop and remove
docker stop ai_training_frontend_test
docker rm ai_training_frontend_test
```

### Test with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop everything
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 🚀 STEP 4: Push Images to Docker Hub

### Push Backend Image

```bash
# Push latest version
docker push viralji/ai-training-backend:latest

# Push versioned tag
docker push viralji/ai-training-backend:1.0.1
```

### Push Frontend Image

```bash
# Push latest version
docker push viralji/ai-training-frontend:latest

# Push versioned tag
docker push viralji/ai-training-frontend:1.0.1
```

### Push Both at Once

```bash
# Tag and push both images
docker tag viralji/ai-training-backend:latest viralji/ai-training-backend:1.0.1
docker tag viralji/ai-training-frontend:latest viralji/ai-training-frontend:1.0.1

docker push viralji/ai-training-backend:latest
docker push viralji/ai-training-backend:1.0.1
docker push viralji/ai-training-frontend:latest
docker push viralji/ai-training-frontend:1.0.1
```

---

## 🚀 STEP 5: Pull and Run from Docker Hub

Once pushed, you can pull and run from anywhere:

```bash
# Pull images
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# Run using pulled images
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📝 Quick Reference Script

Save this as `build-and-push.sh`:

```bash
#!/bin/bash
set -e

echo "🔨 Building Docker images..."
docker build -t viralji/ai-training-backend:latest ./backend
docker build -t viralji/ai-training-frontend:latest ./frontend

echo "✅ Build complete!"
echo ""
echo "📦 Images created:"
docker images | grep viralji/ai-training

echo ""
read -p "Push to Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to Docker Hub..."
    docker push viralji/ai-training-backend:latest
    docker push viralji/ai-training-frontend:latest
    echo "✅ Push complete!"
fi
```

Make it executable:
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

---

## 🔍 Verify Images on Docker Hub

Visit: https://hub.docker.com/r/viralji/ai-training-backend
Visit: https://hub.docker.com/r/viralji/ai-training-frontend

---

## 🐛 Troubleshooting

### "unauthorized: authentication required"
- Make sure you're logged in: `docker login`
- Check your Docker Hub username matches

### "permission denied"
- Make sure the repository name matches your Docker Hub username
- Format: `username/image-name:tag`

### Image too large
- Use multi-stage builds (already done)
- Consider using `.dockerignore` (already configured)

---

## ✅ Next Steps

1. ✅ Build images locally
2. ✅ Test locally
3. ✅ Push to Docker Hub
4. ✅ Deploy to Digital Ocean using Docker Hub images

---

## 📚 Related Files

- `docker-compose.yml` - Local development
- `docker-compose.prod.yml` - Production setup
- `backend/Dockerfile` - Backend image
- `frontend/Dockerfile` - Frontend image

