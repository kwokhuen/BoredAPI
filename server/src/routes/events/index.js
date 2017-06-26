'use strict';

const express = require('express');
const validator = require('validator');
// const {url} = require('config/development');
const {Event} = require('../../../db/models/Event')
const {User} = require('../../../db/models/User')
const router = express.Router();
const {eventInfoValidation} = require('./eventInfoValidation')

// param middleware
//---------copying from user routes, should put it in a different file later---------
// whenever userId is in param
// find the user from db based on userId and assign it to req.user
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

router.param('eventId', function(req, res, next, id){
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
      err = new Error('Not Found');
      err.status = 404;
      err.name = 'NotFound';
      err.target = 'eventId';
      return next(err);
    } else {
      req.event = searchResult;
      return next();
    }
  });
});

// Routes

// ------------------Event Collection--------------------
// ----------<for development use>-----------
// get all events
// API GET localhost:3000/event/dev
router.get('/dev', (req,res) =>{
  Event.find({}, function(err, result){
    if(err) return err;
    res.status(200).json(result);
  });
});

// ----------------Event----------------------

// get an event info
// API GET localhost:3000/event/:eventId
router.get('/:eventId',
  //TODO: insert user authentication middleware:
  // permission: any user
  (req,res) =>{
  res.status(200).json(req.event);
});

// create an event
// API: POST localhost:3000/event
router.post('/',
  //TODO: insert user authentication middleware:
  // permission: any user
  (req, res, next) => {
    eventInfoValidation(req, next, ()=>{
      //if info valid, create the event
      var event = new Event(req.body);
      event.save(function(err, createdEvent){
        if(err) return next(err);
        res.status(201).json(createdEvent);
      });
    });
});

// update an event - e.g location, time, date, name
// API: PUT localhost:3000/users/:userId/events/:eventId
router.put('/:eventId',
  //TODO: insert user authentication middleware:
  // permission: event admin
  (req, res, next) => {
    eventInfoValidation(req, next, ()=>{
      //if info valid, update the event
      const unsetFields = {};
      for(let i in req.body){
        if(req.body[i]===null)
          unsetFields[i] = null;
      };
      // updateFields: fields to update
      const updateFields = {};
      for(let i in req.body){
        if(req.body[i]!==null)
          updateFields[i] = req.body[i];
      };
      Event.update({'_id':req.event._id},
        {$set:updateFields},
        {$unset: unsetFields},
        function(err, modifiedEvent){
        // error handling
        if(err) return next(err);
        res.status(202).send();
      });
    });
});

// Delete an event - the whole event will be terminated if the host decided to remove the event
// API: DELETE localhost:3000/users/:userId/events/:eventId
router.delete('/:eventId',
  //TODO: insert user authentication middleware:
  // permission: event admin
  (req, res, next) => {
    req.event.remove(function(err){
      if(err){ return next(err);}
      res.status(204).send();
    });
});

//---------------Event Attendee Collection--------------

// Get the whole list of attendees of an event
// API: GET /events/:eventId/attendee
router.get('/:eventId/attendee', (req,res) =>{
  res.status(200).json(req.event.attendees);
});

//-------------------Event Attendee -------------------

// Add user :userId to the attendees list
// API: POST /events/:eventId/attendee/:userId
router.post('/:eventId/attendee/:userId', (req,res) =>{
  //check if user already in attendees list
  if(req.event.attendees.id(req.params.userId)){
    let err = new Error('User already in attendees list');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'attendee';
    return next(err);
  }
  req.event.attendees.push(req.user);
  req.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(req.event);
  });
});

// Remove user :userId from the attendee list
// API: DELETE /events/:eventId/attendee/:userId
router.delete('/:eventId/attendee/:userId', (req,res) =>{
  req.event.attendees.pull(req.params.userId);
  req.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(req.event);
  });
});

//------------Event Admin Collection-------------------
// /event/:eventId/admin

// Get the whole list of admins of an event
// API: GET /events/:eventId/admin
router.get('/:eventId/admin', (req,res) =>{
  res.status(200).json(req.event.admins);
});

//------------------Event Admin---------------------
// /events/:eventId/admin/:userId

// Add user :userId to the admin list
// API: POST /events/:eventId/admin/:userId
router.post('/:eventId/admin/:userId', (req,res) =>{
  //check if user already in attendees list
  if(req.event.admins.id(req.params.userId)){
    let err = new Error('User already in admin list');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'attendee';
    return next(err);
  }
  req.event.admins.push(req.user);
  req.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(req.event);
  });
});

// Remove user :userId from the admin list
// API: DELETE /events/:eventId/admin/:userId
router.delete('/:eventId/admin/:userId', (req,res) =>{
  req.event.admins.pull(req.params.userId);
  req.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(req.event);
  });
});

module.exports = router;
