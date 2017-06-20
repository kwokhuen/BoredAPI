'use strict';

const express = require('express');
const {url} = require('config/development');
const {Event} = require('../../../db/models/Event')
const {User} = require('../../../db/models/User')
const router = express.Router();

// param middleware
//---------copying from user routes, should put it in a different file later---------
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

router.param('eventId', function(req, res, next, id){
  Event.findById(id, function(err, searchResult){
    if(err) return next(err);
    if(!searchResult) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    } else {
      req.event = searchResult;
      return next();
    }
  });
});

// Event Routes go here
router.post('/', (req, res, next) => {
  return res.status(200).send(req.body);
})

// 2. create an event - 48 hours period of time
// API:  GET localhost:3000/users/:userId/events/new


// 3. update an event - e.g location, time, date, name
// API: PUT localhost:3000/users/:userId/events/:eventId

// 4. delete an event - the whole event will be terminated if the host decided to remove the event
// API: DELETE localhost:3000/users/:userId/events/:eventId

// 4. leave an event
// API DELETE localhost:3000/users/:userId/events/:eventId

// 5. attend an event - any person could join an event
// API POST localhost:3000/users/:userId/events/:eventId

// 6. webSocket after joining the event (broadcast socket for all participants)
// socket.io

// 9. get an event list based on location (within 10 miles) and time (within 48 hours) on the first page
// API GET localhost:3000/users/:userId/events
// 10. search an event based on location
// API POST localhost:3000/search?location=xxx
// 11. bookmark events (saved on their phone / server ?)
// API POST localhost:3000/users/:userId/events/:eventId/bookmark



module.exports = router;
