import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Environment configuration
export const config = {
  // Server configuration
  server: {
    // PORT must be set in .env file - no hardcoded fallback for production
    port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  },

  // Database configuration
  database: {
    path: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
    backupPath: process.env.DATABASE_BACKUP_PATH || path.join(__dirname, '../../backups'),
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
    timeout: parseInt(process.env.DB_TIMEOUT) || 5000
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    sessionSecret: process.env.SESSION_SECRET || 'dev_session_secret_change_in_production',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // File upload configuration
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
    submissionsPath: process.env.SUBMISSIONS_PATH || path.join(__dirname, '../../uploads/submissions')
  },

  // AI/Gemini configuration
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'development' ? 1000 : 100), // Higher limit for development
    message: 'Too many requests from this IP, please try again later.'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    logFile: process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/app.log')
  },

  // Health check configuration
  health: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    path: process.env.HEALTH_CHECK_PATH || '/health',
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000
  },

  // Security configuration
  security: {
    helmet: {
      contentSecurityPolicy: process.env.CSP_ENABLED === 'true',
      hsts: process.env.HSTS_ENABLED === 'true',
      noSniff: true,
      xssFilter: true
    },
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  }
}

// Validation function
export const validateConfig = () => {
  const errors = []

  // PORT is required (must be set in .env file)
  if (!config.server.port || isNaN(config.server.port)) {
    errors.push('PORT environment variable is required and must be a valid number')
  }

  // Required environment variables for production
  if (config.server.isProduction) {
    if (!config.auth.googleClientId) {
      errors.push('GOOGLE_CLIENT_ID is required in production')
    }
    if (!config.auth.googleClientSecret) {
      errors.push('GOOGLE_CLIENT_SECRET is required in production')
    }
    if (config.auth.jwtSecret === 'dev_secret_key_change_in_production') {
      errors.push('JWT_SECRET must be changed from default in production')
    }
    if (config.auth.sessionSecret === 'dev_session_secret_change_in_production') {
      errors.push('SESSION_SECRET must be changed from default in production')
    }
  }

  // Optional but recommended
  if (!config.ai.geminiApiKey) {
    console.warn('⚠️  GEMINI_API_KEY not set - AI scoring will be disabled')
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`)
  }

  return true
}

// Export individual configs for convenience
export const {
  server,
  database,
  auth,
  uploads,
  ai,
  cors,
  rateLimit,
  logging,
  health,
  security
} = config
