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
  admins: [UserSchema],
  attendees: [UserSchema],
  description: {
    type: String,
    required: true,
    minlength: 50,
    trim: true
  }
});

module.exports = {EventSchema};
