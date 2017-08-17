'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {PERMISSION_SETTINGS_USER} = require('config/constants');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');

const {userInfoValidation} = require('src/utils/userInfoValidation');
const authenticate = require('src/middlewares/authenticate');

const {userInfoDetail} = require('src/utils/userInfoDetail');
const {eventInfoDetail} = require('src/utils/eventInfoDetail');

const {
  checkNotBlockedByUser,
  checkIsFriendWith,
  checkDidNotBlock,
  checkDidNotRateUser,
  checkNotSelf} = require('src/middlewares/permission');

const { userIdParam } = require('src/middlewares/param');

// param middleware
// whenever userId is in param
// find the user from db based on userId and assign it to res.userId_user
router.param('userId', userIdParam);

//-------------------Routes-----------------------

//--------------get info-----------------

// get a user profile
// API GET localhost:3000/users/:userId
// permission: all logged-in users
router.get('/:userId', authenticate, (req,res,next) =>{
  // redirect to acount page if userId_user is self
  if(req.user.equals(res.userId_user))
    return res.redirect('/account');

  let result = {};

   //friend
   if(req.user.isFriendWith(res.userId_user)){
     result = userInfoDetail(req.user, res.userId_user, PERMISSION_SETTINGS_USER.FRIENDS);
   } //blocked by userId_user
   else if(res.userId_user.hasBlocked(req.user)){
      result = userInfoDetail(req.user, res.userId_user, PERMISSION_SETTINGS_USER.BLOCKED_USERS);
   } //has blocked userId_user
   else if(req.user.hasBlocked(res.userId_user)){
      result = userInfoDetail(req.user, res.userId_user, PERMISSION_SETTINGS_USER.BLOCKED_USERS);
   }
   //everyone else
   else {
      result = userInfoDetail(req.user, res.userId_user, PERMISSION_SETTINGS_USER.USERS);
   }
   res.status(200).json(result);
});

// see userId_user's friendlist
// API GET localhost:3000/users/:userId/friendList
// permission: userId_user's friends
router.get('/:userId/friendList', authenticate, (req, res, next) => {
  // redirect to account friend list page if userId_user is self
  if(req.user.equals(res.userId_user))
    return res.redirect('/account/friendList');

  // check if user is userId_user's friend
  if(!res.userId_user.isFriendWith(req.user)){
    let err = new Error('User is not authurized for this action.');
    err.status = 401;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }

  let friend_list = res.userId_user.friends.toObject();
  let result = [];
  User.find({'_id': {$in:friend_list}}, function(err, friends){
    let result = [];
    for(let index in friends){
      let the_user_info = {};

      if(!friends[index].hasBlocked(req.user))
        the_user_info = userInfoDetail(req.user, friends[index], PERMISSION_SETTINGS_USER.LIST);
      else
        the_user_info = userInfoDetail(req.user, friends[index], PERMISSION_SETTINGS_USER.BLOCKED_USERS);

      result.push(the_user_info);
    }
    res.status(200).json(result);
  });
});

// see userId_user's attended_events
// API GET localhost:3000/users/:userId/attended_events
// permission: userId_user's friend
router.get('/:userId/attended_events', authenticate, (req, res, next) => {
  // redirect to account friend list page if userId_user is self
  if(req.user.equals(res.userId_user))
    return res.redirect('/account/friendList');

  // check if user is userId_user's friend
  if(!res.userId_user.isFriendWith(req.user)){
    let err = new Error('User is not authurized for this action.');
    err.status = 401;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }

  let event_list = res.userId_user.attended_events.toObject();
  let result = [];
  Event.find({'_id': {$in:event_list}}, function(err, events){
    let result = [];
    for(let index in events){
      let the_event_info = {};

      if(!events[index].hasBlocked(req.user))
        the_event_info = eventInfoDetail(req.user, events[index], null, PERMISSION_SETTINGS_EVENT.LIST);
      else
        the_event_info = eventInfoDetail(req.user, events[index], null, PERMISSION_SETTINGS_EVENT.BLOCKED_USERS);

      result.push(the_event_info);
    }
    res.status(200).json(result);
  });
});

