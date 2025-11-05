# Production Deployment on Digital Ocean

## Prerequisites
- Digital Ocean droplet with Docker installed
- Domain configured: `aitraining.clickk.cloud`
- SSH access to the server
- Git repository access

## Step-by-Step Deployment

### 1. SSH into Your Digital Ocean Server
```bash
ssh root@your-server-ip
# OR
ssh deploy@your-server-ip
```

### 2. Install Docker and Docker Compose (if not already installed)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 3. Clone/Pull the Repository
```bash
# Clone the repository (first time)
git clone https://github.com/viralji/AI_Training.git
cd AI_Training

# OR if already cloned, pull latest
cd AI_Training
git pull origin main
```

### 4. Navigate to Docker Folder
```bash
cd docker
```

### 5. Configure Production Environment
```bash
# Copy example file if .env.prod doesn't exist
cp .env.prod.example .env.prod

# Edit production environment file
nano .env.prod
# OR
vi .env.prod
```

**Important: Verify these settings in `docker/.env.prod`:**
- `FRONTEND_URL=http://aitraining.clickk.cloud`
- `CORS_ORIGIN=http://aitraining.clickk.cloud`
- `GOOGLE_REDIRECT_URI=http://aitraining.clickk.cloud/auth/google/callback`
- `JWT_SECRET` - Set a strong secret
- `SESSION_SECRET` - Set a strong secret
- `GEMINI_API_KEY` - Your API key
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth secret
- `TRAINER_EMAILS` - Your trainer email(s)
- `SMTP_*` variables if email is needed

### 6. Create Required Directories
```bash
# Create directories for database and uploads
mkdir -p ../backend/uploads
mkdir -p ../backend/logs
touch ../backend/database.sqlite
chmod 666 ../backend/database.sqlite
```

### 7. Start Production Containers
```bash
# Pull latest images and start containers
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 8. Verify Containers Are Running
```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 9. Configure Nginx (if using reverse proxy)
```bash
# Install Nginx
apt-get install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/aitraining
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name aitraining.clickk.cloud;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/aitraining /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 10. Configure SSL (Optional but Recommended)
```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d aitraining.clickk.cloud

# Auto-renewal is set up automatically
```

**After SSL, update `docker/.env.prod`:**
- Change `FRONTEND_URL` from `http://` to `https://`
- Change `CORS_ORIGIN` from `http://` to `https://`
- Change `GOOGLE_REDIRECT_URI` from `http://` to `https://`
- Restart containers: `docker compose -f docker-compose.prod.yml restart`

### 11. Update Google OAuth Redirect URI
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI: `http://aitraining.clickk.cloud/auth/google/callback`
5. (If using SSL, add: `https://aitraining.clickk.cloud/auth/google/callback`)

### 12. Verify Everything Works
```bash
# Check backend health
curl http://localhost:3002/api/health

# Check frontend
curl http://localhost:80

# Check from outside (if domain is configured)
curl http://aitraining.clickk.cloud
```

## Useful Commands

### View Logs
```bash
cd docker
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Containers
```bash
cd docker
docker compose -f docker-compose.prod.yml restart
```

### Stop Containers
```bash
cd docker
docker compose -f docker-compose.prod.yml down
```

### Update and Redeploy
```bash
cd AI_Training
git pull origin main
cd docker
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Check Container Status
```bash
cd docker
docker compose -f docker-compose.prod.yml ps
```

## Troubleshooting

### Containers not starting
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check if ports are in use
netstat -tulpn | grep :3002
netstat -tulpn | grep :80
```

### Database issues
```bash
# Check database file permissions
ls -la ../backend/database.sqlite

# Recreate if needed
rm ../backend/database.sqlite
touch ../backend/database.sqlite
chmod 666 ../backend/database.sqlite
docker compose -f docker-compose.prod.yml restart backend
```

### Environment variables not loading
```bash
# Verify .env.prod file
cat docker/.env.prod

# Check if file is in correct location
ls -la docker/.env.prod
```

## Auto-start on Reboot
```bash
# Create systemd service (optional)
nano /etc/systemd/system/ai-training.service
```

```ini
[Unit]
Description=AI Training Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/AI_Training/docker
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
systemctl enable ai-training.service
systemctl start ai-training.service
```

