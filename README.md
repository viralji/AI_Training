# AI Literacy Training Platform

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

## 🚀 Quick Start (Docker)

### **Option 1: Use Pre-built Images** (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/viralji/AI_Training.git
cd AI_Training

# 2. Setup environment
cp docker/.env.local.example docker/.env.local
# Edit docker/.env.local with your values

# 3. Start services
cd docker && ./start.sh local

# 4. Access application
open http://localhost:8080
```

### **Option 2: Build From Source**
```bash
# 1. Build images
./build.sh local

# 2. Start services
cd docker && ./start.sh local
```

## 📖 Complete Documentation

- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Complete deployment guide (Local + Production + SSL)
- **[CURSOR_DOCKER_GUIDE.md](./docs/CURSOR_DOCKER_GUIDE.md)** - 🔥 Copy this for your next project
- **[THE_TRUTH_ABOUT_DOCKER_FRONTEND.md](./docs/THE_TRUTH_ABOUT_DOCKER_FRONTEND.md)** - Why frontend needs separate builds
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - File organization & usage

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

2. **Environment Variables:**
   ```bash
   cp env.example .env
   # Set all variables in ONE .env file at root:
   # - Backend: PORT, Google OAuth, Gemini API key, etc.
   # - Frontend: VITE_API_URL, VITE_BACKEND_URL, VITE_SOCKET_URL
   # Vite automatically reads VITE_* variables from root .env
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
├── .env                 # All environment variables (backend + frontend) - gitignored
├── env.example          # Environment template (single source of truth)
├── ecosystem.config.js  # PM2 configuration
├── nginx.conf          # Nginx reverse proxy
└── update-nginx.sh     # Script to sync nginx with PORT
```

## 🔧 Configuration

### Environment Variables (Single `.env` file at root)

**All environment variables are in ONE `.env` file at the project root.**

**Backend Variables:**
- `PORT` - Server port (required, no default)
- `FRONTEND_URL` - Your frontend domain
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `GEMINI_API_KEY` - Gemini API key for AI scoring
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email configuration

**Frontend Variables (VITE_ prefix):**
- `VITE_API_URL` - Backend API URL (e.g., `https://aitraining.cloudextel.com/api`)
- `VITE_BACKEND_URL` - Backend base URL (e.g., `https://aitraining.cloudextel.com`)
- `VITE_SOCKET_URL` - Socket.io URL (optional, defaults to backend URL)

**Note:** Vite automatically reads `VITE_*` variables from the root `.env` file during build.

See `env.example` for complete list of all variables.

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

See **[docs/](./docs/)** folder for complete guides

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
# Switch to PROD mode (if not already)
./switch-env.sh prod
cd frontend && npm run build && cd ..
# PM2 automatically loads .env from project root
pm2 restart ecosystem.config.js
```

## 📄 License

Copyright © 2025

---

For production deployment, see **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**
