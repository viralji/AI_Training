import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
// Try multiple paths to ensure we find the .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// If still not found, try from current working directory (might be backend/)
if (!process.env.GOOGLE_CLIENT_ID) {
  dotenv.config({ path: path.join(process.cwd(), '../.env') });
}

// If still not found, try from process.cwd() directly
if (!process.env.GOOGLE_CLIENT_ID) {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

// Construct callback URL from FRONTEND_URL or GOOGLE_REDIRECT_URI
const getCallbackURL = () => {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI
  }
  if (process.env.FRONTEND_URL) {
    return `${process.env.FRONTEND_URL}/auth/google/callback`
  }
  // Development fallback only
  if (process.env.NODE_ENV !== 'production') {
    return `http://localhost:${process.env.PORT || 3002}/auth/google/callback`
  }
  throw new Error('GOOGLE_REDIRECT_URI or FRONTEND_URL must be set in production')
}

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('❌ ERROR: GOOGLE_CLIENT_ID not found in environment variables');
  console.error('   Make sure .env file exists at project root and has GOOGLE_CLIENT_ID set');
  console.error('   Current .env path:', path.join(__dirname, '../../.env'));
  throw new Error('GOOGLE_CLIENT_ID is required but not found in environment variables');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ ERROR: GOOGLE_CLIENT_SECRET not found in environment variables');
  throw new Error('GOOGLE_CLIENT_SECRET is required but not found in environment variables');
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL()
}, (accessToken, refreshToken, profile, done) => {
    // Determine role based on email
    const email = profile.emails[0].value;
    const role = email === process.env.TRAINER_EMAILS ? 'trainer' : 'trainee';
    
    const user = {
        id: profile.id,
        email: email,
        name: profile.displayName,
        picture: profile.photos[0].value,
        role: role
    };
    
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;

