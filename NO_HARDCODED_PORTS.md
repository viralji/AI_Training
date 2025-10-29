# ✅ No Hardcoded Ports - Deployment Guide

## Changes Made

All hardcoded port references have been removed. The application now reads the port **only from the `.env` file**.

### Files Updated

1. **`ecosystem.config.js`** - Uses `process.env.PORT` from .env file
2. **`backend/src/config/index.js`** - Requires PORT in .env, validates it's set
3. **`backend/src/config/passport.js`** - Constructs OAuth callback URL from FRONTEND_URL (no hardcoded port)
4. **`nginx.conf`** - Uses `BACKEND_PORT` placeholder (must be replaced)
5. **`update-nginx.sh`** - Script to automatically update nginx.conf from .env

### Key Points

- ✅ **PORT must be set in `.env` file** - No fallback for production
- ✅ **All backend code reads PORT from environment**
- ✅ **Nginx config must match PORT** - Use `update-nginx.sh` script
- ✅ **No hardcoded ports anywhere** - Everything comes from .env

---

## Deployment Steps for Digital Ocean

### 1. Set PORT in .env File

```bash
cd /var/www/CE_AI_Training
nano .env
```

Add or update:
```env
PORT=3002
```

### 2. Update Nginx Configuration

```bash
# Make script executable
chmod +x update-nginx.sh

# Run the script to update nginx.conf from .env
./update-nginx.sh

# Copy to nginx directory
sudo cp nginx.conf /etc/nginx/sites-available/ai-training

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Restart Backend

```bash
# Stop old processes
pm2 stop all
pm2 delete all

# Wait and verify port is free
sleep 2
sudo lsof -i :$(grep "^PORT=" .env | cut -d'=' -f2) || echo "Port is free ✅"

# Start with new config (will use PORT from .env)
pm2 start ecosystem.config.js --env production

# Check status
pm2 status
pm2 logs --lines 20
```

### 4. Verify Everything Works

```bash
# Get PORT from .env
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)

# Test backend directly
curl http://localhost:$PORT/api/health

# Test through nginx
curl https://aitraining.cloudextel.com/api/health
```

---

## Environment Variables Required

Your `.env` file **must** contain:

```env
# Required - No hardcoded fallback
PORT=3002

# Required for production
NODE_ENV=production
FRONTEND_URL=https://aitraining.cloudextel.com
CORS_ORIGIN=https://aitraining.cloudextel.com

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://aitraining.cloudextel.com/auth/google/callback

# JWT
JWT_SECRET=your_secret_key
SESSION_SECRET=your_session_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.0-flash
```

---

## Quick Deployment Command

```bash
# One-command deployment (run from project root)
cd /var/www/CE_AI_Training && \
grep -q "^PORT=" .env || echo "⚠️ PORT not set in .env" && \
./update-nginx.sh && \
sudo cp nginx.conf /etc/nginx/sites-available/ai-training && \
sudo nginx -t && sudo systemctl reload nginx && \
pm2 restart ecosystem.config.js --env production && \
echo "✅ Deployment complete!"
```

---

## Troubleshooting

### Error: "PORT environment variable is required"

**Solution**: Ensure `.env` file contains `PORT=3002` (or your desired port)

### Error: "listen EADDRINUSE: address already in use"

**Solution**: 
```bash
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
sudo lsof -ti:$PORT | xargs sudo kill -9
pm2 restart all
```

### Nginx proxy not working

**Solution**: 
```bash
# Update nginx.conf from .env
./update-nginx.sh

# Verify nginx.conf has correct port
grep proxy_pass nginx.conf

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## Summary

✅ **No hardcoded ports** - Everything reads from `.env`  
✅ **PORT is required** - Application will fail to start without it  
✅ **Nginx auto-update** - Run `./update-nginx.sh` to sync nginx.conf with .env  
✅ **Clean deployment** - Just set PORT in .env and restart

**The port to use is now 100% controlled by your `.env` file!** 🎯

