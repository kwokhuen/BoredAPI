'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
require('mongoose-type-url');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const Schema = mongoose.Schema;

const {EventSchema} = require('./EventSchema')

const {PERMISSION_SETTINGS_USER} = require('config/constants');

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
    required: true,
    min:10
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
  }],
  friends: [{type:Schema.ObjectId, ref:"User"}],
  friend_requests: [{type:Schema.ObjectId, ref:"User"}],
  blocked_users: [{type:Schema.ObjectId, ref:"User"}],
  rated_users: [{type:Schema.ObjectId, ref:"User"}],
  totalRating: {
    type: Number,
    required: false,
    default: 0
  },
  //Event
  created_events:[{type:Schema.ObjectId, ref:"Event"}],
  attended_events:[{type:Schema.ObjectId, ref:"Event"}]
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

UserSchema.methods.removeToken = function(token) {
  let user = this;
  return user.update({$pull: {tokens: {token}}});
}

//override mongoose to only send needed info
UserSchema.methods.toJSON = function() {
  let userObject = this.toObject({virtuals:true});
  userObject = _.pick(userObject,PERMISSION_SETTINGS_USER.ALL_FIELDS);
  return userObject;
}

UserSchema.methods.equals = function(user) {
  return this._id.toString() === user._id.toString();
}

UserSchema.methods.isFriendWith = function(user) {
  return this.friends.indexOf(user._id) !== -1;
}

UserSchema.methods.hasReceivedFriendRequestFrom = function(user) {
  return this.friend_requests.indexOf(user._id) !== -1;
}

UserSchema.methods.hasBlocked = function(user) {
  return this.blocked_users.indexOf(user._id) !== -1;
}

UserSchema.methods.wasRatedBy = function(user) {
  return this.rated_users.indexOf(user._id) !== -1;
}

UserSchema.virtual('rating').get(function () {
  if(this.rated_users.length===0)
    return -1;
  return this.totalRating / this.rated_users.length;
});

module.exports = {UserSchema};
