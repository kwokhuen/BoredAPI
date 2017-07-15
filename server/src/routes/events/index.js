'use strict';

const express = require('express');
const validator = require('validator');
// const {url} = require('config/development');
const {Event} = require('../../../db/models/Event')
const {User} = require('../../../db/models/User')
const router = express.Router();
const {eventInfoValidation} = require('./eventInfoValidation')
const authenticate = require('../users/middlewares/authenticate');
const {ObjectId} = require('mongodb');
const _ = require('lodash');

// param middleware
//---------copying from user routes, should put it in a different file later---------
// whenever userId is in param
// find the user from db based on userId and assign it to res.userId_user
router.param('userId', function(req, res, next, id){
  // find the user from db based on userId and assign it to res.userId_user
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
      res.userId_user = searchResult;
      return next();
    }
  });
});

router.param('eventId', function(req, res, next, id){
  // find the event from db based on userId and assign it to res.eventId_event
  if(!validator.isMongoId(id)){
    var err = new Error(id+' is not a valid Mongo object id');
    err.status = 404;
    err.name = 'NotFound';
    err.target = 'eventId';
    return next(err);
  }
  Event.findById(id, function(err, searchResult){
    if(err) return next(err);
    if(!searchResult) {
      var err = new Error('Event with ID '+id+' does not exist');
      err.status = 404;
      err.name = 'NotFound';
      err.target = 'eventId';
      return next(err);
    } else {
      res.eventId_event = searchResult;
      return next();
    }
  });
});

// --------------------permission middlewares------------------------
// those permissions below are sufficient authurization, not necessary
// that means users with either one of the permits below are authurized
// to do the action requested.
// necessary authurization would be hard coded in the route

//permission granted if user is userId_user
const selfPermitted = (req,res,next) => {
  //check if user is userId_user
  if(req.user.equals(res.userId_user))
    req.permitted = true;
  next();
}

//permission granted if user is eventId_event admin
const adminPermitted = (req,res,next) => {
  //check if user is admin
  if(res.eventId_event.isAdmin(req.user))
    req.permitted = true;
  next();
}

//permission granted if user is eventId_event attendee
const attendeePermitted = (req,res,next) => {
  //check if user is admin
  if(res.eventId_event.isAttendee(req.user))
    req.permitted = true;
  next();
}

const checkPermission = (req,res,next) => {
  //check if req.permitted is flagged to true
  if(!req.permitted){
    let err = new Error('User is not authurized for this action.');
    err.status = 404;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }
  next();
}

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
router.put('/:eventId', authenticate, adminPermitted, checkPermission,
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
router.delete('/:eventId', authenticate, adminPermitted, checkPermission,
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
  res.status(200).json(res.eventId_event.attendees);
});

//-------------------Event Attendee -------------------

// Add userId_user to the attendees list
// API: POST /events/:eventId/attendees/:userId
// permission: userId_user
router.post('/:eventId/attendees/:userId', authenticate,
  selfPermitted, checkPermission,
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
  selfPermitted, adminPermitted, checkPermission,
  (req,res,next) => {
    //check if userId_user in attendees list
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
      res.eventId_event.admins.pull(res.userId_user._id.toString());
    }
    res.eventId_event.attendees.pull(res.userId_user._id.toString());
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
  res.status(200).json(res.eventId_event.admins);
});

//------------------Event Admin---------------------
// /events/:eventId/admin/:userId

// Add userId_user from attendee list to the admin list
// API: POST /events/:eventId/admins/:userId
// permission: admin
router.post('/:eventId/admins/:userId', authenticate,
  adminPermitted, checkPermission,
  (req,res, next) =>{
    //check if userId_user in attendee list
    if(!res.eventId_event.isAttendee(res.userId_user)){
      let err = new Error('User ' + req.params.userId + 'is not an attendee of the event');
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
  selfPermitted, adminPermitted, checkPermission,
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

    res.eventId_event.admins.pull(res.userId_user._id.toString());
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.status(202).json(res.eventId_event);
    });
  }
);

module.exports = router;
