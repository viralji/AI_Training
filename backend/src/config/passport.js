import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

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
    return `http://localhost:${process.env.PORT || 3001}/auth/google/callback`
  }
  throw new Error('GOOGLE_REDIRECT_URI or FRONTEND_URL must be set in production')
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

