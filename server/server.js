// configurations
require('app-module-path').addPath(__dirname);
const {DEV_CONFIG} = require('config/development');
// requiring dependencies
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
// dev dependencies
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

// start server
app.listen(DEV_CONFIG.PORT, () => {
  console.log(`Server starting on Port ${DEV_CONFIG.PORT}`)
});
