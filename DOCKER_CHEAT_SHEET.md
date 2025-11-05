# 🚀 Docker Deployment Cheat Sheet

## 📋 Quick Commands

### **Local Development**
```bash
# Start
docker-compose --env-file .env.local up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend
```

### **Build Images**
```bash
# Load environment
source .env.local  # or .env.prod

# Build backend
docker build -t ${DOCKER_USERNAME}/myapp-backend:latest ./backend

# Build frontend (with args!)
docker build \
  --build-arg VITE_API_URL=${VITE_API_URL} \
  --build-arg VITE_BACKEND_URL=${VITE_BACKEND_URL} \
  --build-arg VITE_SOCKET_URL=${VITE_SOCKET_URL} \
  -t ${DOCKER_USERNAME}/myapp-frontend:latest \
  ./frontend

# Push to Docker Hub
docker push ${DOCKER_USERNAME}/myapp-backend:latest
docker push ${DOCKER_USERNAME}/myapp-frontend:latest
```

### **Production Deployment**
```bash
# On production server
cd ~/app

# Pull latest
docker-compose --env-file .env.prod pull

# Start/restart
docker-compose --env-file .env.prod up -d

# Force recreate (if needed)
docker-compose --env-file .env.prod up -d --force-recreate
```

### **Debugging**
```bash
# Check container environment
docker exec backend env | grep FRONTEND_URL

# Check what's inside container
docker exec backend ls -la /app/src
docker exec backend cat /app/src/server.js

# Access container shell
docker exec -it backend sh

# Check Nginx config
docker exec frontend cat /etc/nginx/conf.d/default.conf

# Test network connectivity
docker exec backend ping frontend
docker exec frontend ping backend
```

### **Cleanup**
```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi myapp-backend:latest myapp-frontend:latest

# Remove volumes (⚠️ deletes data!)
docker volume rm $(docker volume ls -q | grep myapp)

# Clean everything
docker system prune -a
```

---

## 🔧 Common Issues & Fixes

### **Issue: Frontend shows "Cannot connect to backend"**
```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker logs backend

# Check if frontend can reach backend
docker exec frontend ping backend
```

**Fix:** Nginx should proxy to `http://backend:3002` not `localhost:3002`

---

### **Issue: OAuth redirects to localhost**
```bash
# Check environment variables in backend
docker exec backend env | grep FRONTEND_URL
```

**Fix:** Rebuild backend image or restart with correct `.env.prod`

---

### **Issue: Frontend has old code**
```bash
# Check image build date
docker images | grep frontend

# Rebuild without cache
docker build --no-cache -t myapp-frontend:latest ./frontend
```

**Fix:** Rebuild and push fresh image, pull on server

---

### **Issue: "Connection refused" to backend**
```bash
# Check if services are on same network
docker network inspect myapp_app_network
```

**Fix:** Both services must be in same Docker network (docker-compose creates this automatically)

---

### **Issue: Environment variables not loading**
```bash
# Check .env file location
ls -la .env.prod

# Check docker-compose is reading it
docker-compose --env-file .env.prod config | grep FRONTEND_URL
```

**Fix:** Use `--env-file` flag or rename to `.env`

---

## 📝 Pre-Deployment Checklist

### **Before Building:**
- [ ] Updated `.env.prod` with correct domain
- [ ] Checked all URLs are correct (no localhost in prod)
- [ ] Tested locally with `--env-file .env.local`
- [ ] No hardcoded values in code

### **After Building:**
- [ ] Verified frontend bundle has production URLs
  ```bash
  docker run --rm myapp-frontend:latest cat /usr/share/nginx/html/assets/*.js | grep -o "yourdomain.com"
  ```
- [ ] Checked backend logs show correct environment
  ```bash
  docker run --rm -e FRONTEND_URL=https://yourdomain.com myapp-backend:latest node -e "console.log(process.env.FRONTEND_URL)"
  ```
- [ ] Pushed both images to Docker Hub
  ```bash
  docker images | grep myapp
  ```

