const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {User} = require('../../../db/models/User')

// User routes

// param middleware
// whenever userId is in param
// find the user from db based on userId and assign it to req.user
router.param('userId', function(req, res, next, id){
  User.findById(id, function(err, searchResult){
    if(err) return next(err);
    if(!searchResult) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    } else {
      req.user = searchResult;
      return next();
    }
  });
});

// get a user profile
// API GET localhost:3000/users/:userId
router.get('/:userId', (req,res) =>{
  res.json(req.user);
});

// create a new user profile
// API POST localhost:3000/users/new
router.post('/new', (req, res, next) => {
  // creating a user constructed based on request's body
  var user = new User(req.body);
  user.save(function(err, createdUser){
    if(err) return next(err);
    res.status(201).json(createdUser);
  });
});

// update user profile
// API PUT localhost:3000/users/:userId
router.put('/:userId', (req,res) => {
  // modify req.user to a new user constructed based on request's body
  req.user = new User(req.body);
  req.user.save(function(err, modifiedUser){
    // error handling
    if(err) return next(err);
    res.status(202).send();
  });
});

module.exports = router;
