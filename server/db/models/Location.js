'use strict';

const {mongoose} = require('db/mongoose');
const {LocationSchema} = require('db/schemas/LocationSchema');

// Location model used to create location document
const Location = mongoose.model('Location', LocationSchema);

module.exports = {Location};
