'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');

// check username existance
// API GET localhost:3000/utils/usernameExist/:username
// permission: all users
router.get('/usernameExist/:username', (req,res,next) =>{
	let username = req.params.username;

	User.findOne({username}).then(user => {
	    if(!user)
	      res.status(200).json("username does not exist yet.");
	    else
	      res.status(200).json("username already exist.");
  	});
});

// check email existance
// API GET localhost:3000/utils/emailExist/:email
// permission: all users
router.get('/usernameExist/:userName', (req,res,next) =>{
	let email = req.params.email;

	User.findOne({email}).then(user => {
	    if(!user)
	      res.status(200).json("email does not exist yet.");
	    else
	      res.status(200).json("email already exist.");
  	});
});

module.exports = router;
