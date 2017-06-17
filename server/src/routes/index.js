const express = require('express');
const router = express.Router();

// index route
router.get('/', (req, res, next) => {
  // logic goes here
  return res.status(200).send('Server started.');
});

// auth testing routes
router.get('/success', (req,res,next) => {
  return res.status(200).send('Logged in success');
});

router.get('/failure', (req,res,next) => {
  return res.status(404).send('Logged in failed');
});

module.exports = router;
