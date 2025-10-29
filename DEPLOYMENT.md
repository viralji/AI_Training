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
sudo git clone https://github.com/viralji/AI_Training.git CE_AI_Training
sudo chown -R deploy:deploy CE_AI_Training
cd CE_AI_Training
```

### 2.3 Setup Environment Variables

**Backend `.env`:**
```bash
cp env.example .env
nano .env
```

**Required values:**
```env
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://aitraining.cloudextel.com
CORS_ORIGIN=https://aitraining.cloudextel.com
JWT_SECRET=[32+ character secret]
SESSION_SECRET=[32+ character secret]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
GOOGLE_REDIRECT_URI=https://aitraining.cloudextel.com/auth/google/callback
GEMINI_API_KEY=[your-gemini-api-key]
GEMINI_MODEL=gemini-2.0-flash
DATABASE_PATH=/var/www/CE_AI_Training/backend/database.sqlite
UPLOAD_PATH=/var/www/CE_AI_Training/backend/uploads
```

**Frontend `frontend/.env`:**
```bash
cd frontend
cp env.example .env
nano .env
```

```env
VITE_API_URL=https://aitraining.cloudextel.com/api
VITE_BACKEND_URL=https://aitraining.cloudextel.com
VITE_SOCKET_URL=https://aitraining.cloudextel.com
```

```bash
cd ..
```

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
pm2 start ecosystem.config.js --env production
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

```bash
# On server
cd /var/www/CE_AI_Training
git pull origin main

# Rebuild if needed
cd frontend && npm run build && cd ..

# Restart
pm2 restart ecosystem.config.js --env production

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
