const {mongoose} = require('../mongoose');
const {userSchema} = require('../schemas/userSchema');

// User model used to create user document
const User = mongoose.model('User', userSchema);

module.exports = {User};
