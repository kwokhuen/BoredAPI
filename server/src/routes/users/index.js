'use strict';

const express = require('express');
const validator = require('validator');
const router = express.Router();
const mongoose = require('mongoose');
const {User} = require('../../../db/models/User')
const {userInfoValidation} = require('./userInfoValidation')
const authenticate = require('./middlewares/authenticate');
const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// param middleware
router.param('userId', function(req, res, next, id){
  // find the user from db based on userId and assign it to res.user
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
      res.user = searchResult;
      return next();
    }
  });
});

// Routes

// ----------<for development use>-----------
// get all users
// API GET localhost:3000/users/dev
router.get('/dev', (req,res) =>{
  User.find({}, function(err, result){
    if(err) return err;
    res.status(200).json(result);
  });
});

// ----------<for development use>-----------
// delete all users
// API DELETE localhost:3000/users/dev
router.delete('/dev', (req,res) =>{
  if(User.collection.drop()){
    res.status(202).send();
  } else {
    res.status(500).send("Error");
  }
  //User.collection.drop(err=>{return err;});
});

// ----------<for development use>-----------
// Create a list of fake users
// API DELETE localhost:3000/users/dev
router.post('/dev', (req,res,next) =>{
  let user1 = new User({
    "username": "ErnManner",
    "displayName": "Ernest Manner",
    "firstName": "Ernestine",
    "lastName": "Manner",
    "age": 20,
    "gender":1,
    "email": "ernest96@gmail.com",
    "profilePic":"https://organicthemes.com/demo/profile/files/2012/12/profile_img.png",
    "password":"1234567890"
  });

  let user2 = new User({
    "username": "DamTouch",
    "displayName": "Damian Touchette",
    "firstName": "Damian",
    "lastName": "Touchette",
    "age": 23,
    "gender":0,
    "email": "touche@yahoo.com",
    "password":"1234567890"
  });

  let user3 = new User({
    "username": "AnOli",
    "displayName": "Andreas Olivieri",
    "firstName": "Andreas",
    "lastName": "Olivieri",
    "age": 19,
    "gender":1,
    "email": "andreas@gmail.com",
    "password":"1234567890"
  });

  let user4 = new User({
    "username": "MarAtt",
    "displayName": "Marlena Atterberry",
    "firstName": "Marlena",
    "lastName": "Atterberry",
    "age": 26,
    "gender":0,
    "email": "marlena@gmail.com",
    "profilePic":"https://assets.entrepreneur.com/content/16x9/822/20150406145944-dos-donts-taking-perfect-linkedin-profile-picture-selfie-mobile-camera-2.jpeg",
    "password":"1234567890"
  });

  let fakeUsers = [user1, user2, user3, user4];
  User.insertMany(fakeUsers).then(()=>{
    res.status(201).json("list of fake users created");
  }).catch(err=>{return next(err);})
});


// ----------------User Collection------------------

// create a new user profile
// API POST localhost:3000/users
router.post('/', (req, res, next) => {
  let userData = _.pick(req.body, ['displayName', 'firstName', 'lastName', 'age', 'gender', 'email', 'username', 'profilePic', 'password']);

  userInfoValidation(userData, next, false, ()=>{
    //if info valid, create the user
    let newUser = new User(userData);
    newUser.save().then(() => {
      return newUser.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).status(201).json(newUser);
    }).catch(err => res.status(400).send(err));
  });
});

// login route
// http://localhost:3000/users/login
router.post('/login', (req,res,next) => {
  let userData = _.pick(req.body, ['username', 'password']);
  User.findByCredential(userData.username, userData.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user);
    })
  }).catch(e => res.status(400).send())
})

// --------------------User-----------------------

// get a user profile
// API GET localhost:3000/users/:userId
router.get('/:userId', authenticate, (req,res,next) =>{
  if (req.user._id.toString() !== req.params.userId) {
    var err = new Error(req.params.userId+' does not match currently logged in user');
    err.status = 404;
    err.name = 'Id Mismatched';
    err.target = 'userId';
    return next(err);
  }
  res.status(200).json(res.user);
});

// update user profile
// API PUT localhost:3000/users/:userId
router.put('/:userId', authenticate, (req,res, next) => {
  if (req.user._id.toString() !== req.params.userId) {
    var err = new Error(req.params.userId+' does not match currently logged in user');
    err.status = 404;
    err.name = 'Id Mismatched';
    err.target = 'userId';
    return next(err);
  }
  let userData = _.pick(req.body, ['displayName', 'firstName', 'lastName', 'age', 'gender', 'email', 'username', 'profilePic', 'password']);

  userInfoValidation(req, next, true, ()=>{
    //if info valid, modify the user
    // unsetFields: fields to unset

    // const unsetFields = {};
    // for(let i in req.body){
    //   if(req.body[i]===null)
    //     unsetFields[i] = null;
    // };
    // // updateFields: fields to update
    // const updateFields = {};
    // for(let i in req.body){
    //   if(req.body[i]!==null)
    //     updateFields[i] = req.body[i];
    // };

    User.update({'_id':res.user._id},
      {$set:updateFields},
      {$unset: unsetFields},
      function(err, modifiedUser){
      // error handling
      if(err) return next(err);
      res.status(202).send();
    });
  });
});

// delete a user profile
// API DELETE localhost:3000/users/:userId
router.delete('/:userId',
  //TODO: insert user authentication middleware:
  // permission: after cell phone verified
  (req, res, next) => {
    //TODO: delete all data associated with that user: events, etc
    res.user.remove(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
});

// NOTE for frontend convenience
// later may need a route to verify username/email/cell uniqueness
// write a helper method

module.exports = router;
