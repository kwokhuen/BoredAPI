'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('db/models/User');
const {userInfoValidation} = require('./userInfoValidation');
const authenticate = require('../middlewares/authenticate');

const {
  grantSelf,
  checkPermission,
  checkNotBlockedByUser,
  checkSelf,
  checkNotSelf} = require('../middlewares/permission');

const { userIdParam } = require('../middlewares/param');

// param middleware
// whenever userId is in param
// find the user from db based on userId and assign it to res.userId_user
router.param('userId', userIdParam);

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
    res.status(500).json("Error");
  }
});

// ----------<for development use>-----------
// Create a list of fake users
// API DELETE localhost:3000/users/dev
router.post('/dev', (req,res,next) =>{
  let user1 = new User({
    "_id": "596ae5deddaa262f7586e8db",
    "username": "MarAtt",
    "displayName": "MarAtt",
    "firstName": "Marlena",
    "lastName": "Atterberry",
    "age": 23,
    "gender": 1,
    "email": "chiang@gmail.com",
    "password": "$2a$10$RRIXfLd9fbPO4/SqKHnS7.i7Y0kE8sTpVD8/RZGF5B.bw17XztUuq",
    "__v": 10,
    "blocked_users": [],
    "friend_requests": [],
    "friends": [],
    "tokens": [
        {
            "access": "auth",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZhZTVkZWRkYWEyNjJmNzU4NmU4ZGIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAwMTc3ODg3fQ.mnilz-agOiLhBF8g4k24lN9x9AXNoHpB_KyZ8-fUNNo",
            "_id": "596ae5dfddaa262f7586e8dc"
        }
    ]
  });

  let user2 = new User({
    "_id": "596ae629ddaa262f7586e8dd",
    "username": "AnOli",
    "displayName": "Andreas Olivieri",
    "firstName": "Andreas",
    "lastName": "Olivieri",
    "age": 20,
    "gender": 1,
    "email": "andreas@mail.com",
    "password": "$2a$10$tyH3NIxy0Jfmgpj5FqtzXeDPULYyBB3J3NuyUTRqaKBjJlHvHZKYe",
    "__v": 8,
    "blocked_users": [],
    "friend_requests": [],
    "friends": [],
    "tokens": [
        {
            "access": "auth",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZhZTYyOWRkYWEyNjJmNzU4NmU4ZGQiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAwMTc3OTYxfQ.HuHGYekrhbmXxV2dkm2IooRFhSC20apT4bwr5GF7VyY",
            "_id": "596ae629ddaa262f7586e8de"
        }
    ]
  });

  let fakeUsers = [user1, user2];
  User.insertMany(fakeUsers).then(()=>{
    res.status(201).json("list of fake users created");
  }).catch(err=>{return next(err);})
});


// ----------------User Collection------------------

// create a new user profile
// API POST localhost:3000/users
// permission: all users
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

// --------------------User-----------------------

// get a user profile
// API GET localhost:3000/users/:userId
// permission: all logged-in users
router.get('/:userId', authenticate,
 (req,res,next) =>{
   //self
   if(req.user.equals(res.userId_user))
     res.status(200).json(res.userId_user);
   //friend
   else if(req.user.isFriendWith(res.userId_user)){
     let result = _.pick(res.userId_user, ['displayName', 'firstName', 'lastName', 'gender', 'username', 'profilePic']);
     res.status(200).json(result);
   } //blocked by userId_user
   else if(res.userId_user.hasBlocked(req.user)){
     let result = _.pick(res.userId_user, ['username']);
     res.status(200).json(result);
   } //has blocked userId_user
   else if(req.user.hasBlocked(res.userId_user)){
     let result = _.pick(res.userId_user, ['username']);
     res.status(200).json(result);
   }
   //everyone else
   else {
     let result = _.pick(res.userId_user, ['displayName', 'firstName', 'lastName', 'gender', 'username', 'profilePic']);
     res.status(200).json(result);
   }
  }
);

