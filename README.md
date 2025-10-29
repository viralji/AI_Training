# CloudExtel AI Literacy Training Platform

Production-ready AI training platform with real-time assignments, AI-powered scoring, and role-based access control.

## ✨ Features

- 🎯 **Real-time Assignment Management** - Socket.io synchronization
- ⏱️ **Timer-based Submissions** - Configurable time limits per assignment
- 👥 **Role-based Access** - Trainer and Trainee dashboards
- 🤖 **AI-powered Scoring** - Gemini API integration for automatic assignment evaluation
- 📊 **Live Dashboard** - Real-time submission tracking and scoring
- 🔐 **Google OAuth** - Secure authentication
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI** - Professional dark theme

## 🚀 Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete production deployment guide (Local → Git → Digital Ocean).

### Key Steps:

1. **Clone repository**
   ```bash
   git clone https://github.com/viralji/AI_Training.git
   cd AI_Training
   ```

2. **Set environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your values (PORT, FRONTEND_URL, API keys, etc.)
   ```

3. **Build frontend**
   ```bash
   cd frontend
   cp env.example .env
   # Edit frontend/.env
   npm install && npm run build
   ```

4. **Deploy**
   ```bash
   # See DEPLOY.md for complete instructions
   ```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

2. **Backend Environment:**
   ```bash
   cp env.example .env
   # Set PORT (default: 3001), Google OAuth, Gemini API key, etc.
   ```

3. **Frontend Environment:**
   ```bash
   cd frontend
   cp env.example .env
   # Set VITE_API_URL, VITE_BACKEND_URL
   ```

4. **Start Development Servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## 📁 Project Structure

```
AI_Training/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Socket.io, Gemini AI
│   │   ├── db/          # Database (SQLite)
│   │   └── config/      # Configuration
│   └── package.json
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── pages/       # Trainer/Trainee dashboards
│   │   ├── components/  # Slide renderer, sidebar
│   │   ├── data/        # Slide content
│   │   └── utils/       # Config helpers
│   └── package.json
├── .env                 # Backend environment (gitignored)
├── env.example          # Environment template
├── ecosystem.config.js  # PM2 configuration
├── nginx.conf          # Nginx reverse proxy
└── update-nginx.sh     # Script to sync nginx with PORT
```

## 🔧 Configuration

### Environment Variables (Backend - `.env`)

**Required:**
- `PORT` - Server port (no default, must be set)
- `FRONTEND_URL` - Your frontend domain
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `GEMINI_API_KEY` - Gemini API key for AI scoring

See `env.example` for complete list.

### Environment Variables (Frontend - `frontend/.env`)

**Required:**
- `VITE_API_URL` - Backend API URL (e.g., `https://aitraining.cloudextel.com/api`)
- `VITE_BACKEND_URL` - Backend base URL (e.g., `https://aitraining.cloudextel.com`)

See `frontend/env.example` for details.

## 📝 Important Notes

### Port Configuration
- ✅ **No hardcoded ports** - All ports come from `.env`
- ✅ **PORT is required** - Application will fail to start without it
- ✅ **Nginx sync** - Run `./update-nginx.sh` to sync nginx.conf with PORT

### Security
- ✅ **Never commit `.env` files**
- ✅ **All secrets in environment variables**
- ✅ **JWT and session secrets must be strong (32+ characters)**

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.com/auth/google/callback`
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

## 📚 Documentation

- **[DEPLOY.md](./DEPLOY.md)** - Complete production deployment guide
- **[NO_HARDCODED_PORTS.md](./NO_HARDCODED_PORTS.md)** - Port configuration details
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Digital Ocean setup

## 🐛 Troubleshooting

### "Failed to start assignment"
- Check backend logs: `pm2 logs`
- Verify PORT is set in `.env`
- Check nginx configuration matches PORT
- See detailed error messages in browser console

### Port conflicts
```bash
# Find and kill process using port
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
sudo lsof -ti:$PORT | xargs sudo kill -9
```

### Nginx not proxying
```bash
# Update nginx.conf from .env
./update-nginx.sh
sudo nginx -t && sudo systemctl reload nginx
```

## 🔄 Updating

```bash
git pull
cd frontend && npm run build && cd ..
pm2 restart ecosystem.config.js --env production
```

## 📄 License

Copyright © CloudExtel 2025

---

For production deployment, see **[DEPLOY.md](./DEPLOY.md)**
