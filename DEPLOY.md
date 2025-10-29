# 🚀 Production Deployment Guide

## Quick Start for Digital Ocean

### 1. Clone Repository on Server

```bash
cd /var/www
git clone https://github.com/viralji/AI_Training.git CE_AI_Training
cd CE_AI_Training
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..
```

### 3. Setup Environment Variables

```bash
# Copy example file
cp env.example .env

# Edit with your values
nano .env
```

**Required Variables:**
- `PORT=3002` (or your desired port)
- `FRONTEND_URL=https://aitraining.cloudextel.com`
- `CORS_ORIGIN=https://aitraining.cloudextel.com`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `GOOGLE_REDIRECT_URI=https://aitraining.cloudextel.com/auth/google/callback`
- `JWT_SECRET=...` (minimum 32 characters)
- `SESSION_SECRET=...` (minimum 32 characters)
- `GEMINI_API_KEY=...`

### 4. Update Frontend Environment

```bash
cd frontend
cp env.example .env
nano .env
```

**Required:**
```env
VITE_API_URL=https://aitraining.cloudextel.com/api
VITE_BACKEND_URL=https://aitraining.cloudextel.com
VITE_SOCKET_URL=https://aitraining.cloudextel.com
```

```bash
# Rebuild after setting env vars
npm run build
cd ..
```

### 5. Setup Nginx

```bash
# Update nginx.conf with PORT from .env
chmod +x update-nginx.sh
./update-nginx.sh

# Copy to nginx
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo ln -s /etc/nginx/sites-available/ai-training /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Start Application with PM2

```bash
# Install PM2 globally (if not installed)
sudo npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup  # Follow the command it outputs

# Check status
pm2 status
pm2 logs
```

### 7. Setup SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d aitraining.cloudextel.com
```

## Verification

```bash
# Check backend is running
curl http://localhost:$(grep "^PORT=" .env | cut -d'=' -f2)/api/health

# Check through nginx
curl https://aitraining.cloudextel.com/api/health

# Check PM2
pm2 status
pm2 logs --lines 50
```

## Troubleshooting

### Port Already in Use

```bash
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
sudo lsof -ti:$PORT | xargs sudo kill -9
pm2 restart all
```

### Nginx Not Working

```bash
# Update nginx.conf from .env
./update-nginx.sh
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo nginx -t && sudo systemctl reload nginx
```

### Backend Not Starting

```bash
# Check logs
pm2 logs --err --lines 100

# Check if PORT is set
grep "^PORT=" .env

# Verify .env file exists
ls -la .env
```

## Important Notes

- ✅ **PORT must be in `.env`** - No hardcoded ports
- ✅ **Frontend must be rebuilt** after setting environment variables
- ✅ **Google OAuth redirect URI** must match your domain in Google Console
- ✅ **All secrets must be in `.env`** - Never commit secrets to git
- ✅ **Nginx config** must match PORT from `.env` (use `update-nginx.sh`)

## File Structure

```
CE_AI_Training/
├── .env                    # Backend environment (DO NOT COMMIT)
├── env.example            # Backend env template
├── nginx.conf             # Nginx config (updated by script)
├── update-nginx.sh        # Script to update nginx.conf from .env
├── ecosystem.config.js    # PM2 configuration
├── backend/
│   ├── .env              # Not used (use root .env)
│   └── src/
└── frontend/
    ├── .env              # Frontend environment
    ├── env.example       # Frontend env template
    └── dist/             # Built frontend (generated)
```

## Updating After Git Pull

```bash
cd /var/www/CE_AI_Training
git pull

# Rebuild frontend if needed
cd frontend
npm run build
cd ..

# Restart PM2
pm2 restart ecosystem.config.js --env production

# Update nginx if PORT changed
./update-nginx.sh
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo nginx -t && sudo systemctl reload nginx
```