//--------------do actions-----------------

//-----send/cancel friend request--------

// Send friend request to userId_user
// API POST localhost:3000/users/:userId/sendFriendRequest
// permission: all logged-in users
router.post('/:userId/sendFriendRequest', authenticate,
  checkNotSelf, checkNotBlockedByUser, checkDidNotBlock, (req, res, next) => {
  //check if userId_user is not friend
  if(res.userId_user.isFriendWith(req.user)){
    let err = new Error('Cannot send friend request to a friend.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'friendRequest';
    return next(err);
  }
  //check if friend request has not been sent already
  if(res.userId_user.hasReceivedFriendRequestFrom(req.user)){
    let err = new Error('Friend request was already sent.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'friendRequest';
    return next(err);
  }
  //check if res.userId_user did not send friend request
  if(req.user.hasReceivedFriendRequestFrom(res.userId_user)){
    let err = new Error('User ' + req.params.userId +
      ' already sent you a friend request. Accept it or ignore it.');
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

// Cancel friend request sent to userId_user
// API POST localhost:3000/users/:userId/cancelFriendRequest
// permission: all logged-in users
router.post('/:userId/cancelFriendRequest', authenticate, (req, res, next) => {
  //check if friend request is sent
  if(!res.userId_user.hasReceivedFriendRequestFrom(req.user)){
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

// Unfriend userId_user
// API POST localhost:3000/users/:userId/unfriend
// permission: userId_user's friend
router.post('/:userId/unfriend', authenticate, checkIsFriendWith,
  (req, res, next) => {
    req.user.friends.pull(res.userId_user._id);
    res.userId_user.friends.pull(req.user._id);
    req.user.save(function(err){
      if(err) return next(err);
      res.userId_user.save(function(err){
        if(err) return next(err);
        res.status(202).send();
      });
    });
  }
);

//-----------------block/unblock users----------------------

// Block userId_user
// API POST localhost:3000/users/:userId/block
// permission: all logged-in users
router.post('/:userId/block', authenticate, checkNotSelf, checkNotBlockedByUser,
  checkDidNotBlock, (req, res, next) => {
  //remove userId_user from friend list if friended
  if(req.user.isFriendWith(res.userId_user)){
    req.user.friends.pull(res.userId_user._id);
    res.userId_user.friends.pull(req.user._id);
  }
  //remove friend request if sent
  if(res.userId_user.hasReceivedFriendRequestFrom(req.user)){
    res.userId_user.friend_requests.pull(req.user._id);
  }
  //remove friend request if received
  if(req.user.hasReceivedFriendRequestFrom(res.userId_user)){
    req.user.friend_requests.pull(res.userId_user._id);
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

// Unblock userId_user
// API POST localhost:3000/users/:userId/unblock
// permission: users who have blocked userId_user
router.post('/:userId/unblock', authenticate, (req, res, next) => {
  //check if userId_user has not been blocked
  if(!req.user.hasBlocked(res.userId_user)){
    let err = new Error('You did not block User ' + req.params.userId + '.');
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

// Rate userId_user
// API POST localhost:3000/users/:userId/rate
// permission: userId_user's friends
router.post('/:userId/rate', authenticate, checkNotSelf, checkNotBlockedByUser,
  checkDidNotBlock, checkIsFriendWith, checkDidNotRateUser,
  (req, res, next) => {
    if(req.body.rating===undefined){
      let err = new Error('No input.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'rating';
      return next(err);
    }
    let rating = parseInt(req.body.rating);

    if(isNaN(rating)){
      let err = new Error('Rating should be a number.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'rating';
      return next(err);
    }

    if(rating<0 || rating > 5){
      let err = new Error('Rating should be an integer between 0 and 5, inclusive .');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'rating';
      return next(err);
    }

    //rate userId_user
    res.userId_user.rated_users.push(req.user);
    res.userId_user.totalRating += rating;

    //save change to database
    res.userId_user.save(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
  }
);

module.exports = router;
