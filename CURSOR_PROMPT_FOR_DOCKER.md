# 🤖 Copy-Paste Cursor Prompt for Docker Setup

## For Any New Project - Copy This Entire Prompt:

---

```
Create a production-ready Docker setup for my full-stack application following these STRICT requirements:

PROJECT STRUCTURE:
I have a [frontend technology: React/Vue/Angular] frontend and [backend technology: Node.js/Python/etc] backend.

MANDATORY REQUIREMENTS:

1. DOCKERFILES:
   - Frontend: Multi-stage build (build stage + Nginx serve stage)
   - Backend: Single-stage production build
   - Frontend must use ARG for build-time variables (VITE_API_URL, VITE_BACKEND_URL, VITE_SOCKET_URL)
   - Backend must use ENV for runtime variables (from docker-compose)
   - NO hardcoded URLs, NO hardcoded environment values
   - All Dockerfiles must be generic and reusable across environments

2. NGINX CONFIGURATION:
   - Create nginx.conf for frontend
   - Must proxy /api, /auth, and /socket.io to backend service
   - Must support SPA routing (try_files)
   - Must use Docker service name 'backend' not 'localhost'
   - Include proper headers for proxying
   - Add caching for static assets

3. DOCKER COMPOSE:
   - Single docker-compose.yml file (NOT separate local/prod files)
   - Use ${VARIABLE} syntax from .env files
   - Use Docker service names for internal networking
   - Frontend depends_on backend
   - Create app_network for services
   - NO volumes mounting over application code
   - Only volumes for data (database, uploads if needed)

4. ENVIRONMENT FILES:
   - Create .env.local.example (for local development)
   - Create .env.prod.example (for production)
   - Include ALL variables needed:
     * NODE_ENV
     * FRONTEND_URL, CORS_ORIGIN
     * VITE_API_URL, VITE_BACKEND_URL, VITE_SOCKET_URL (for frontend build)
     * Database paths
     * Auth secrets (JWT, session, OAuth)
     * Email SMTP settings (optional)
     * All other app-specific config
   - Use placeholder values in examples

5. BUILD SCRIPT (build.sh):
   - Load .env file (accept argument: local or prod)
   - Build backend image (simple build, no args)
   - Build frontend image WITH build args for Vite variables
   - Tag images properly: ${DOCKER_USERNAME}/app-name:latest
   - Display success message with push commands

6. DEPLOYMENT SCRIPT (deploy.sh):
   - Accept environment argument (local/prod)
   - Pull images from Docker Hub
   - Start with correct .env file
   - Show logs and status

7. CODE CONFIGURATION:
   - Backend: Use process.env for ALL config, NO hardcoded values
   - Frontend: Use import.meta.env for ALL URLs
   - Create config files that read from environment
   - NO fallbacks to localhost in production

8. DOCUMENTATION:
   - Create DOCKER_DEPLOYMENT.md with:
     * Prerequisites (Docker, Docker Hub account)
     * Local development steps
     * Production deployment steps
     * Troubleshooting section
   - Include 3-command deployment instructions

CRITICAL RULES:
- ✅ Images must be environment-agnostic (same image for local/prod)
- ✅ Only .env and docker-compose.yml differ between environments
- ✅ Use service names (backend, frontend) in Docker network, NOT localhost
- ✅ Frontend Nginx proxies API calls to backend
- ✅ Build args ONLY for frontend build-time variables
- ✅ Runtime config via ENV in docker-compose
- ✅ No code volumes in production
- ❌ Never hardcode URLs or environment-specific values
- ❌ Never use localhost inside Docker containers
- ❌ Never create separate docker-compose files per environment
- ❌ Never build images on production server

DELIVERABLES:
1. backend/Dockerfile
2. frontend/Dockerfile
3. frontend/nginx.conf
4. docker-compose.yml (single file)
5. .env.local.example
6. .env.prod.example
7. build.sh (with proper build args)
8. deploy.sh
9. DOCKER_DEPLOYMENT.md
10. Update .gitignore (ignore .env.local, .env.prod, keep .env.*.example)

VALIDATION:
After creating files, verify:
- Can I copy docker-compose.yml + .env.prod to ANY server and it works?
- Are there ZERO hardcoded URLs in Dockerfiles?
- Does frontend proxy /api to backend service?
- Can someone run "docker-compose --env-file .env.local up -d" and it works?
- Are images tagged and pushable to Docker Hub?

Follow 12-Factor App methodology. The goal: Build once, deploy anywhere.
```

