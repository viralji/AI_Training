# 🎯 Ideal Docker Setup - Lessons Learned

## What Went Wrong Today?

1. **Frontend had hardcoded `localhost` URLs** - Built without production URLs
2. **Volume caching old code** - Backend volume persisted stale code
3. **Missing Nginx proxy config** - Frontend couldn't reach backend
4. **Environment variables not passed to build** - Vite build didn't use production URLs

---

## ✅ Ideal Docker Setup (Copy this for future projects)

### **Core Principle:**
**Docker images should be environment-agnostic. Only `.env` and `docker-compose.yml` should differ between environments.**

---

## 📁 Required Files (Only 3!)

```
project/
├── .env.local          # Local development config
├── .env.prod           # Production config  
└── docker-compose.yml  # Single compose file (uses .env)
```

---

## 🐳 Dockerfile Best Practices

### **Backend Dockerfile** ✅

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# NO environment variables in Dockerfile!
# NO hardcoded URLs!
# Everything comes from docker-compose at runtime

EXPOSE 3002
CMD ["node", "src/server.js"]
```

**Key Points:**
- ✅ No `ENV` variables in Dockerfile
- ✅ No hardcoded URLs
- ✅ Generic and reusable
- ✅ All config from environment at runtime

---

### **Frontend Dockerfile** ✅

```dockerfile
# Stage 1: Build
FROM node:18 AS build
WORKDIR /app

# Accept build-time arguments
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ARG VITE_SOCKET_URL

# Set as environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key Points:**
- ✅ Uses `ARG` for build-time variables
- ✅ Multi-stage build (smaller final image)
- ✅ Nginx config included
- ✅ No hardcoded URLs

---