### **On Production Server:**
- [ ] Copied `docker-compose.yml`
- [ ] Copied `.env.prod`
- [ ] Pulled images: `docker-compose pull`
- [ ] Started: `docker-compose up -d`
- [ ] Checked logs: `docker-compose logs -f`
- [ ] Tested URL in browser
- [ ] Checked OAuth flow
- [ ] Verified API calls work

---

## 🎯 Golden Rules

1. **Never use localhost inside Docker** → Use service names
2. **Never hardcode URLs** → Use environment variables
3. **Never mount code volumes in prod** → Use fresh images
4. **Always use build args for frontend** → Vite needs URLs at build time
5. **Always use runtime ENV for backend** → Config at runtime
6. **Single docker-compose.yml** → Switch with `--env-file`
7. **Build locally, deploy via Docker Hub** → Don't build on prod server

---

## 📊 File Structure Reference

```
project/
├── backend/
│   ├── Dockerfile           # No ENV, generic
│   └── src/
│       └── server.js        # Uses process.env
├── frontend/
│   ├── Dockerfile           # ARG for build-time
│   ├── nginx.conf           # Proxy config
│   └── src/
│       └── config.js        # Uses import.meta.env
├── docker-compose.yml       # Single file, uses ${VAR}
├── .env.local               # Local config
├── .env.prod                # Production config
├── .env.local.example       # Template
├── .env.prod.example        # Template
├── build.sh                 # Build with args
├── deploy.sh                # Deploy script
└── .gitignore               # Ignore .env.local, .env.prod
```

---

## 🔍 Verification Commands

```bash
# 1. Check images exist locally
docker images | grep myapp

# 2. Check images on Docker Hub
docker pull yourusername/myapp-backend:latest
docker pull yourusername/myapp-frontend:latest

# 3. Check frontend URLs
docker run --rm yourusername/myapp-frontend:latest \
  sh -c "cat /usr/share/nginx/html/assets/*.js | grep -o 'yourdomain.com'" | head -5

# 4. Check nginx config
docker run --rm yourusername/myapp-frontend:latest \
  cat /etc/nginx/conf.d/default.conf

# 5. Check services can communicate
docker-compose up -d
docker exec frontend ping -c 1 backend
docker exec backend ping -c 1 frontend

# 6. Check environment loading
docker exec backend env | grep FRONTEND_URL
docker logs backend | grep "FRONTEND_URL"
```

---

## 🚨 Emergency Recovery

### **Something is broken on production:**

```bash
# 1. Check what's running
docker-compose ps

# 2. Check logs
docker-compose logs --tail 100

# 3. Stop everything
docker-compose down

# 4. Remove old images
docker rmi $(docker images -q)

# 5. Pull fresh
docker-compose pull

# 6. Start clean
docker-compose up -d

# 7. Monitor
docker-compose logs -f
```

### **Need to rollback:**

```bash
# Pull specific version (if you tagged it)
docker pull yourusername/myapp-backend:v1.2.3
docker pull yourusername/myapp-frontend:v1.2.3

# Update docker-compose.yml to use :v1.2.3 instead of :latest
# Then restart
docker-compose up -d
```

---

## 💡 Pro Tips

1. **Tag versions:** Don't rely only on `:latest`
   ```bash
   docker tag myapp-backend:latest myapp-backend:v1.0.0
   docker push myapp-backend:v1.0.0
   ```

2. **Health checks:** Add to docker-compose
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
     interval: 30s
     timeout: 3s
     retries: 3
   ```

3. **Use .dockerignore:** Speed up builds
   ```
   node_modules
   .git
   .env*
   *.md
   ```

4. **Multi-stage builds:** Smaller images
   ```dockerfile
   FROM node:18 AS build
   # build steps
   FROM node:18-alpine
   COPY --from=build /app/dist ./dist
   ```

5. **Check before push:**
   ```bash
   docker run --rm -it myapp-backend:latest sh
   # Explore and verify everything is correct
   ```

---

**Remember:** With proper setup, deployment is 3 commands:
```bash
scp docker-compose.yml .env.prod server:~/app/
ssh server "cd ~/app && docker-compose --env-file .env.prod up -d"
# Done! ✨
```

