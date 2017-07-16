'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {Event} = require('db/models/Event')
const {User} = require('db/models/User')
const {eventInfoValidation} = require('./eventInfoValidation')
const authenticate = require('../middlewares/authenticate');

const {
  grantSelf,
  grantAdmin,
  grantAttendee,
  checkPermission,
  checkNotSelf } = require('../middlewares/permission');

const { userIdParam, eventIdParam } = require('../middlewares/param');

// param middleware
router.param('userId', userIdParam);
router.param('eventId', eventIdParam);

// Routes

// ----------<for development use>-----------
// get all events
// API GET localhost:3000/events/dev
router.get('/dev', (req,res) =>{
  Event.find({}, function(err, result){
    if(err) return err;
    res.status(200).json(result);
  });
});

// delete all events
// API DELETE localhost:3000/events/dev
router.delete('/dev', (req,res) =>{
  if(Event.collection.drop()){
    res.status(202).send();
  } else {
    res.status(500).send("Error");
  }
});

// ------------------Event Collection--------------------

// create an event
// API: POST localhost:3000/events
// permission: all logged-in users
router.post('/', authenticate, (req, res, next) => {
  let eventData = _.pick(req.body, ['name','description']);
  eventInfoValidation(eventData, next, false, ()=>{
    //if info valid, create the event
    var event = new Event(eventData);
    event.admins.push(req.user);
    event.attendees.push(req.user);
    event.save(function(err, createdEvent){
      if(err) return next(err);
      res.status(201).json(createdEvent);
    });
  });
});

// ----------------Event----------------------

// get an event info
// API GET localhost:3000/event/:eventId
// permission: all logged-in users
router.get('/:eventId', authenticate, (req,res) =>{
  res.status(200).json(res.eventId_event);
});

// update event info
// API: PUT localhost:3000/users/:userId/events/:eventId
// permission: event admins
router.put('/:eventId', authenticate, grantAdmin, checkPermission,
  (req, res, next) => {
    let eventData = _.pick(req.body, ['name','description']);
    eventInfoValidation(eventData, next, true, ()=>{
      for(let i in eventData){
        //update event info
        if(eventData[i]!==null)
          res.eventId_event.set(i,eventData[i]);
        else { //unset fields if they are null
          res.eventId_event.set(i,undefined);
        }
      };
      res.eventId_event.save(function(err){
        if(err) return next(err);
        res.status(202).send();
      });
    });
  }
);

// Delete an event - the whole event will be terminated if the an admin decided to remove the event
// API: DELETE localhost:3000/users/:userId/events/:eventId
// permission: event admins
router.delete('/:eventId', authenticate, grantAdmin, checkPermission,
  (req, res, next) => {
    res.eventId_event.remove(function(err){
      if(err){ return next(err);}
      res.status(204).send();
    });
  }
);

//---------------Event Attendee Collection--------------

// Get the whole list of attendees of an event
// API: GET /events/:eventId/attendee
// permission: all logged-in users
router.get('/:eventId/attendees', authenticate, (req,res) =>{
  Event.findOne({ _id: req.params.eventId}).populate('attendees').exec(function(err,event){
    if(err) return next(err);
    let attendee_list = event.attendees.toObject();
    let result = [];
    for (let i in attendee_list){
      result.push(_.pick(attendee_list[i],['_id','displayName', 'firstName', 'lastName', 'age', 'username']));
    }
    res.status(200).json(result);
  })
});

//-------------------Event Attendee -------------------

// Add userId_user to the attendees list
// API: POST /events/:eventId/attendees/:userId
// permission: userId_user
router.post('/:eventId/attendees/:userId', authenticate,
  grantSelf, checkPermission,
  (req,res,next) =>{
    //check if userId_user already in attendees list
    if(res.eventId_event.isAttendee(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' already in attendees list');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'attendee';
      return next(err);
    }
    res.eventId_event.attendees.push(res.userId_user);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(201).json(res.eventId_event);
    });
  }
);

// Remove userId_user from the attendee list
// API: DELETE /events/:eventId/attendees/:userId
// permission: userId_user, admin
router.delete('/:eventId/attendees/:userId', authenticate,
  grantSelf, grantAdmin, checkPermission,
  (req,res,next) => {
    //check if userId_user is in attendees list
    if(!res.eventId_event.isAttendee(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' is not an attendee.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'attendee';
      return next(err);
    }
    //remove from admin list if the user is admin
    if(res.eventId_event.isAdmin(res.userId_user)){
      // dont remove user that if they are the only admin
      if(res.eventId_event.admins.length === 1){
        let err = new Error('User cannot leave admin group when there is only one admin.');
        err.status = 409;
        err.name = 'BadRequest';
        err.target = 'admin';
        return next(err);
      }
      res.eventId_event.admins.pull(res.userId_user._id);
    }
    res.eventId_event.attendees.pull(res.userId_user._id);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(202).json(res.eventId_event);
    });
  }
);

