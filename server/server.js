// requiring dependencies
const express = require('express');
const bodyParser = require('body-parser');
const index = require('./src/routes/index');

// initialize
var app = express();

// middlewares
app.use(bodyParser.json());

// Routes
app.use('/', index);

// start server
app.listen(3000, () => {
  console.log('Started on port 3000')
});
