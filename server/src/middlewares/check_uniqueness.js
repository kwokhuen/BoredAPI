'use strict';

const {User} = require('db/models/User');

//check info uniqueness when user attempt to create or update profile
// unique fields: username, email
const check_uniqueness = (req,res,next) => {
	let username = req.body.username;
	let email = req.body.email;

	User.findOne({username}).then(user => {
	    if(!user){
    		User.findOne({email}).then(user => {
			    if(!user)
			      next();
			    else {
				    let err = new Error('User with this email has already registered.');
				    err.status = 409;
				    err.name = 'Already exists';
				    err.target = 'email';
				    return next(err);
			    }
		  	});
	    }
	    else {
		    let err = new Error('User with this username already exists.');
		    err.status = 409;
		    err.name = 'Already exists';
		    err.target = 'username';
		    return next(err);
		}
  	});
}

module.exports = check_uniqueness;