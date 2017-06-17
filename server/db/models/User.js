const {mongoose} = require('db/mongoose');
const {userSchema} = require('db/schemas/userSchema');

// User model used to create user document
const User = mongoose.model('User', userSchema);

module.exports = {User};
