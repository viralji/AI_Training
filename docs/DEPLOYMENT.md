# 🚀 Production Deployment Guide
## Local → Git → Digital Ocean

---

## 📍 STEP 1: LOCAL → GIT

```bash
cd /home/viral/code/work/AI_Training

# Verify .env is ignored
git check-ignore .env
# Should return: .env

# Commit and push
git add .
git commit -m "Production-ready: Complete AI Training Platform"
git push origin main
```

---

## 📍 STEP 2: DIGITAL OCEAN - FIRST TIME SETUP

### 2.1 Install Software
```bash
ssh deploy@your-server-ip

# Update & install dependencies
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
sudo apt install nginx git -y
```

### 2.2 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/viralji/AI_Training.git AI_Training
sudo chown -R deploy:deploy AI_Training
cd AI_Training
```

### 2.3 Setup Environment Variables

**Single `.env` file (root directory):**
All environment variables are now in ONE place - the root `.env` file.
This includes both backend and frontend variables.

The `.env` file has both DEV and PROD sections. For production deployment,
the deployment script automatically switches to PROD mode.

```bash
cp env.example .env
nano .env
```

**Important:** After editing `.env` with your production values, the deployment script
will automatically switch to PRODUCTION mode. You can also manually switch using:
```bash
./switch-env.sh prod
```

**Required values (in root .env file):**
```env
# Server Configuration
NODE_ENV=production
PORT=3002
HOST=0.0.0.0

# Frontend URLs
FRONTEND_URL=https://aitraining.cloudextel.com
CORS_ORIGIN=https://aitraining.cloudextel.com

# Frontend Build Variables (VITE_ prefix)
VITE_API_URL=https://aitraining.cloudextel.com/api
VITE_BACKEND_URL=https://aitraining.cloudextel.com
VITE_SOCKET_URL=https://aitraining.cloudextel.com

# Security
JWT_SECRET=[32+ character secret]
SESSION_SECRET=[32+ character secret]

# Google OAuth
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
GOOGLE_REDIRECT_URI=https://aitraining.cloudextel.com/auth/google/callback

# Gemini AI
GEMINI_API_KEY=[your-gemini-api-key]
GEMINI_MODEL=gemini-2.0-flash

# Database & Paths
DATABASE_PATH=/var/www/AI_Training/backend/database.sqlite
UPLOAD_PATH=/var/www/AI_Training/backend/uploads

# Email Configuration (for sending reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[your-email@gmail.com]
SMTP_PASS=[your-app-password]
EMAIL_FROM=[your-email@gmail.com]
EMAIL_FROM_NAME=AI Training Team
```

**Note:** 
- All variables are in ONE `.env` file at the project root
- Frontend VITE_ variables are included in the same file
- PM2 automatically loads `.env` from the project root (cwd)
- No need for separate frontend/.env file anymore
- Deployment script automatically switches to PROD mode
- For local development, use: `./switch-env.sh dev`

### 2.4 Deploy Application

**Option A: Automated Script (Recommended)**
```bash
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

**Option B: Manual**
```bash
# Install dependencies
cd backend && npm install --production && cd ..
cd frontend && npm install && npm run build && cd ..

# Setup nginx
chmod +x update-nginx.sh
./update-nginx.sh
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo ln -s /etc/nginx/sites-available/ai-training /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Start application
mkdir -p logs
# PM2 automatically loads .env from the project root (cwd)
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the command it outputs
```

### 2.5 Setup SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d aitraining.cloudextel.com
```

### 2.6 Update Google OAuth
1. Go to https://console.cloud.google.com/
2. Add redirect URI: `https://aitraining.cloudextel.com/auth/google/callback`

---

## 📍 STEP 3: VERIFY DEPLOYMENT

```bash
# Get PORT from .env
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)

# Test backend
curl http://localhost:$PORT/api/health
curl https://aitraining.cloudextel.com/api/health

# Check status
pm2 status
pm2 logs --lines 30
```

---

## 🔄 UPDATING AFTER CODE CHANGES

### Update Version (Optional but Recommended)
Before deploying, update the version number:

```bash
# Edit the VERSION file in project root
nano VERSION
# Change to: 1.0.1 (or your new version)
```

The version will be displayed on the login page (top-right corner) and helps track which code version is deployed.

### Deploy Changes

```bash
# On server
cd /var/www/AI_Training
git pull origin main

# Rebuild if needed
cd frontend && npm run build && cd ..

# Restart
pm2 restart ecosystem.config.js

# Update nginx if PORT changed
./update-nginx.sh
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo nginx -t && sudo systemctl reload nginx
```

---

## ⚠️ TROUBLESHOOTING

### Backend Not Starting
```bash
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
sudo lsof -ti:$PORT | xargs sudo kill -9
pm2 restart all
pm2 logs --err
```

### Nginx Issues
```bash
sudo nginx -t
sudo tail -50 /var/log/nginx/error.log
./update-nginx.sh
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo nginx -t && sudo systemctl reload nginx
```

### Quick Commands
```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart
sudo nginx -t       # Test nginx
```

---

**For quick reference, see [README.md](./README.md)**
