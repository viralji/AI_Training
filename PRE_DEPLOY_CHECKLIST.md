# ✅ Pre-Deployment Checklist

Use this checklist before pushing to git and deploying to production.

## 🔒 Security

- [x] No hardcoded secrets in code
- [x] All API keys use environment variables
- [x] `.env` files are in `.gitignore`
- [x] `database.sqlite` is in `.gitignore`
- [x] `uploads/` directory is in `.gitignore`
- [x] JWT and session secrets are strong (32+ characters)

## 🔧 Configuration

- [x] No hardcoded ports anywhere
- [x] PORT must be set in `.env` (validated)
- [x] `env.example` file created with all required variables
- [x] `frontend/env.example` created
- [x] Nginx config uses `BACKEND_PORT` placeholder
- [x] `update-nginx.sh` script works

## 📦 Files to Commit

- [x] `env.example` - Environment template
- [x] `frontend/env.example` - Frontend env template
- [x] `.gitignore` - Proper exclusions
- [x] `README.md` - Updated documentation
- [x] `DEPLOY.md` - Deployment guide
- [x] `ecosystem.config.js` - PM2 config
- [x] `nginx.conf` - Nginx template (with BACKEND_PORT)
- [x] `update-nginx.sh` - Nginx update script
- [x] All source code

## 🚫 Files NOT to Commit

- [ ] `.env` files (any directory)
- [ ] `database.sqlite` files
- [ ] `node_modules/` directories
- [ ] `dist/` or `build/` directories
- [ ] `uploads/` directories
- [ ] `logs/` directories
- [ ] Temporary documentation files (if any)

## ✅ Code Quality

- [x] Error handling improved with detailed messages
- [x] Backend logs include context
- [x] Frontend shows detailed error messages
- [x] All routes properly authenticated
- [x] CORS configured correctly
- [x] Rate limiting enabled

## 📝 Documentation

- [x] `README.md` updated
- [x] `DEPLOY.md` created
- [x] `env.example` documented
- [x] Environment variables explained

## 🧪 Testing (After Deployment)

- [ ] Login works
- [ ] Assignment can be started
- [ ] Assignment shows detailed error if fails
- [ ] Submissions work
- [ ] AI scoring works
- [ ] Socket.io real-time updates work
- [ ] Trainer and Trainee dashboards work
- [ ] Nginx proxies correctly

## 🚀 Deployment Commands (After Git Push)

```bash
# On Digital Ocean server:
cd /var/www
git clone https://github.com/viralji/AI_Training.git CE_AI_Training
cd CE_AI_Training

# Setup environment
cp env.example .env
# Edit .env with production values

# Build frontend
cd frontend
cp env.example .env
# Edit frontend/.env
npm install && npm run build
cd ..

# Setup backend
cd backend
npm install --production
cd ..

# Update nginx
chmod +x update-nginx.sh
./update-nginx.sh
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo nginx -t && sudo systemctl reload nginx

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

## 📌 Important Notes

1. **PORT must be set in `.env`** - App will fail to start without it
2. **Frontend must be rebuilt** after setting `frontend/.env`
3. **Nginx config updated** using `./update-nginx.sh`
4. **Google OAuth redirect URI** must match your domain
5. **All secrets in `.env`** - Never commit `.env` files

## 🔍 Verification Commands

```bash
# Check PORT is set
grep "^PORT=" .env

# Check backend health
curl http://localhost:$(grep "^PORT=" .env | cut -d'=' -f2)/api/health

# Check PM2 status
pm2 status
pm2 logs --lines 50

# Check nginx
sudo nginx -t
curl https://aitraining.cloudextel.com/api/health
```

---

**Ready to deploy?** Follow [DEPLOY.md](./DEPLOY.md) for complete instructions.