// update user profile
// API PUT localhost:3000/users/:userId
// permission: userId_user
router.put('/:userId', authenticate, checkSelf,
  (req,res, next) => {
    let userData = _.pick(req.body, ['displayName', 'firstName', 'lastName', 'age', 'gender', 'email', 'username', 'profilePic', 'password']);
    //check if request info validity
    userInfoValidation(userData, next, true, ()=>{
      for(let i in userData){
        //update user info
        if(userData[i]!==null)
          req.user.set(i,userData[i]);
        else { //unset fields if they are null
          req.user.set(i,undefined);
        }
      };
      req.user.save(function(err){
        if(err) return next(err);
        res.status(202).send();
      });
    });
  }
);

// --------------------User login/logout-----------------------

// login route
// API POST localhost:3000/users/login
// permission: all users
router.post('/login', (req,res,next) => {
  let userData = _.pick(req.body, ['username', 'password']);
  User.findByCredential(userData.username, userData.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.status(200).header('x-auth', token).send(user);
    })
  }).catch(e => res.status(400).send())
});

// logout route
// API DELETE localhost:3000/users/logout
// permission: all logged-in users
router.delete('/logout', authenticate, (req,res,next) => {
  let user = req.user;
  let token = req.token;
  user.removeToken(token).then(() => res.status(200).send(), () => res.status(400).send());
});

//---------------friends routes----------------------

