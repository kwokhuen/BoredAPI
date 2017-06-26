'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
require('mongoose-type-url');

const Schema = mongoose.Schema;

// import sub-schema
// const {LocationSchema} = require('./LocationSchema');

// user schema
const UserSchema = new Schema({
  displayName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: Number, // 1: Male, 0: Female
    required: true
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  profilePic: {
    type: String,//mongoose.SchemaTypes.Url,
    required: false,
    trim: true
  }
});

module.exports = {UserSchema};
