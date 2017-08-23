'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

// import sub-schema
const {UserSchema} = require('./UserSchema');
const {LocationSchema} = require('./LocationSchema');
const {EVENT_INFO_CONST,PERMISSION_SETTINGS_EVENT} = require('config/constants');

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
    minlength: EVENT_INFO_CONST.MIN_DESCRIPTION_LENGTH,
    trim: true
  },
  max_attendees: {
    type: Number,
    required: true
  },
  // location: {
  //   type: LocationSchema,
  //   required: true
  // },
  location: {
    type: Schema.ObjectId,
    ref:"Location",
    required: true
  },

  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },

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
  return this.admins.length;
});

EventSchema.virtual('not_started').get(function () {
  let now = new Date();
  return now <=this.start_time;
});

EventSchema.virtual('is_ongoing').get(function () {
  let now = new Date();
  return this.start_time <= now && now <=this.end_time;
});

EventSchema.virtual('has_ended').get(function () {
  let now = new Date();
  return this.end_time <= now;
});

//override mongoose to only send needed info
EventSchema.methods.toJSON = function() {
  let eventObject = this.toObject({virtuals:true});
  eventObject = _.pick(eventObject,PERMISSION_SETTINGS_EVENT.ALL_FIELDS);
  return eventObject;
}

module.exports = {EventSchema};
