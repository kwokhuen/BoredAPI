// configurations
require('app-module-path').addPath(__dirname);
const {DEV_CONFIG} = require('config/development');
// requiring dependencies
const express = require('express');
const bodyParser = require('body-parser');
// routing
const index = require('src/routes/index');
const events = require('src/routes/events');
const users = require('src/routes/events');

// initialize
var app = express();

// middlewares
app.use(bodyParser.json());

// Routes
app.use('/', index);
app.use('/events', events);
app.use('/users', users);

// start server
app.listen(DEV_CONFIG.PORT, () => {
  console.log(`Server starting on Port ${DEV_CONFIG.PORT}`)
});
