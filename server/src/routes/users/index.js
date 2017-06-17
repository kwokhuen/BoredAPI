const express = require('express');
const router = express.Router();

router.post('/', (req,res,next) => {
  return res.status(200).send(req.body);
})

module.exports = router;
