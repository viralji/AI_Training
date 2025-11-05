# Docker Configuration

This folder contains all Docker-related configurations for clean, scalable deployment.

## 📁 Structure

```
docker/
├── docker-compose.local.yml   # Local development setup
├── docker-compose.prod.yml    # Production setup
├── .env.local                 # Local environment variables
├── .env.prod                  # Production environment variables
└── README.md                  # This file
```

## 🚀 Quick Start

### Local Development

```bash
cd docker

# Copy example env file
cp .env.local.example .env.local  # If you have an example
# Or create .env.local with your local settings

# Start containers
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Stop containers
docker-compose -f docker-compose.local.yml down
```

### Production Deployment

```bash
cd docker

# Edit production environment variables
nano .env.prod
# Update: FRONTEND_URL, CORS_ORIGIN, JWT_SECRET, SESSION_SECRET, etc.

# Pull latest images from Docker Hub
docker pull viralji/ai-training-backend:latest
docker pull viralji/ai-training-frontend:latest

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## 🎯 Key Benefits

✅ **Clean Separation**: All Docker configs in one place  
✅ **No Code Changes**: Switch between local/prod without editing code  
✅ **Environment Isolation**: Separate `.env` files for each environment  
✅ **Scalable**: Easy to add staging, testing, etc.  
✅ **Standard Practice**: Follows industry best practices

## 🔧 Configuration

### Local Development (`.env.local`)

- Uses `localhost` URLs
- Development mode
- Debug logging enabled
- Local database

### Production (`.env.prod`)

- Uses production domain
- Production mode
- Secure cookies
- Production database

## 📝 Environment Variables

Both `.env.local` and `.env.prod` contain:
- `FRONTEND_URL` - Frontend URL for OAuth redirects
- `CORS_ORIGIN` - CORS allowed origin
- `VITE_API_URL` - Backend API URL (used during frontend build)
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session cookie secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GEMINI_API_KEY` - Gemini API key for AI scoring

## 🔄 Switching Environments

Simply change directory and use the appropriate compose file:

```bash
# Local
cd docker && docker-compose -f docker-compose.local.yml up -d

# Production
cd docker && docker-compose -f docker-compose.prod.yml up -d
```

No code changes needed!

## 🐛 Troubleshooting

### Port conflicts
- Local uses ports `3002` and `8080`
- Production binds to `127.0.0.1` (localhost only)

### Environment variables not loading
- Make sure `.env.local` or `.env.prod` exists in `docker/` folder
- Check file permissions: `chmod 644 docker/.env.prod`

### Images not found (production)
- Make sure images are pushed to Docker Hub
- Run: `docker pull viralji/ai-training-backend:latest`

## 📚 Related Documentation

- `../DOCKER_DEPLOYMENT.md` - Complete deployment guide
- `../DOCKER_DESKTOP_STEPS.md` - Docker Desktop setup
- `../DOCKER_HUB_WORKFLOW.md` - Docker Hub workflow

