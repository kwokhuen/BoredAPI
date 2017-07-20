// param middleware
const validator = require('validator');
const {User} = require('db/models/User');
const {Event} = require('db/models/Event')


// whenever userId is in param
// find the user from db based on userId and assign it to res.userId_user
const userIdParam = function(req, res, next, id){
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
}

const eventIdParam = function(req, res, next, id){
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
}

module.exports = { userIdParam, eventIdParam};
