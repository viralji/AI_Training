# 🔧 Docker URL Redirect Fix

## Problem
After login in Docker, the app redirects to `http://localhost:5173` instead of `http://localhost:8080`.

## Solution

The backend uses `FRONTEND_URL` environment variable for OAuth redirects. Make sure it's set correctly for Docker.

### Option 1: Set in .env file (Recommended)

Edit your `.env` file:

```bash
# For local Docker testing (frontend on port 8080)
FRONTEND_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:8080
```

### Option 2: Override in docker-compose

The `docker-compose.local.yml` and `docker-compose.prod.yml` files now automatically set:
- `FRONTEND_URL=http://localhost:8080`
- `CORS_ORIGIN=http://localhost:8080`

### Option 3: Manual override

```bash
# When starting containers
docker-compose -f docker-compose.local.yml up -d \
  -e FRONTEND_URL=http://localhost:8080 \
  -e CORS_ORIGIN=http://localhost:8080
```

## Quick Fix

1. **Stop containers:**
   ```bash
   docker-compose down
   ```

2. **Update .env file:**
   ```bash
   # Add or update these lines
   FRONTEND_URL=http://localhost:8080
   CORS_ORIGIN=http://localhost:8080
   ```

3. **Restart containers:**
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   ```

4. **Test login:**
   - Go to http://localhost:8080/login
   - Login with Google
   - Should redirect to http://localhost:8080/trainer/chapter-1 (not localhost:5173)

## For Production Deployment

On Digital Ocean, set:
```bash
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

## Verify

After restarting, check backend logs:
```bash
docker logs ai_training_backend_local
```

Look for:
```
FRONTEND_URL=http://localhost:8080
```

