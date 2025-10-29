module.exports = {
  apps: [{
    name: 'ai-training-platform',
    script: 'backend/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      JWT_SECRET: process.env.JWT_SECRET,
      SESSION_SECRET: process.env.SESSION_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      FRONTEND_URL: process.env.FRONTEND_URL,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      DATABASE_PATH: '/var/www/ai-training-platform/backend/database.sqlite',
      UPLOAD_PATH: '/var/www/ai-training-platform/backend/uploads',
      LOG_LEVEL: 'info',
      LOG_FILE: 'true',
      LOG_FILE_PATH: '/var/www/ai-training-platform/logs/app.log'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }],

  deploy: {
    production: {
      user: 'root',
      host: process.env.DROPLET_IP,
      ref: 'origin/main',
      repo: 'git@github.com:your-username/ai-training-platform.git',
      path: '/var/www/ai-training-platform',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}
