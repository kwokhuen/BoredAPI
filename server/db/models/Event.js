'use strict';

const {mongoose} = require('db/mongoose');
const {EventSchema} = require('db/schemas/EventSchema');

// User model used to create user document
const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};
