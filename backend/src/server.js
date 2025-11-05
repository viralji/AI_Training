import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import 'express-async-errors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Get current directory (needed for dotenv config)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST, before any other imports that depend on them
dotenv.config({ path: join(__dirname, '../../.env') });

import { initSocket } from './services/socket.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import submissionRoutes from './routes/submissions.js';
import emailRoutes from './routes/emails.js';
import userRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import { assignmentDB } from './db/database.js';
import { config, validateConfig } from './config/index.js';
import { globalErrorHandler } from './utils/errors.js';

// Validate configuration
validateConfig();

const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Security middleware
if (config.security.helmet.contentSecurityPolicy) {
  app.use(helmet(config.security.helmet));
} else {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development for localhost and common development IPs
  // Also respect skip function from config (for health checks)
  skip: (req) => {
    // Use config skip function if provided (for health checks)
    if (config.rateLimit.skip && config.rateLimit.skip(req)) {
      return true;
    }
    // Skip in development for localhost and private IPs
    if (config.server.isDevelopment) {
      const devIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
      return devIPs.includes(req.ip) || req.ip.startsWith('192.168.') || req.ip.startsWith('10.');
    }
    return false;
  }
});
app.use(limiter);

// CORS middleware
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.server.isProduction,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check routes (before other routes)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Also available under /api prefix

// Expose single-source version from root VERSION file
app.get('/api/version', (req, res) => {
  try {
    const versionText = readFileSync(join(process.cwd(), 'VERSION'), 'utf8').trim();
    res.json({ version: versionText });
  } catch (error) {
    res.status(500).json({ version: '', error: 'VERSION file not found' });
  }
});

// Auth routes (without /api prefix for OAuth callbacks)
app.use('/', authRoutes);

// Serve uploaded images
app.use('/uploads', express.static(config.uploads.uploadPath));

// API routes (excluding auth routes to avoid duplication)
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/users', userRoutes);

// API auth routes (for frontend API calls)
app.get('/api/auth/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Serve static files in production (frontend build)
if (config.server.isProduction) {
  app.use(express.static(join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Global error handler (must be last)
app.use(globalErrorHandler);

// Verify assignments are available
const assignments = assignmentDB.getAll();
if (assignments.length === 0) {
  console.log('⚠️  No assignments found. Please ensure assignments are properly seeded.');
}

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

// Log critical environment variables BEFORE server starts
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || '⚠️ NOT SET (using fallback: http://localhost:5173)'}`);
console.log(`🔗 CORS_ORIGIN: ${process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '⚠️ NOT SET'}`);
console.log(`🔐 GOOGLE_REDIRECT_URI: ${process.env.GOOGLE_REDIRECT_URI || '⚠️ NOT SET'}`);

if (config.server.isProduction && !process.env.FRONTEND_URL) {
  console.error('❌ CRITICAL: FRONTEND_URL is not set in production! OAuth redirects will fail!');
}

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${config.server.nodeEnv}`);
  console.log(`🔒 Security: ${config.server.isProduction ? 'Production' : 'Development'}`);
  
  if (config.health.enabled) {
    console.log(`🏥 Health check: http://${HOST}:${PORT}${config.health.path}`);
  }
  
  if (!config.ai.geminiApiKey) {
    console.log('⚠️  GEMINI_API_KEY not set - AI scoring will be disabled');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});