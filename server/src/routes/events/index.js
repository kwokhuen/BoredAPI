'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {Event} = require('db/models/Event');
const {User} = require('db/models/User');
const {Location} = require('db/models/Location');

const {eventInfoValidation} = require('src/utils/eventInfoValidation');

const authenticate = require('src/middlewares/authenticate');

const {userInfoDetail} = require('src/utils/userInfoDetail');
const {eventInfoDetail} = require('src/utils/eventInfoDetail');

const {PERMISSION_SETTINGS_USER} = require('config/constants');
const {PERMISSION_SETTINGS_EVENT} = require('config/constants');
const {LOCATION_CONST} = require('config/constants');

const {
  grantSelf,
  grantAdmin,
  grantAttendee,
  checkPermission,
  checkNotSelf,
  checkDidNotRateEvent } = require('src/middlewares/permission');

const validator = require('validator');

const { userIdParam, eventIdParam, locationIdParam} = require('src/middlewares/param');

// param middleware
router.param('userId', userIdParam);
router.param('eventId', eventIdParam);
router.param('locationId', locationIdParam);

// Routes

// ------------------Event Collection--------------------

// view events nearby
// API: GET localhost:3000/events
// permission: all logged-in users
router.get('/nearby', authenticate, (req,res,next) => {

    if(!req.query.lat || !req.query.long){
        var err = new Error('Latitude and longitude are not specified.');
        err.status = 404;
        err.name = 'Bad request';
        err.target = 'location';
        return next(err);
    }

    let queryInfo = {};

    queryInfo.lat = Number(req.query.lat);
    queryInfo.long = Number(req.query.long);
    queryInfo.distance = Number(req.query.distance);

    if(!queryInfo.distance)
        queryInfo.distance = LOCATION_CONST.DEFAULT_SEARCH_RADIUS;

    //calculate distance in miles
    let distance = queryInfo.distance/LOCATION_CONST.EARTH_RADIUS;

    Location.geoNear([queryInfo.long,queryInfo.lat],
        {maxDistance : distance, spherical : true, distanceMultiplier: LOCATION_CONST.EARTH_RADIUS},
        function(err, resultLocations, stats){
            if(err) return next(err);
            let nearbyEventIDs = [];
            let locationTable = {};
            let distanceTable = {};
            //store a list of nearby event IDs
            for(let index in resultLocations){
              let eventIdArray = resultLocations[index].obj.upcoming_events.toObject();
              for(let i in eventIdArray){
                nearbyEventIDs.push(eventIdArray[i]);
                locationTable[eventIdArray[i]]= index;
                distanceTable[eventIdArray[i]]= resultLocations[index].dis;
              }
            }
            // locationTable:
            // { eventId : locationIndex}

            // distanceTable:
            // { eventId : distance}

            //retrieve the nearby events with their IDs
            Event.find({'_id': {$in:nearbyEventIDs}}, function(err,events){
              if(err) return next(err);

              let results = [];

              for(let index in events){
                let locationInfo = resultLocations[locationTable[events[index]._id]].obj;
                let the_event_info = {};

                if(!events[index].hasBlocked(req.user))
                  the_event_info = eventInfoDetail(req.user, events[index], locationInfo, PERMISSION_SETTINGS_EVENT.LIST);
                else
                  the_event_info = eventInfoDetail(req.user, events[index], locationInfo, PERMISSION_SETTINGS_EVENT.BLOCKED_USERS);

                the_event_info.distance = distanceTable[events[index]._id];
                results.push(the_event_info);
              }
              res.status(200).json(results);              
            });
        }
    );
});

// create an event
// API: POST localhost:3000/events
// permission: all logged-in users
router.post('/', authenticate, (req, res, next) => {
  let eventData = _.pick(req.body, ['name','description','max_attendees','location']);
  eventInfoValidation(eventData, next, false, ()=>{
    //if info valid, create the event

    Location.findById(eventData.location, function(err, searchResult){
      if(err) return next(err);
      if(!searchResult) {
        var err = new Error('Location with ID '+eventData.location+' does not exist');
        err.status = 404;
        err.name = 'NotFound';
        err.target = 'eventId';
        return next(err);
      } else {
        let event = new Event({
          'name':eventData.name,
          'description':eventData.description,
          'max_attendees':eventData.max_attendees,
          'location':eventData.location
        });

        event.admins.push(req.user);
        event.attendees.push(req.user);
        req.user.created_events.push(event);
        req.user.attended_events.push(event);
        searchResult.upcoming_events.push(event);

        event.save(function(err, createdEvent){
          if(err) return next(err);
          req.user.save(function(err,user){
            if(err) return next(err);
            searchResult.save(function(err,location){
              if(err) return next(err);
              res.status(201).json(createdEvent);
            });
          });
        });
      }
    });
  });
});

