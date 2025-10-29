import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
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