// Send friend request
// API POST localhost:3000/users/:userId/friendRequest
// permission: all logged-in users
router.post('/:userId/friendRequest', authenticate,
  checkNotSelf, checkNotBlockedByUser, (req, res, next) => {
  //check if userId_user is not friend
  if(res.userId_user.isFriendWith(req.user)){
    let err = new Error('Cannot send friend request to a friend.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'friendRequest';
    return next(err);
  }
  //check if friend request has not been sent already
  if(req.user.hasSentFriendRequestTo(res.userId_user)){
    let err = new Error('Friend request was already sent.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'friendRequest';
    return next(err);
  }
  //check if res.userId_user did not send friend request
  if(res.userId_user.hasSentFriendRequestTo(req.user)){
    let err = new Error('User ' + req.params.userId +' already sent you a friend request. Accept it or ignore it.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'friendRequest';
    return next(err);
  }
  // register req.user to userId_user's friend_requests list
  res.userId_user.friend_requests.push(req.user);
  res.userId_user.save(function(err){
    if(err) return next(err);
    res.status(202).send();
  });
});

// Cancel friend request
// API DELETE localhost:3000/users/:userId/friendRequest
// permission: all logged-in users
router.delete('/:userId/friendRequest', authenticate, (req, res, next) => {
  //check if friend request is sent
  if(!req.user.hasSentFriendRequestTo(res.userId_user)){
    let err = new Error('No friend request was sent.');
    err.status = 409;
    err.name = 'NotFound';
    err.target = 'friendRequest';
    return next(err);
  }
  // remove req.user from userId_user's friend_requests list
  res.userId_user.friend_requests.pull(req.user._id);
  res.userId_user.save(function(err){
    if(err) return next(err);
    res.status(202).send();
  });
});

// Ignore friend request
// API POST localhost:3000/users/:userId/ignoreRequest
// permission: all logged-in users
router.post('/:userId/ignoreRequest', authenticate, (req, res, next) => {
  //check if friend request is received
  if(!res.userId_user.hasSentFriendRequestTo(req.user)){
    let err = new Error('No friend request was received.');
    err.status = 409;
    err.name = 'NotFound';
    err.target = 'friendRequest';
    return next(err);
  }
  // remove req.user from userId_user's friend_requests list
  req.user.friend_requests.pull(res.userId_user._id);
  req.user.save(function(err){
    if(err) return next(err);
    res.status(202).send();
  });
});

// show friend list of a user
// API GET localhost:3000/users/:userId/friends
// permission: everyone except blocked users
router.get('/:userId/friends', authenticate, checkNotBlockedByUser, (req, res, next) => {
  User.findOne({ _id: req.params.userId}).populate('friends').exec(function(err,user){
    if(err) return next(err);
    let friend_list = user.friends.toObject();
    let result = [];
    for (let i in friend_list){
      result.push(_.pick(friend_list[i],['_id','displayName', 'firstName', 'lastName', 'age', 'username']));
    }
    res.status(200).json(result);
  })
});

// Confirm friend request
// API POST localhost:3000/users/:userId/friends
// permission: all logged-in users
router.post('/:userId/friends', authenticate, (req, res, next) => {
  //check if friend request is received
  if(!res.userId_user.hasSentFriendRequestTo(req.user)){
    let err = new Error('No friend request was received.');
    err.status = 409;
    err.name = 'NotFound';
    err.target = 'friendRequest';
    return next(err);
  }
  req.user.friend_requests.pull(res.userId_user._id);
  req.user.friends.push(res.userId_user);
  req.user.save(function(err){
    if(err) return next(err);
    res.userId_user.friends.push(req.user);
    res.userId_user.save(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
  });
});

// Unfriend a friend
// API DELETE localhost:3000/users/:userId/friends
// permission: all logged-in users
// remove req.user from userId_user's friend_requests list
router.delete('/:userId/friends', authenticate, (req, res, next) => {
  //check if userId_user is friend
  if(!res.userId_user.isFriendWith(req.user)){
    let err = new Error('User ' + req.params.userId + ' is not a friend.');
    err.status = 409;
    err.name = 'NotFound';
    err.target = 'friend';
    return next(err);
  }
  req.user.friends.pull(res.userId_user._id);
  res.userId_user.friends.pull(req.user._id);
  req.user.save(function(err){
    if(err) return next(err);
    res.userId_user.save(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
  });
});

//-----------------block users routes----------------------
// show blocked users
// API GET localhost:3000/users/:userId/block
// permission: self
router.get('/:userId/block', authenticate, checkSelf, (req, res, next) => {
  User.findOne({ _id: req.params.userId}).populate('blocked_users').exec(function(err,user){
    if(err) return next(err);
    let blocked_list = user.blocked_users.toObject();
    let result = [];
    for (let i in blocked_list){
      result.push(_.pick(blocked_list[i],['_id','displayName', 'firstName', 'lastName', 'age', 'username']));
    }
    res.status(200).json(result);
  })
});

// Block a user
// API POST localhost:3000/users/:userId/block
// permission: all logged-in users
router.post('/:userId/block', authenticate, checkNotSelf, checkNotBlockedByUser,
  (req, res, next) => {
  //check if userId_user has not been blocked
  if(req.user.hasBlocked(res.userId_user)){
    let err = new Error('You have blocked the user already.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'block';
    return next(err);
  }
  //remove userId_user from friend list if friended
  if(req.user.isFriendWith(res.userId_user)){
    req.user.friends.pull(res.userId_user._id);
    res.userId_user.friends.pull(req.user._id);
  }
  //remove friend request if received
  if(res.userId_user.hasSentFriendRequestTo(req.user)){
    req.user.friend_requests.pull(res.userId_user._id);
  }
  //remove friend request if sent
  if(req.user.hasSentFriendRequestTo(res.userId_user)){
    res.userId_user.friend_requests.pull(req.user._id);
  }
  //block userId_user
  req.user.blocked_users.push(res.userId_user);
  //save change to database
  req.user.save(function(err){
    if(err) return next(err);
    res.userId_user.save(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
  });
});

// Unblock a user
// API POST localhost:3000/users/:userId/block
// permission: all logged-in users
router.delete('/:userId/block', authenticate, (req, res, next) => {
  //check if userId_user has not been blocked
  if(!req.user.hasBlocked(res.userId_user)){
    let err = new Error('You did not block User ' + req.params.userId + ' .');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'block';
    return next(err);
  }
  //remove userId_user from blocked list
  req.user.blocked_users.pull(res.userId_user._id);
  //save change to database
  req.user.save(function(err){
    if(err) return next(err);
    res.status(202).send();
  });
});

// // delete a user profile
// // API DELETE localhost:3000/users/:userId
// router.delete('/:userId',
//   //TODO: insert user authentication middleware:
//   (req, res, next) => {
//     //TODO: delete all data associated with that user: events, etc
//     res.userId_user.remove(function(err){
//       if(err) return next(err);
//       res.status(202).send();
//     });
// });

// NOTE for frontend convenience
// later may need a route to verify username/email/cell uniqueness
// write a helper method

module.exports = router;