// ----------------Event----------------------

// get an event info
// API GET localhost:3000/event/:eventId
// permission: all logged-in users
router.get('/:eventId', authenticate, (req,res,next) =>{
  let result = {};

  Location.findById(res.eventId_event.location, function(err, location){
    if(err) return next(err);

    //friend
    if(res.eventId_event.isAdmin(req.user)){
      result = eventInfoDetail(req.user, res.eventId_event, location, PERMISSION_SETTINGS_EVENT.ADMINS);
    } //blocked by userId_user
    else if(res.eventId_event.isAttendee(req.user)){
      result = eventInfoDetail(req.user, res.userId_user, location, PERMISSION_SETTINGS_USER.ATTENDEES);
    } //has blocked userId_user
    else if(res.eventId_event.hasBlocked(req.user)){
      result = eventInfoDetail(req.user, res.userId_user, location, PERMISSION_SETTINGS_USER.BLOCKED_USERS);
    }
    //everyone else
    else {
      result = eventInfoDetail(req.user, res.userId_user, location, PERMISSION_SETTINGS_USER.USERS);
    }
    res.status(200).json(result);
  });
});

// update event info
// API: PUT localhost:3000/events/:eventId
// permission: event admins
router.put('/:eventId', authenticate, grantAdmin, checkPermission,
  (req, res, next) => {
    let eventData = _.pick(req.body, ['name','description','max_attendees','location']);
    eventInfoValidation(eventData, next, true, ()=>{

      for(let i in eventData){
        if(i!=='location'){
          //update event info
          if(eventData[i]!==null)
            res.eventId_event.set(i,eventData[i]);
          else { //unset fields if they are null
            res.eventId_event.set(i,undefined);
          }
        }
      };

      if(!eventData.location){ //if location  is not specified
        res.eventId_event.save(function(err) {
          if(err) return next(err);
          res.status(202).send('update successful');
        });
      } else { //if location is to be updated

        //find new location
        Location.findById(eventData.location, function(err, newLocation){
          if(err) return next(err);
          if(!newLocation) {
            var err = new Error('Location with ID '+eventData.location+' does not exist');
            err.status = 404;
            err.name = 'NotFound';
            err.target = 'locationId';
            return next(err);
          } else {

            //find old location
            Location.findById(res.eventId_event.location, function(err, oldLocation){
              if(err) return next(err);

              //update old location, new location and event
              newLocation.upcoming_events.push(res.eventId_event);
              oldLocation.upcoming_events.pull(res.eventId_event._id);
              res.eventId_event.location = newLocation._id;

              //save changes
              oldLocation.save(function(err){
                if(err) return next(err);
                res.eventId_event.save(function(err){
                  if(err) return next(err);
                  newLocation.save(function(err){
                    if(err) return next(err);
                    res.status(202).send('update successful.');
                  });
                });
              });
            });
          }
        });
      }
    });
  }
);

// Delete an event - the whole event will be terminated if the an admin decided to remove the event
// API: DELETE localhost:3000/events/:eventId
// permission: event admins
router.delete('/:eventId', authenticate, grantAdmin, checkPermission,
  (req, res, next) => {
    Location.findById(res.eventId_event.location, function(err, oldLocation){
      if(err) return next(err);
      oldLocation.upcoming_events.pull(res.eventId_event._id);
      res.eventId_event.remove(function(err){
        if(err) return next(err);
        res.status(204).send();
      });
    });
  }
);

//------------actions----------------

// Rate eventId_event
// API: POST /events/:eventId/rate
// permission: event attendees
router.post('/:eventId/rate', authenticate, grantAttendee, checkPermission, checkDidNotRateEvent,
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

    //rate eventId_event
    res.eventId_event.rated_users.push(req.user);
    res.eventId_event.totalRating += rating;

    //save change to database
    res.eventId_event.save(function(err){
      if(err) return next(err);
      res.status(202).send();
    });
  }
);

