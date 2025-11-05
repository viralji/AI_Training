# 🚀 The Ultimate Docker Deployment Guide for Cursor AI

**Copy this entire file to Cursor for your next project. This is battle-tested and production-ready.**

---

## 📋 Table of Contents

1. [Initial Cursor Prompt](#initial-cursor-prompt)
2. [Critical Rules](#critical-rules)
3. [File Structure Requirements](#file-structure-requirements)
4. [Deployment Workflow](#deployment-workflow)
5. [SSL Setup](#ssl-setup)
6. [Troubleshooting](#troubleshooting)

---

## 🤖 Initial Cursor Prompt

**Copy this to Cursor when starting a new project:**

```
Create a production-ready Docker setup for my full-stack application:

TECH STACK:
- Frontend: [React/Vue/Angular] with [Vite/Webpack]
- Backend: [Node.js/Python/Go]

REQUIREMENTS:

1. DOCKERFILES:
   Frontend:
   - Multi-stage: build stage → Nginx serve stage
   - Accept ARG for build-time URLs (VITE_API_URL, VITE_BACKEND_URL, VITE_SOCKET_URL)
   - Copy custom nginx.conf
   - NO hardcoded URLs

   Backend:
   - Single-stage production build
   - Use ENV for runtime config (read from docker-compose)
   - NO hardcoded URLs

2. NGINX CONFIGURATION (frontend/nginx.conf):
   - HTTP server: Redirect all to HTTPS (port 80 → 443)
   - HTTPS server: Listen on 443 with SSL
   - SSL certificate paths: /etc/letsencrypt/live/DOMAIN/fullchain.pem & privkey.pem
   - Proxy /api, /auth, /socket.io to http://backend:3002
   - Support SPA routing (try_files $uri /index.html)
   - Security headers (HSTS, X-Frame-Options, etc.)
   - Gzip compression
   - Static asset caching

3. DOCKER COMPOSE (docker-compose.prod.yml):
   - Use service names for networking (backend, frontend)
   - Frontend: Expose ports 80 and 443, mount /etc/letsencrypt:ro
   - Backend: Expose only internal port 3002
   - Use env_file: .env.prod
   - Create custom network
   - NO code volumes (only SSL certificates)

4. ENVIRONMENT FILE (.env.prod):
   - FRONTEND_URL=https://yourdomain.com
   - CORS_ORIGIN=https://yourdomain.com
   - VITE_API_URL=https://yourdomain.com/api
   - VITE_BACKEND_URL=https://yourdomain.com
   - VITE_SOCKET_URL=https://yourdomain.com
   - GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   - All other app-specific variables
   - Use HTTPS for production

5. BUILD SCRIPT (build.sh):
   - Load .env.prod
   - Build backend: docker build -t username/app-backend:latest ./backend
   - Build frontend WITH build args: docker build --build-arg VITE_API_URL=... -t username/app-frontend:latest ./frontend
   - Push both to Docker Hub

6. CODE CONFIGURATION:
   - Backend: Use process.env for ALL config
   - Frontend: Use import.meta.env for ALL URLs
   - Create config files that read from environment
   - NO fallbacks to localhost in production code

CRITICAL RULES:
✅ Frontend URLs are compiled at BUILD time (must rebuild for each environment)
✅ Backend config is read at RUNTIME (same image works everywhere)
✅ Use Docker service names (backend, not localhost) inside containers
✅ Nginx in frontend proxies API calls to backend service
✅ SSL certificates mounted from host /etc/letsencrypt
✅ Manual file upload via WinSCP (docker-compose.prod.yml + .env.prod)
❌ NEVER hardcode URLs in source code or Dockerfiles
❌ NEVER use localhost inside Docker containers
❌ NEVER mount code as volumes in production
❌ NEVER build images on production server

DELIVERABLES:
1. backend/Dockerfile
2. frontend/Dockerfile
3. frontend/nginx.conf (with SSL and proxy config)
4. docker-compose.prod.yml (with SSL certificate mount)
5. .env.prod (with HTTPS URLs)
6. build.sh (with proper build args for frontend)
7. DEPLOYMENT.md (complete guide)

Follow this EXACTLY. This setup is battle-tested and production-ready.
```

---

## ⚠️ Critical Rules (Never Break These)

### **1. Frontend Reality Check**

```
TRUTH: Frontend URLs are COMPILED at build time, not configurable at runtime.

WHY: Vite/React/Vue compile import.meta.env.VITE_* into JavaScript as string literals.

RESULT: You MUST build separate images for local and production.

ACCEPT IT: This is a Vite limitation, not a Docker issue.
```

### **2. Backend vs Frontend**

| Component | Image Strategy | Why |
|-----------|---------------|-----|
| **Backend** | ✅ Same image everywhere | Reads `process.env` at runtime |
| **Frontend** | ❌ Must rebuild per environment | URLs compiled into JS at build time |

### **3. Docker Networking**

```yaml
# ❌ WRONG - localhost doesn't work inside Docker
location /api {
    proxy_pass http://localhost:3002;
}

# ✅ CORRECT - use Docker service name
location /api {
    proxy_pass http://backend:3002;
}
```

### **4. SSL Certificate Mounting**

```yaml
# ✅ CORRECT - mount as read-only
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro

# ❌ WRONG - don't copy into image (expires in 90 days)
COPY /etc/letsencrypt /etc/letsencrypt
```

---

## 📁 File Structure Requirements

```
your-project/
├── backend/
│   ├── Dockerfile              # Single-stage, ENV for runtime
│   ├── src/
│   └── package.json
├── frontend/
│   ├── Dockerfile              # Multi-stage, ARG for build-time
│   ├── nginx.conf              # SSL + proxy config
│   ├── src/
│   └── package.json
├── docker/
│   ├── docker-compose.prod.yml # Production config
│   └── .env.prod               # HTTPS URLs
├── build.sh                    # Build with correct URLs
└── DEPLOYMENT.md               # Complete guide
```

---

## 🔄 Deployment Workflow

### **Phase 1: Local Development**

```bash
# 1. Build with local URLs
docker build \
  --build-arg VITE_API_URL=http://localhost:3002/api \
  -t myapp-frontend:local \
  ./frontend

# 2. Test locally
docker-compose -f docker-compose.local.yml up -d
```

### **Phase 2: Production Build**

```bash
# 1. Update .env.prod with production domain
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
# ... etc

# 2. Build with production URLs
docker build --no-cache \
  --build-arg VITE_API_URL=https://yourdomain.com/api \
  --build-arg VITE_BACKEND_URL=https://yourdomain.com \
  --build-arg VITE_SOCKET_URL=https://yourdomain.com \
  -t dockerhub-username/myapp-frontend:latest \
  ./frontend

docker build --no-cache \
  -t dockerhub-username/myapp-backend:latest \
  ./backend

# 3. Push to Docker Hub
docker push dockerhub-username/myapp-frontend:latest
docker push dockerhub-username/myapp-backend:latest
```

### **Phase 3: Server Setup (One-time)**

```bash
# SSH into server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt-get install docker-compose-plugin

# Create directory
mkdir -p ~/your-app
```

### **Phase 4: SSL Certificate (One-time)**

```bash
# Stop any containers using port 80
cd ~/your-app
docker-compose -f docker-compose.prod.yml down

# Get SSL certificate
apt-get install certbot
certbot certonly --standalone -d yourdomain.com

# Certificate saved at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Auto-renewal is set up automatically
```

### **Phase 5: Deploy**

```bash
# 1. Upload files via WinSCP to ~/your-app/:
#    - docker-compose.prod.yml
#    - .env.prod

# 2. Deploy
cd ~/your-app
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 3. Verify
docker logs your-app_backend --tail 30
docker logs your-app_frontend --tail 20
```

### **Phase 6: Update OAuth Redirect**

```
Go to your OAuth provider (Google, GitHub, etc.):
- Update redirect URI to: https://yourdomain.com/auth/callback
- Save changes
```

---

## 🔒 SSL Setup (Let's Encrypt)

### **nginx.conf Template**

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name _;
    
    # SSL certificates (mounted from host)
    ssl_certificate /etc/letsencrypt/live/YOURDOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOURDOMAIN/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Proxy to backend
    location /api {
        proxy_pass http://backend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SPA routing
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
}
```

### **docker-compose.prod.yml Template**

```yaml
services:
  backend:
    image: dockerhub-username/app-backend:latest
    container_name: app_backend
    restart: unless-stopped
    env_file:
      - .env.prod
    ports:
      - "3002:3002"
    networks:
      - app_net

  frontend:
    image: dockerhub-username/app-frontend:latest
    container_name: app_frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - app_net

networks:
  app_net:
    driver: bridge
```

---

## 🐛 Troubleshooting

### **Issue: Redirects to localhost after login**

**Cause:** Backend not reading correct `FRONTEND_URL`

**Fix:**
```bash
# Check environment
docker exec app_backend env | grep FRONTEND_URL

# If wrong, verify .env.prod
cat ~/your-app/.env.prod | grep FRONTEND_URL

# Force recreate
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate backend
```

---

### **Issue: 404 on /api routes**

**Cause:** Nginx not proxying correctly

**Fix:**
```bash
# Check Nginx config
docker exec app_frontend cat /etc/nginx/conf.d/default.conf | grep "location /api"

# Should show: proxy_pass http://backend:3002;
# If not, rebuild frontend image with correct nginx.conf
```

---

### **Issue: SSL certificate not found**

**Cause:** Certificate not mounted or wrong path

**Fix:**
```bash
# Check if certificate exists on host
ls -la /etc/letsencrypt/live/yourdomain.com/

# Check if mounted in container
docker exec app_frontend ls -la /etc/letsencrypt/live/yourdomain.com/

# If missing, verify docker-compose.prod.yml has:
# volumes:
#   - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

### **Issue: Frontend shows old code**

**Cause:** Docker using cached image

**Fix:**
```bash
# On local machine - rebuild with --no-cache
docker build --no-cache \
  --build-arg VITE_API_URL=https://yourdomain.com/api \
  -t dockerhub-username/app-frontend:latest \
  ./frontend

# Push
docker push dockerhub-username/app-frontend:latest

# On server - force pull and recreate
docker-compose -f docker-compose.prod.yml down
docker rmi dockerhub-username/app-frontend:latest
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

---

## ✅ Validation Checklist

Before deploying to production, verify:

- [ ] Frontend Dockerfile has ARG for VITE_* variables
- [ ] Backend Dockerfile uses ENV (no ARG)
- [ ] nginx.conf has SSL configuration
- [ ] nginx.conf proxies /api to http://backend:3002 (not localhost)
- [ ] docker-compose.prod.yml mounts /etc/letsencrypt
- [ ] docker-compose.prod.yml exposes ports 80 and 443
- [ ] .env.prod has all HTTPS URLs (not HTTP)
- [ ] SSL certificate obtained with certbot
- [ ] OAuth redirect URI updated to HTTPS
- [ ] Images pushed to Docker Hub
- [ ] No hardcoded URLs in source code
- [ ] No localhost references inside Docker containers

---

## 🎯 Success Criteria

Your deployment is correct when:

1. ✅ `https://yourdomain.com` loads with green padlock
2. ✅ Login redirects to `https://yourdomain.com/dashboard` (not localhost)
3. ✅ API calls work (check browser console)
4. ✅ No CORS errors
5. ✅ WebSocket connections work (if applicable)
6. ✅ Same Docker images work on any server (just change .env.prod)

---

## 📚 Key Takeaways

1. **Frontend = Build twice** (local + production with different URLs)
2. **Backend = Build once** (same image, different .env)
3. **SSL = Let's Encrypt** (free, automatic, mounted as volume)
4. **Deployment = WinSCP upload** (docker-compose.prod.yml + .env.prod)
5. **Networking = Service names** (backend, not localhost)
6. **Updates = Rebuild → Push → Pull → Recreate**

---

## 🚀 Time Saved

**Without this guide:** 1-2 days debugging deployment issues
**With this guide:** 30 minutes from zero to production

---

**This guide is based on real production experience. Follow it exactly and save yourself days of debugging.** 🎯

