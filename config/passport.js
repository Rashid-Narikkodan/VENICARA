//Import passport and google strategy for passport | userSchema Model
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User=require('../models/userSchema')

//create gogleStrategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try{
    let user=await User.findOne({googleId:profile.id});
    if(!user){
      user=await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isVerified:true
      })
    }
    return done(null,user)
  }catch(err){
    return done(err,null)
  }

  }
));

// Serialize user into session-----decides what info to store in session (we store user ID).
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session-------retrieves full user info from session ID when needed.
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});