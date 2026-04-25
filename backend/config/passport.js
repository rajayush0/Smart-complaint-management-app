import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
          user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          });
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));
