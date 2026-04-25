import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists in DB
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          // Check if email already exists
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value;
            await user.save();
            return done(null, user);
          }

          // Create brand new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value,
            role: 'user',
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};