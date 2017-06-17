const express = require('express');
const router = express.Router();
const {url} = require('config/development');

// Event Routes go here
router.post('/', (req, res, next) => {
  return res.status(200).send(req.body);
})

module.exports = router;