//------------Event Admin Collection-------------------
// /event/:eventId/admin

// Get the whole list of admins of that event
// API: GET /events/:eventId/admins
// permission: all logged-in users
router.get('/:eventId/admins', authenticate, (req,res) =>{
  Event.findOne({ _id: req.params.eventId}).populate('admins').exec(function(err,event){
    if(err) return next(err);
    let admin_list = event.admins.toObject();
    let result = [];
    for (let i in admin_list){
      result.push(_.pick(admin_list[i],['_id','displayName', 'firstName', 'lastName', 'age', 'username']));
    }
    res.status(200).json(result);
  })
});

//------------------Event Admin---------------------
// /events/:eventId/admin/:userId

// Add userId_user from attendee list to the admin list
// API: POST /events/:eventId/admins/:userId
// permission: admin
router.post('/:eventId/admins/:userId', authenticate,
  grantAdmin, checkPermission,
  (req,res, next) =>{
    //check if userId_user in attendee list
    if(!res.eventId_event.isAttendee(res.userId_user)){
      let err = new Error('User ' + req.params.userId + ' is not an attendee of the event');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'admin';
      return next(err);
    }
    //check if userId_user already in admin list
    if(res.eventId_event.isAdmin(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' already in admin list');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'admin';
      return next(err);
    }
    res.eventId_event.admins.push(res.userId_user);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(201).json(res.eventId_event);
    });
  }
);

// Remove user :userId from the admin list
// API: DELETE /events/:eventId/admins/:userId
router.delete('/:eventId/admins/:userId', authenticate,
  grantSelf, grantAdmin, checkPermission,
  (req,res,next) => {
    //check if userId_user in attendees list
    if(!res.eventId_event.isAdmin(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' is not an admin.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'admin';
      return next(err);
    }

    // dont remove user that if they are the only admin
    if(res.eventId_event.admins.length === 1){
      let err = new Error('User cannot leave admin group when there is only one admin.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'admin';
      return next(err);
    }

    res.eventId_event.admins.pull(res.userId_user._id);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(202).json(res.eventId_event);
    });
  }
);

//------------------Event Blocked users Collection-------------------
// /event/:eventId/blockedUsers

// Get the whole list of blocked Users of that event
// API: GET /events/:eventId/blockedUsers
// permission: all logged-in users
router.get('/:eventId/admins', authenticate, grantAdmin, checkPermission,
  Event.findOne({ _id: req.params.eventId}).populate('blocked_users').exec(function(err,event){
    if(err) return next(err);
    let blocked_list = event.blocked_users.toObject();
    let result = [];
    for (let i in blocked_list){
      result.push(_.pick(blocked_list[i],['_id','displayName', 'firstName', 'lastName', 'age', 'username']));
    }
    res.status(200).json(result);
  })
);

//------------------Event Blocked users---------------------
// /events/:eventId/blockedUsers/:userId

// Add userId_user to the blocked_users list
// API: POST /events/:eventId/blockedUsers/:userId
// permission: admin
router.post('/:eventId/admins/:userId', authenticate,
  checkNotSelf, grantAdmin, checkPermission,
  (req,res, next) =>{
    //remove userId_user from attendee list if in
    if(res.eventId_event.isAttendee(res.userId_user)){
      res.eventId_event.attendees.pull(res.userId_user._id);
    }
    //remove userId_user from admin list if in
    if(res.eventId_event.isAdmin(res.userId_user)){
      res.eventId_event.admins.pull(res.userId_user._id);
    }
    //check if userId_user already in blocked_users list
    if(res.eventId_event.hasBlocked(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' already in blocked_users list');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'user';
      return next(err);
    }
    res.eventId_event.blocked_users.push(res.userId_user);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(201).json(res.eventId_event);
    });
  }
);

// Unblock userId_user list from the event
// API: DELETE /events/:eventId/blockedUsers/:userId
// permission: admin
router.delete('/:eventId/admins/:userId', authenticate,
  grantAdmin, checkPermission,
  (req,res,next) => {
    //check if userId_user in blocked_users list
    if(!res.eventId_event.hasBlocked(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' is not blocked from the event.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'user';
      return next(err);
    }
    //unblock userId_user
    res.eventId_event.blocked_users.pull(res.userId_user._id);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(202).json(res.eventId_event);
    });
  }
);

module.exports = router;