### **Nginx Config (nginx.conf)** ✅

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy API and auth to backend
    location ~ ^/(api|auth|socket\.io) {
        proxy_pass http://backend:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Key Points:**
- ✅ Proxies `/api`, `/auth`, `/socket.io` to backend
- ✅ Supports React Router
- ✅ Caches static assets
- ✅ Uses service name `backend` (Docker network)

---

## 📝 Single docker-compose.yml

```yaml
version: "3.8"

services:
  backend:
    image: ${DOCKER_USERNAME}/myapp-backend:latest
    container_name: myapp_backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT:-3002}:3002"
    environment:
      - NODE_ENV=${NODE_ENV}
      - FRONTEND_URL=${FRONTEND_URL}
      - CORS_ORIGIN=${CORS_ORIGIN}
    env_file:
      - .env
    networks:
      - app_network

  frontend:
    image: ${DOCKER_USERNAME}/myapp-frontend:latest
    container_name: myapp_frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-80}:80"
    depends_on:
      - backend
    networks:
      - app_network

networks:
  app_network:
    driver: bridge
```

**Key Points:**
- ✅ Uses `${VARIABLE}` from .env
- ✅ No hardcoded values
- ✅ Works for both local and production
- ✅ Service names (backend, frontend) for internal networking

---

## 🔧 Environment Files

### **.env.local** (Local Development)

```bash
# Docker
DOCKER_USERNAME=yourusername

# Environment
NODE_ENV=development

# URLs (for local Docker)
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
VITE_API_URL=http://localhost:3002/api
VITE_BACKEND_URL=http://localhost:3002
VITE_SOCKET_URL=http://localhost:3002

# Ports
BACKEND_PORT=3002
FRONTEND_PORT=8080

# Database
DATABASE_PATH=/app/database.sqlite

# Auth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback
JWT_SECRET=local-dev-secret
SESSION_SECRET=local-dev-session

# Email (optional for local)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### **.env.prod** (Production)

```bash
# Docker
DOCKER_USERNAME=yourusername

# Environment
NODE_ENV=production

# URLs (for production)
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com
VITE_SOCKET_URL=https://yourdomain.com

# Ports
BACKEND_PORT=3002
FRONTEND_PORT=80

# Database
DATABASE_PATH=/app/database.sqlite

# Auth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
JWT_SECRET=production-secret-CHANGE-THIS
SESSION_SECRET=production-session-CHANGE-THIS

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Your App Name
```

---

## 🚀 Build Script (build.sh)

```bash
#!/bin/bash
set -e

# Load environment
source .env.local  # or .env.prod

echo "Building Docker images..."

# Build backend (no build args needed - runtime config only)
docker build -t ${DOCKER_USERNAME}/myapp-backend:latest ./backend

# Build frontend (with build args for Vite)
docker build \
  --build-arg VITE_API_URL=${VITE_API_URL} \
  --build-arg VITE_BACKEND_URL=${VITE_BACKEND_URL} \
  --build-arg VITE_SOCKET_URL=${VITE_SOCKET_URL} \
  -t ${DOCKER_USERNAME}/myapp-frontend:latest \
  ./frontend

echo "✅ Build complete!"
echo ""
echo "To push to Docker Hub:"
echo "  docker push ${DOCKER_USERNAME}/myapp-backend:latest"
echo "  docker push ${DOCKER_USERNAME}/myapp-frontend:latest"
```

---

## 📦 Deployment Workflow

### **Local Development:**

```bash
# 1. Copy environment template
cp .env.local.example .env.local

# 2. Edit .env.local with your values
nano .env.local

# 3. Build images
./build.sh

# 4. Start services
docker-compose --env-file .env.local up -d

# 5. View logs
docker-compose logs -f
```

### **Production Deployment:**

```bash
# ON YOUR LOCAL MACHINE:

# 1. Build with production URLs
source .env.prod
./build.sh

# 2. Push to Docker Hub
docker push ${DOCKER_USERNAME}/myapp-backend:latest
docker push ${DOCKER_USERNAME}/myapp-frontend:latest


# ON PRODUCTION SERVER:

# 1. Copy files via SCP/WinSCP
#    - docker-compose.yml
#    - .env.prod

# 2. Pull and start
docker-compose --env-file .env.prod pull
docker-compose --env-file .env.prod up -d

# 3. Check logs
docker-compose logs -f backend
```

---

## 🎯 Key Principles (Remember These!)

### **✅ DO:**
1. **Use `ARG` in Dockerfile for build-time variables** (frontend URLs)
2. **Use `ENV` in docker-compose for runtime variables** (backend config)
3. **Use service names** for internal networking (`http://backend:3002`)
4. **Keep images generic** - no hardcoded URLs or configs
5. **One docker-compose.yml** - switch with `--env-file`
6. **Nginx in frontend** - proxy API/auth to backend
7. **Multi-stage builds** - smaller images
8. **No volumes for code** - only for data (database, uploads)

### **❌ DON'T:**
1. ❌ Hardcode URLs in source code
2. ❌ Use different docker-compose files for local/prod
3. ❌ Mount volumes over application code in production
4. ❌ Put secrets in Dockerfile
5. ❌ Build images on production server
6. ❌ Use `localhost` in Docker services (use service names)
7. ❌ Cache frontend builds without build args

---

## 🤖 Ideal Cursor Prompt for New Projects

```
I want to dockerize my [Node.js/React/etc] application with best practices:

REQUIREMENTS:
1. Create multi-stage Dockerfiles for frontend (Vite/React) and backend (Node.js)
2. Frontend should use ARG for build-time environment variables (API URLs)
3. Backend should use ENV for runtime configuration
4. Create a single docker-compose.yml that works with different .env files
5. Frontend Nginx should proxy /api, /auth, /socket.io to backend
6. No hardcoded URLs or environment-specific code in Dockerfiles
7. Use Docker service names for internal networking
8. Include .env.local.example and .env.prod.example
9. Create build.sh and deploy.sh scripts
10. No volumes for application code (only for data like database/uploads)

STRUCTURE:
project/
├── backend/
│   └── Dockerfile          # Multi-stage, production-ready
├── frontend/
│   ├── Dockerfile          # Multi-stage with Nginx
│   └── nginx.conf          # Reverse proxy config
├── docker-compose.yml      # Single file, uses .env
├── .env.local.example      # Template for local
├── .env.prod.example       # Template for production
├── build.sh                # Build images with correct args
└── deploy.sh               # Deploy to production

Make images portable - anyone should be able to:
1. Copy docker-compose.yml and .env file
2. Run: docker-compose up -d
3. Application works immediately

Follow the principles from IDEAL_DOCKER_SETUP.md
```

---

## 📊 What We Fixed Today

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| Frontend redirecting to localhost | Built without prod URLs | Use `ARG` + build args |
| Backend using old code | Volume cached stale code | Remove code volumes |
| 404 on /auth routes | Nginx not proxying | Add proxy config |
| Environment not loading | Multiple compose files | Single compose + .env |
| Hard to deploy | Too many config files | 3 files: compose + 2 envs |

---

## 🎓 Key Takeaway

**"Build once, configure anywhere"**

- Docker images = Generic and portable
- Configuration = Environment-specific (.env files)
- One image works everywhere, just change .env

This is the **12-Factor App** methodology - industry standard for cloud-native apps.

---

## ✅ Checklist for Next Project

- [ ] Frontend Dockerfile uses `ARG` for build vars
- [ ] Backend Dockerfile has no hardcoded config
- [ ] Single docker-compose.yml with `${VARIABLES}`
- [ ] Nginx config proxies to backend
- [ ] No volumes mounting over app code
- [ ] Service names used for internal networking
- [ ] .env.local and .env.prod templates
- [ ] build.sh script with proper args
- [ ] Test locally before pushing
- [ ] Document 3-step deployment process

---

**With this setup, you can deploy anywhere in 3 commands:**

```bash
# 1. Copy files
scp docker-compose.yml .env.prod user@server:~/app/

# 2. SSH and deploy
ssh user@server "cd ~/app && docker-compose --env-file .env.prod up -d"

# 3. Done!
```

No debugging, no configuration issues, no wasted time. ✨

