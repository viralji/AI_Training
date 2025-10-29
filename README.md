# CloudExtel AI Literacy Training Platform

Live training platform with real-time assignments, Socket.io synchronization, and role-based access.

## Features

- Real-time assignment synchronization via Socket.io
- Timer-based submissions with persistence
- Trainer/trainee role separation (viralji@gmail.com = trainer)
- Dynamic URL navigation with React Router
- Responsive professional UI with dark theme
- Google OAuth authentication (ready to implement)

## Local Development

### Prerequisites
- Node.js 20.x
- npm

### Setup

1. Install dependencies:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

2. Configure environment variables

Create `backend/.env`:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./backend/training.db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
TRAINER_EMAIL=viralji@gmail.com
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

3. Start the application:

```bash
# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

4. Access the application:
- Open http://localhost:5173
- Login with viralji@gmail.com (trainer) or any other email (trainee)

## Digital Ocean Deployment

### Quick Deployment (One-Click)

```bash
# On a fresh Ubuntu 22.04 droplet
curl -sL https://raw.githubusercontent.com/YOUR_REPO/main/deploy-digital-ocean.sh | sudo bash
```

### Manual Deployment

1. **Update system and install dependencies:**
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

2. **Clone and setup repository:**
```bash
git clone YOUR_REPO_URL /var/www/ai-training
cd /var/www/ai-training
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

3. **Build frontend:**
```bash
cd frontend && npm run build && cd ..
```

4. **Configure environment:**
```bash
cat > backend/.env <<EOF
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://$(curl -s ifconfig.me)
DATABASE_PATH=/var/www/ai-training/backend/training.db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=$(openssl rand -base64 32)
TRAINER_EMAIL=viralji@gmail.com
EOF
```

5. **Configure Nginx:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/ai-training
sudo ln -sf /etc/nginx/sites-available/ai-training /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

6. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

7. **Configure firewall:**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

8. **Access your application:**
```bash
echo "Access at: http://$(curl -s ifconfig.me)"
```

### SSL Certificate (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Google OAuth Configuration

In Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - For local: `http://localhost:3000/auth/google/callback`
   - For production: `http://YOUR_DROPLET_IP/auth/google/callback`
   - With domain: `https://YOUR_DOMAIN/auth/google/callback`

### Post-Deployment Commands

```bash
# Check logs
pm2 logs

# Restart application
pm2 restart all

# Monitor resources
pm2 monit

# View status
pm2 status
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.js          # Main server
│   │   ├── services/
│   │   │   └── socket.js      # Socket.io configuration
│   │   ├── routes/            # API routes
│   │   └── db/                # SQLite database
│   └── .env                   # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── data/              # Slide content
│   │   └── utils/             # Utility functions
│   └── .env                   # Frontend environment variables
├── ecosystem.config.js        # PM2 configuration
├── nginx.conf                  # Nginx configuration
└── deploy-digital-ocean.sh    # Deployment script
```

## Architecture

- **Frontend**: React with Vite, React Router for navigation
- **Backend**: Express.js with Socket.io for real-time updates
- **Database**: SQLite for data persistence
- **Authentication**: Google OAuth (ready to implement)
- **Deployment**: Digital Ocean droplet with PM2 and Nginx

## Features in Detail

### Real-time Assignment System
- Trainer can start assignments for all trainees simultaneously
- Individual timers for each trainee
- Live submission tracking
- Submissions persist across page refreshes

### Role-Based Access
- Trainer (viralji@gmail.com): Full control, can start assignments, view submissions
- Trainee (other emails): Submit assignments, view slides

### Dynamic Navigation
- URL reflects current chapter/slide
- Direct links to specific content
- Back/forward browser navigation support

## Troubleshooting

### Local Development
- Ensure both backend and frontend are running
- Check that ports 3000 and 5173 are not in use
- Verify `.env` files are properly configured

### Production Deployment
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs ai-training-backend`
- Check Nginx: `sudo nginx -t`
- Verify firewall: `sudo ufw status`

## License

Proprietary - CloudExtel Internal Use
