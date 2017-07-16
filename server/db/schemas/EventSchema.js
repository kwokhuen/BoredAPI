'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
const Schema = mongoose.Schema;

// import sub-schema
//const {LocationSchema} = require('./LocationSchema');
const {UserSchema} = require('./UserSchema')

// user schema
const EventSchema = new Schema({
  name: {
    type: String,
    minlength: 1,
    trim: true,
    required: true
  },
  // time: {
  //   type: Date,
  //   required: true
  // },
  // onGoing: {
  //   type: Boolean,
  //   required: true
  // },
  admins: [{type:Schema.ObjectId, ref:"User"}],
  attendees: [{type:Schema.ObjectId, ref:"User"}],
  blocked_users: [{type:Schema.ObjectId, ref:"User"}],
  description: {
    type: String,
    required: true,
    minlength: 50,
    trim: true
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

module.exports = {EventSchema};
