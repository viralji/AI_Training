// PM2 Ecosystem Configuration
// All environment variables are loaded from .env file in the project root
// DO NOT hardcode secrets here - use .env file instead
//
// PM2 automatically loads .env file from the working directory (cwd)
// when you run: pm2 start ecosystem.config.js
// Make sure .env file exists in /var/www/AI_Training/

module.exports = {
  apps: [{
    name: "ai_training_api",
    cwd: "/var/www/AI_Training",
    script: "npm",
    args: "start",
    // All environment variables should be defined in .env file
    // PM2 will automatically load .env from the cwd directory
    // No hardcoded values here for security
  }]
}
