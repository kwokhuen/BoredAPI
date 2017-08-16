'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

// import sub-schema
const {UserSchema} = require('./UserSchema');
const {LocationSchema} = require('./LocationSchema');

// user schema
const EventSchema = new Schema({
  name: {
    type: String,
    minlength: 1,
    trim: true,
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 50,
    trim: true
  },
  max_attendees: {
    type: Number,
    required: true
  },
  location: {
    type: LocationSchema,
    required: true
  },
  // start_time: {
  //   type: Date,
  //   required: true
  // },
  // end_time: {
  //   type: Date,
  //   required: true
  // },
  admins: [{type:Schema.ObjectId, ref:"User"}],
  attendees: [{type:Schema.ObjectId, ref:"User"}],
  blocked_users: [{type:Schema.ObjectId, ref:"User"}],
  rated_users: [{type:Schema.ObjectId, ref:"User"}],
  totalRating: {
    type: Number,
    required: false,
    default: 0
  }
});

//return if user belongs to admin group
EventSchema.methods.isAdmin = function(user) {
  return this.admins.indexOf(user._id) !== -1;
}

//return if user belongs to attendee group
EventSchema.methods.isAttendee = function(user) {
  return this.attendees.indexOf(user._id) !== -1;
}

//return if user is blocked from the event
EventSchema.methods.hasBlocked = function(user) {
  return this.blocked_users.indexOf(user._id) !== -1;
}

EventSchema.methods.wasRatedBy = function(user) {
  return this.rated_users.indexOf(user._id) !== -1;
}

EventSchema.methods.reachedMax = function() {
  return this.max_attendees === this.attendees.length;
}

EventSchema.virtual('rating').get(function () {
  if(this.rated_users.length===0)
    return -1;
  return this.totalRating / this.rated_users.length;
});

EventSchema.virtual('num_attendees').get(function () {
  return this.attendees.length;
});

EventSchema.virtual('num_admins').get(function () {
  return this.attendees.length;
});

//override mongoose to only send needed info
EventSchema.methods.toJSON = function() {
  let eventObject = this.toObject();
  eventObject.num_attendees = this.num_attendees;
  eventObject.num_admins = this.num_admins;
  eventObject.rating = this.rating;
  //eventObject = _.pick(eventObject,PERMISSION_SETTINGS_EVENT.ALL_FIELDS);
  return eventObject;
}

module.exports = {EventSchema};
