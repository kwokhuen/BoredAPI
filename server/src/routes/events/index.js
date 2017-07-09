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
// find the user from db based on userId and assign it to res.user
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

router.param('eventId', function(req, res, next, id){
  // find the event from db based on userId and assign it to res.event
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
      res.event = searchResult;
      return next();
    }
  });
});

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
router.post('/', authenticate, (req, res, next) => {
  let eventData = _.pick(req.body, ['name','description']);
  eventInfoValidation(eventData, next, false, ()=>{
    //if info valid, create the event
    var event = new Event(eventData);
    event.admins.push(req.user);
    event.save(function(err, createdEvent){
      if(err) return next(err);
      res.status(201).json(createdEvent);
    });
  });
});

// ----------------Event----------------------

// get an event info
// API GET localhost:3000/event/:eventId
router.get('/:eventId', authenticate, (req,res) =>{
  res.status(200).json(res.event);
});

// update an event - e.g location, time, date, name
// API: PUT localhost:3000/users/:userId/events/:eventId
router.put('/:eventId',authenticate, (req, res, next) => {
  if(!res.event.isAdmin(req.user)){
    let err = new Error('User is not event admin');
    err.status = 404;
    err.name = 'Not admin';
    err.target = 'user';
    return next(err);
  }
  let eventData = _.pick(req.body, ['name','description']);
  eventInfoValidation(eventData, next, true, ()=>{
    for(let i in eventData){
      //update event info
      if(eventData[i]!==null)
        res.event.set(i,eventData[i]);
      else { //unset fields if they are null
        res.event.set(i,undefined);
      }
    };
    res.event.save(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
  });
});

// Delete an event - the whole event will be terminated if the an admin decided to remove the event
// API: DELETE localhost:3000/users/:userId/events/:eventId
router.delete('/:eventId', authenticate, (req, res, next) => {
  if(!res.event.isAdmin(req.user)){
    let err = new Error('User is not event admin');
    err.status = 404;
    err.name = 'Not admin';
    err.target = 'user';
    return next(err);
  }
  res.event.remove(function(err){
    if(err){ return next(err);}
    res.status(204).send();
  });
});

//---------------Event Attendee Collection--------------

// Get the whole list of attendees of an event
// API: GET /events/:eventId/attendee
router.get('/:eventId/attendee', authenticate, (req,res) =>{
  res.status(200).json(res.event.attendees);
});

//-------------------Event Attendee -------------------

// Add user :userId to the attendees list
// API: POST /events/:eventId/attendee/:userId
router.post('/:eventId/attendee/:userId', authenticate, (req,res,next) =>{
  //allowed user: self
  if (req.user._id.toString() !== req.params.userId) {
    let err = new Error(req.params.userId+' does not match currently logged in user');
    err.status = 404;
    err.name = 'Id Mismatched';
    err.target = 'userId';
    return next(err);
  }
  //check if user already in attendees list or admin list
  if(res.event.isAttendee(res.user) || res.event.isAdmin(res.user)){
    let err = new Error('User already in attendees list');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'attendee';
    return next(err);
  }
  res.event.attendees.push(res.user);
  res.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(res.event);
  });
});

// Remove user :userId from the attendee list
// API: DELETE /events/:eventId/attendee/:userId
router.delete('/:eventId/attendee/:userId', authenticate, (req,res,next) =>{
  //allowed user: self
  if (req.user._id.toString() !== req.params.userId) {
    let err = new Error(req.params.userId+' does not match currently logged in user');
    err.status = 404;
    err.name = 'Id Mismatched';
    err.target = 'userId';
    return next(err);
  }
  //check if user in attendees list
  if(!res.event.isAttendee(res.user)){
    let err = new Error('User is not an attendee.');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'attendee';
    return next(err);
  }
  res.event.attendees.pull(req.params.userId);
  res.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(res.event);
  });
});

//------------Event Admin Collection-------------------
// /event/:eventId/admin

// Get the whole list of admins of an event
// API: GET /events/:eventId/admin
router.get('/:eventId/admin', (req,res) =>{
  res.status(200).json(res.event.admins);
});

//------------------Event Admin---------------------
// /events/:eventId/admin/:userId

// Add user :userId to the admin list
// API: POST /events/:eventId/admin/:userId
router.post('/:eventId/admin/:userId', (req,res) =>{
  //check if user already in attendees list
  if(res.event.admins.id(req.params.userId)){
    let err = new Error('User already in admin list');
    err.status = 409;
    err.name = 'BadRequest';
    err.target = 'attendee';
    return next(err);
  }
  res.event.admins.push(res.user);
  res.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(res.event);
  });
});

// Remove user :userId from the admin list
// API: DELETE /events/:eventId/admin/:userId
router.delete('/:eventId/admin/:userId', (req,res) =>{
  res.event.admins.pull(req.params.userId);
  res.event.save(function(err, event){
    if(err) return next(err);
    res.status(201).json(res.event);
  });
});

module.exports = router;