---

## Quick Reference - Key Concepts:

### **ARG vs ENV:**
- `ARG` = Build-time variable (use for frontend URLs during `npm run build`)
- `ENV` = Runtime variable (use for backend config when container starts)

### **Service Names:**
Inside Docker Compose, services talk to each other using **service names**, not `localhost`:
- ❌ `http://localhost:3002/api`
- ✅ `http://backend:3002/api`

### **Build Args (Frontend):**
```bash
docker build \
  --build-arg VITE_API_URL=http://yourdomain.com/api \
  --build-arg VITE_BACKEND_URL=http://yourdomain.com \
  -t myapp-frontend:latest \
  ./frontend
```

### **No Code Volumes:**
```yaml
# ❌ BAD - mounts code, causes caching issues
volumes:
  - ./backend:/app
  - backend_data:/app

# ✅ GOOD - only data volumes
volumes:
  - ./database.sqlite:/app/database.sqlite
  - ./uploads:/app/uploads
```

---

## What to Tell Cursor if It Deviates:

```
STOP. You're creating separate docker-compose.local.yml and docker-compose.prod.yml.
That's the OLD way and causes deployment issues.

Use a SINGLE docker-compose.yml with ${VARIABLES} that reads from .env files.
Switch environments with: docker-compose --env-file .env.local up -d

Follow the principles from IDEAL_DOCKER_SETUP.md
```

```
STOP. You're hardcoding URLs in the Dockerfile or source code.
ALL URLs must come from environment variables.

Frontend: Use import.meta.env.VITE_API_URL
Backend: Use process.env.FRONTEND_URL

Pass via ARG in frontend Dockerfile, ENV in docker-compose for backend.
```

```
STOP. The frontend Nginx doesn't have proxy configuration.
Add location blocks to proxy /api, /auth, /socket.io to http://backend:3002

The frontend must act as a reverse proxy to the backend service.
```

---

## Testing Checklist (Copy to Cursor):

```
After creating the Docker setup, help me verify:

1. Build Test:
   - Run: source .env.local && ./build.sh
   - Verify: Images created with correct tags
   - Check: Frontend bundle has production URLs (not localhost)

2. Local Test:
   - Run: docker-compose --env-file .env.local up -d
   - Check: Backend logs show correct FRONTEND_URL
   - Check: Frontend can reach http://localhost:8080
   - Check: API calls work (open browser console, check /api/health)
   - Check: No CORS errors

3. Production Simulation:
   - Edit .env.prod with a different domain
   - Rebuild: source .env.prod && ./build.sh
   - Check: New frontend bundle has new domain (not localhost)
   - Push images to Docker Hub
   - On a clean machine: docker-compose --env-file .env.prod pull && up -d
   - Verify: Works without any code changes

4. Image Portability:
   - Delete local images
   - Pull from Docker Hub
   - Start with: docker-compose --env-file .env.local up -d
   - Verify: Works immediately

If all 4 pass, the setup is correct. If any fail, we need to fix the root cause.
```

---

## Summary - The 3 Golden Rules:

1. **Images are generic** (no environment-specific code)
2. **Configuration is external** (via .env files)
3. **Services use names** (not localhost inside Docker)

With these rules, you get:
- ✅ Same image for local and production
- ✅ 3-command deployment anywhere
- ✅ No debugging environment issues
- ✅ Anyone can test your app locally

**Time saved:** Instead of 1 day debugging (like today), deployment takes 5 minutes. 🚀