//---------------Event Attendee Collection--------------

// Get the whole list of attendees of an event
// API: GET /events/:eventId/attendees
// permission: all logged-in users
router.get('/:eventId/attendees', authenticate, (req,res,next) =>{
  Event.findOne({ _id: req.params.eventId}).populate('attendees').exec(function(err,event){
    if(err) return next(err);
    let attendee_list = event.attendees.toObject();
    let result = [];
    for (let i in attendee_list){
      result.push(userInfoDetail(req.user, attendee_list[i], PERMISSION_SETTINGS_USER.LIST));
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
    //check if userId_user is not blocked from the event
    if(res.eventId_event.hasBlocked(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' is blocked from the event.');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'attendee';
      return next(err);
    }
    //check if userId_user already in attendees list
    if(res.eventId_event.isAttendee(res.userId_user)){
      let err = new Error('User ' + req.params.userId +' already in attendees list');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'attendee';
      return next(err);
    }
    //check if event has reached max_attendees
    if(res.eventId_event.reachedMax()){
      let err = new Error('Event has reached max number of attendees');
      err.status = 409;
      err.name = 'BadRequest';
      err.target = 'attendee';
      return next(err);
    }
    res.eventId_event.attendees.push(res.userId_user);
    res.userId_user.attended_events.push(event);

    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.userId_user.save(function(err,user){
        if(err) return next(err);
        res.status(201).json(res.eventId_event);
      });
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
    res.userId_user.attended_events.pull(res.eventId_event._id);
    if(res.userId_user.created_events.indexOf(res.eventId_event._id) !== -1){
      res.userId_user.created_events.pull(res.eventId_event._id);
    }
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.userId_user.save(function(err, user){
        res.status(202).json(res.eventId_event);
      });
    });
  }
);

//------------Event Admin Collection-------------------
// /event/:eventId/admin

// Get the whole list of admins of that event
// API: GET /events/:eventId/admins
// permission: all logged-in users
router.get('/:eventId/admins', authenticate, (req,res,next) =>{
  Event.findOne({ _id: req.params.eventId}).populate('admins').exec(function(err,event){
    if(err) return next(err);
    let admin_list = event.admins.toObject();
    let result = [];
    for (let i in admin_list){
      result.push(userInfoDetail(req.user, admin_list[i], PERMISSION_SETTINGS_USER.LIST));
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
  (req, res, next) =>{
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
// permission: event admins
router.get('/:eventId/blockedUsers', authenticate, grantAdmin, checkPermission,
  (req, res, next) =>{
    Event.findOne({ _id: req.params.eventId}).populate('blocked_users').exec(function(err,event){
      if(err) return next(err);
      let blocked_list = event.blocked_users.toObject();
      let result = [];
      for (let i in blocked_list){
        result.push(userInfoDetail(req.user, blocked_list[i], PERMISSION_SETTINGS_USER.BLOCKED_USERS));
      }
      res.status(200).json(result);
    });
  }
);

//------------------Event Blocked users---------------------
// /events/:eventId/blockedUsers/:userId

// Add userId_user to the blocked_users list
// API: POST /events/:eventId/blockedUsers/:userId
// permission: event admins
router.post('/:eventId/blockedUsers/:userId', authenticate,
  checkNotSelf, grantAdmin, checkPermission,
  (req, res, next) =>{
    //remove userId_user from attendee list if in
    if(res.eventId_event.isAttendee(res.userId_user)){
      res.eventId_event.attendees.pull(res.userId_user._id);
      res.userId_user.attended_events.pull(res.eventId_event._id);
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
    if(res.userId_user.created_events.indexOf(res.eventId_event._id) !== -1){
      res.userId_user.created_events.pull(res.eventId_event._id);
    }
    res.eventId_event.blocked_users.push(res.userId_user);
    res.eventId_event.save(function(err, event){
      if(err) return next(err);
      res.userId_user.save(function(err, user){
        res.status(201).json(res.eventId_event);
      });
    });
  }
);

// Unblock userId_user list from the event
// API: DELETE /events/:eventId/blockedUsers/:userId
// permission: event admins
router.delete('/:eventId/blockedUsers/:userId', authenticate,
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


