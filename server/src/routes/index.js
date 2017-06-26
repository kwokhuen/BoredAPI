'use strict';

const express = require('express');
const router = express.Router();

// index route
router.get('/', (req, res, next) => {
  // logic goes here
  return res.status(200).send('Server started.');
});

module.exports = router;
