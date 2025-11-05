# 🐳 Docker Quick Start Guide

**For first-time Docker users** - Deploy your AI Training Platform step-by-step.

---

## 📋 What You Need

1. Digital Ocean Droplet (Ubuntu 22.04+)
2. Domain name (optional)
3. SSH access to server

---

## 🚀 Step-by-Step Deployment

### **STEP 1: Connect to Your Server**

```bash
ssh deploy@your-server-ip
```

---

### **STEP 2: Install Docker (One-time setup)**

Copy and paste these commands one by one:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**Important:** Log out and back in:
```bash
exit
```

Then SSH back:
```bash
ssh deploy@your-server-ip
```

---

### **STEP 3: Get Your Code**

```bash
# Go to web directory
cd /var/www

# Create project folder
sudo mkdir -p AI_Training
sudo chown -R $USER:$USER AI_Training
cd AI_Training

# Clone your code
git clone https://github.com/viralji/AI_Training.git .
```

---

### **STEP 4: Set Up Environment Variables**

```bash
# Copy example file
cp env.example .env

# Edit the file
nano .env
```

**Update these important values:**

```bash
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://your-domain.com

# Generate a strong secret (run this command to generate):
# openssl rand -base64 32
JWT_SECRET=paste-your-generated-secret-here

# Your Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Your email (for trainer access)
TRAINER_EMAILS=your-email@gmail.com

# Gemini API key
GEMINI_API_KEY=your-gemini-key

# Email settings (for sending reports)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### **STEP 5: Create Required Directories**

```bash
# Create directories for database and uploads
mkdir -p backend/uploads
touch backend/database.sqlite
chmod 666 backend/database.sqlite
chmod 755 backend/uploads

# Make sure .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found! Please create it from env.example"
  exit 1
fi
```

---

### **STEP 6: Build and Start Docker Containers**

```bash
# Build the Docker images (takes 5-10 minutes first time)
docker-compose -f docker-compose.prod.yml build

# Start the containers
docker-compose -f docker-compose.prod.yml up -d

# Check if they're running
docker-compose -f docker-compose.prod.yml ps
```

You should see both `backend` and `frontend` containers as "Up".

---

### **STEP 7: Configure Nginx**

```bash
# Copy the nginx config
sudo cp /var/www/AI_Training/nginx-docker.conf /etc/nginx/sites-available/your-domain

# Edit it to use your domain
sudo nano /etc/nginx/sites-available/your-domain
```

**Change:** `your-domain.com` to your actual domain

**Save:** `Ctrl+X`, then `Y`, then `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### **STEP 8: Set Up SSL (HTTPS)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically configure HTTPS.

---

### **STEP 9: Verify Everything Works**

```bash
# Check containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Press `Ctrl+C` to exit logs**

**Test your site:** Open `https://your-domain.com` in browser

---

## ✅ You're Done!

Your application is now running in Docker!

---

## 🔄 Common Commands

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Stop containers
```bash
docker-compose -f docker-compose.prod.yml stop
```

### Start containers
```bash
docker-compose -f docker-compose.prod.yml start
```

### Restart containers
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update after code changes
```bash
cd /var/www/AI_Training
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 Troubleshooting

### Containers won't start?
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Can't access website?
```bash
# Check if containers are running
docker ps

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

### Database issues?
```bash
# Check permissions
ls -la backend/database.sqlite
chmod 666 backend/database.sqlite
```

---

## 📚 Need More Help?

See **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** for detailed documentation.

