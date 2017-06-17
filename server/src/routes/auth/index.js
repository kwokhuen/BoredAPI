// routing
const express = require('express');
const router = express.Router();
// authentication dependency
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
// facebook client variables
const {facebookAuth} = require('config/auth');
const {User} = require('db/models/User');

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// config
passport.use(new FacebookStrategy({
  clientID: facebookAuth.clientID,
  clientSecret: facebookAuth.clientSecret,
  callbackURL: facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'facebook.id': profile.id})
    .then(user => {
      if (!user) {
        let newUser = new User({
          facebook: {
            id: profile.id,
            token: accessToken
          },
          displayName: profile.displayName
        });
        newUser.save().then(user => {
          return done(null, user)
        }, err => {
          throw new Error('Can\'t save user', err);
        })
      } else {
        return done(null, user);
      }
    }, err => {
      throw new Error('Fetch error', err);
    })
  }
));

// routing for facebook authentication
router.get('/facebook',
  passport.authenticate('facebook'),
  function(req, res){}
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/failure'}),
  function(req, res) {
    res.redirect('/success');
});

module.exports = router;
