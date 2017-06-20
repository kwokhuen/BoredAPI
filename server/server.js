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
// routing
const index = require('src/routes/index');
const events = require('src/routes/events');
const users = require('src/routes/users');
const auth = require('src/routes/auth');

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

// Error handling

// set status code to 404 when route doesn't match any of the routers above
app.use(function(req, res, next){
  var err = new Error('Not found.');
  err.status = 404;
  next(err);
});

// Error handler: (overwriting default error handler)
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
