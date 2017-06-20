'use strict';

const {mongoose} = require('db/mongoose');
const {UserSchema} = require('db/schemas/UserSchema');

// User model used to create user document
const User = mongoose.model('User', UserSchema);

module.exports = {User};
