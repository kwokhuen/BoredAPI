'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
require('mongoose-type-url');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
  username: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
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
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.pre('save', function(next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    })
  } else {
    next();
  }
})

// Custom findByToken method
UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, 'abc123');
  } catch(e) {
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

// Custom findByCredential method
UserSchema.statics.findByCredential = function(username, password) {
  let User = this;
  return User.findOne({username}).then(user => {
    if (!user) {
      return new Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      })
    })
  })
}

// generate Auth token
UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
  user.tokens.push({access, token});
  return user.save().then(() => token);
}

// override mongoose to only send back _id, username and displayName
UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, ['_id', 'username', 'displayName'])
}

UserSchema.methods.removeToken = function(token) {
  let user = this;
  return user.update({$pull: {tokens: {token}}});
}

module.exports = {UserSchema};
