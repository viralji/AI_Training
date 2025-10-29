# Deployment Guide for Digital Ocean

## 🚀 Complete Deployment Steps

### Step 1: Environment Variables

#### Frontend Environment Variables

Create `frontend/.env` file:
```bash
VITE_API_URL=https://aitraining.cloudextel.com/api
VITE_BACKEND_URL=https://aitraining.cloudextel.com
VITE_SOCKET_URL=https://aitraining.cloudextel.com
```

#### Backend Environment Variables

Create `.env` file in root:
```bash
NODE_ENV=production
PORT=3001

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# IMPORTANT: Set this to your production frontend URL
FRONTEND_URL=https://aitraining.cloudextel.com

# CORS
CORS_ORIGIN=https://aitraining.cloudextel.com

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Trainer Email (optional)
TRAINER_EMAILS=trainer@example.com
```

### Step 2: Build Frontend

**IMPORTANT**: Build the frontend AFTER setting environment variables:

```bash
cd frontend
# Ensure .env file exists with correct values
npm run build
cd ..
```

### Step 3: Server Setup Commands

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Clone repository
git clone https://github.com/viralji/AI_Training.git
cd AI_Training

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Copy environment file and edit it
cp env.production.template .env
nano .env

# Build frontend (with production environment variables)
cd frontend
cp env.example .env  # Or create .env manually
nano .env  # Set production URLs
npm run build
cd ..
```

### Step 4: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/ai-training

# Edit nginx.conf to match your domain
sudo nano /etc/nginx/sites-available/ai-training

# Enable site
sudo ln -s /etc/nginx/sites-available/ai-training /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 5: Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs
```

### Step 6: SSL Certificate (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d aitraining.cloudextel.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔧 Common Issues & Fixes

### Issue: Redirects to localhost after login

**Solution**: Ensure these are set correctly:

1. **Backend `.env`**:
   ```
   FRONTEND_URL=https://aitraining.cloudextel.com
   ```

2. **Frontend `frontend/.env`** (must exist before building):
   ```
   VITE_API_URL=https://aitraining.cloudextel.com/api
   VITE_BACKEND_URL=https://aitraining.cloudextel.com
   ```

3. **Rebuild frontend** after setting environment variables:
   ```bash
   cd frontend
   npm run build
   ```

### Issue: OAuth redirect URI mismatch

Update your Google OAuth settings at https://console.cloud.google.com:

**Authorized redirect URIs**:
- `https://aitraining.cloudextel.com/auth/google/callback`

### Issue: CORS errors

Ensure both are set in backend `.env`:
```
FRONTEND_URL=https://aitraining.cloudextel.com
CORS_ORIGIN=https://aitraining.cloudextel.com
```

## 📋 Verification Checklist

- [ ] Frontend `.env` file created with production URLs
- [ ] Backend `.env` file created with FRONTEND_URL set
- [ ] Frontend built after setting environment variables
- [ ] Google OAuth redirect URI updated
- [ ] Nginx configured correctly
- [ ] PM2 processes running
- [ ] SSL certificate installed
- [ ] Application accessible at https://aitraining.cloudextel.com

## 🎯 Key Points

1. **Environment variables must be set BEFORE building the frontend**
2. **Backend `FRONTEND_URL` must match your production domain**
3. **Google OAuth must have the correct callback URL configured**
4. **All `localhost` references are now replaced with environment variables**

