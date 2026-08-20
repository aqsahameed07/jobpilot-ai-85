const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile:', profile);
        
        // Check if user exists
        let user = await User.findOne({ 
          email: profile.emails[0].value 
        });

        if (!user) {
          // Create new user
          user = new User({
            name: profile.displayName || profile.name.givenName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-12) + 'Google@123',
            isVerified: true,
            isDeleted: false,
            googleId: profile.id,
            profileImage: profile.photos[0]?.value || null,
            isGoogleUser: true
          });

          await user.save();
          console.log('✅ New Google user created:', user.email);
        } else {
          // Update existing user
          user.googleId = profile.id;
          user.isVerified = true;
          user.profileImage = profile.photos[0]?.value || user.profileImage;
          user.isGoogleUser = true;
          await user.save();
          console.log('✅ Google user logged in:', user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;