'use strict';

// configurations
require('app-module-path').addPath(__dirname);
const {DEV_CONFIG} = require('config/development');
// requiring dependencies
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
// requiring dev dependencies
const logger = require('morgan');

//seed data
const {db} = require('db/mongoose');
const generateUserSeed = require('db/seed_data/user_seed.js');
const generateEventSeed = require('db/seed_data/event_seed.js');
const generateLocationSeed = require('db/seed_data/location_seed.js');

// routing
const index = require('src/routes/index');
const events = require('src/routes/events');
const users = require('src/routes/users');
const auth = require('src/routes/auth');
const account = require('src/routes/account');
const friendRequests = require('src/routes/friendRequests');
const location = require('src/routes/location');
const developer = require('src/routes/developer');
const utils = require('src/routes/utils_routes');

// initialize
var app = express();

// middlewares
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));

// Routes
app.use('/', index);
app.use('/events', events);
app.use('/users', users);
app.use('/auth', auth);
app.use('/account', account);
app.use('/friendRequests', friendRequests);
app.use('/location', location);
app.use('/dev', developer);
app.use('/utils', utils);

// Error handling

// set status code to 404 when route doesn't match any of the routers above
app.use(function(req, res, next){
  var err = new Error('No handler defined for the route requested.');
  err.status = 404;
  err.name = 'NotFound';
  next(err);
});

// Error handler: (overriding default error handler)
// returns json instead of html by default
// returns 500 if no status code specified
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({
    error:{
      code: err.name,
      target: err.target,
      message: err.message,
      details: err.details
    }
  });
});

// start server
app.listen(DEV_CONFIG.PORT, () => {
  console.log(`Server starting on Port ${DEV_CONFIG.PORT}`)
});

db.once('open',function(){
    console.log('db connection open');
    generateUserSeed(function(){
      console.log("user seed generated")
    });
    generateEventSeed(function(){
      console.log("event seed generated")
    });
    generateLocationSeed(function(){
      console.log("location seed generated")
    });
});
