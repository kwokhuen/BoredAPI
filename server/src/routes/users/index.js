'use strict';

const express = require('express');
const validator = require('validator');
const router = express.Router();
const mongoose = require('mongoose');
const {User} = require('../../../db/models/User')
const {userInfoValidation} = require('./userInfoValidation')

// param middleware
router.param('userId', function(req, res, next, id){
  // find the user from db based on userId and assign it to req.user
  if(!validator.isMongoId(id)){
    var err = new Error(id+' is not a valid Mongo object id');
    err.status = 404;
    err.name = 'NotFound';
    err.target = 'userId';
    return next(err);
  }
  User.findById(id, function(err, searchResult){
    if(err) return next(err);
    if(!searchResult) {
      var err = new Error('User with ID '+id+' does not exist');
      err.status = 404;
      err.name = 'NotFound';
      err.target = 'userId';
      return next(err);
    } else {
      req.user = searchResult;
      return next();
    }
  });
});

// Routes

// get a user profile
// API GET localhost:3000/users/:userId
router.get('/:userId', (req,res) =>{
  // QUESTION: Can everyone see anyone's profile?
  // if not, need user authentication here as well
  res.json(req.user);
});

// create a new user profile
// API POST localhost:3000/users
router.post('/', (req, res, next) => {
  userInfoValidation(req, next, ()=>{
    //if info valid, create the user
    var user = new User(req.body);
    user.save(function(err, createdUser){
      if(err) return next(err);
      res.status(201).json(createdUser);
    });
  });
});

// update user profile
// API PUT localhost:3000/users/:userId
router.put('/:userId', (req,res, next) => {
  //TODO: insert user authentication code here:

  userInfoValidation(req, next, ()=>{
    //if info valid, modify the user
    User.update({'_id':req.user._id}, {$set:req.body},
      function(err, modifiedUser){
      // error handling
      if(err) return next(err);
      res.status(202).send();
    });
  });
});

// NOTE for frontend convenience
// later may need a route to verify username/email/cell uniqueness
// write a helper method

module.exports = router;
