'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');
const {userInfoValidation} = require('src/utils/userInfoValidation');
const {PERMISSION_SETTINGS_USER} = require('config/constants');
const {PERMISSION_SETTINGS_EVENT} = require('config/constants');

const {userInfoDetail} = require('src/utils/userInfoDetail');
const {eventInfoDetail} = require('src/utils/eventInfoDetail');


const authenticate = require('src/middlewares/authenticate');

// --------------------account login/logout-----------------------

// login route
// API POST localhost:3000/account/login
// permission: all users
router.post('/login', (req,res,next) => {
	let userData = _.pick(req.body, ['username', 'password']);
	User.findByCredential(userData.username, userData.password).then(user => {
		return user.generateAuthToken().then(token => {
			res.status(200).header('x-auth', token).send(user);
		})
	}).catch(e => res.status(400).send())
});

// logout route
// API DELETE localhost:3000/account/logout
// permission: all logged-in users
router.delete('/logout', authenticate, (req,res,next) => {
	let user = req.user;
	let token = req.token;
	user.removeToken(token).then(() => res.status(200).send(), () => res.status(400).send());
});

// --------------------My account info -----------------------

// create a new user profile
// API POST localhost:3000/account
// permission: all users, not logged-in
router.post('/', (req, res, next) => {
	let userData = _.pick(req.body, ['displayName', 'firstName', 'lastName', 'age',
		'gender', 'email', 'username', 'profilePic', 'password']);

	userInfoValidation(userData, next, false, ()=>{
		//if info valid, create the user
		let newUser = new User(userData);
		newUser.save().then(() => {
			return newUser.generateAuthToken();
		}).then((token) => {
			res.header('x-auth', token).status(201).json(newUser.toJSON());
		}).catch(err => res.status(400).send(err));
	});
});

// view self_user's profile
// API GET localhost:3000/account
// permission: self_user
router.get('/', authenticate, (req,res,next) =>{
	res.status(200).json(userInfoDetail(req.user, req.user, PERMISSION_SETTINGS_USER.SELF));
});

// update self_user's profile
// API PUT localhost:3000/account
// permission: self_user
router.put('/', authenticate, (req,res, next) => {
	let userData = _.pick(req.body, ['displayName', 'firstName', 'lastName', 'age', 'gender',
		'email', 'username', 'profilePic', 'password']);
	//check if request info validity
	userInfoValidation(userData, next, true, ()=>{
		for(let i in userData){
			//update user info
			if(userData[i]!==null)
				req.user.set(i,userData[i]);
			else //unset fields if they are null
				req.user.set(i,undefined);
		};
		req.user.save(function(err){
			if(err) return next(err);
			res.status(202).send();
		});
	});
});

// show users blocked by self_user
// API GET localhost:3000/account/blockedList
// permission: self_user
router.get('/blockedList', authenticate, (req, res, next) => {
	let blocked_list = req.user.blocked_users.toObject();
	let result = [];
	User.find({'_id': {$in:blocked_list}}, function(err, blocked_users){
		let result = [];
		for(let index in blocked_users)
			result.push(userInfoDetail(req.user, blocked_users[index], PERMISSION_SETTINGS_USER.BLOCKED_USERS));
		res.status(200).json(result);
	});
});

// show friendList of self_user
// API GET localhost:3000/account/friendList
// permission: self_user
router.get('/friendList', authenticate, (req, res, next) => {
	let friend_list = req.user.friends.toObject();
	let result = [];
	User.find({'_id': {$in:friend_list}}, function(err, friends){
		let result = [];
		for(let index in friends)
			result.push(userInfoDetail(req.user, friends[index], PERMISSION_SETTINGS_USER.LIST));
		res.status(200).json(result);
	});
});

// show attended_events of self_user
// API GET localhost:3000/account/attended_events
// permission: self_user
router.get('/attended_events', authenticate, (req, res, next) => {
	let event_list = req.user.attended_events.toObject();
	let result = [];
	Event.find({'_id': {$in:event_list}}, function(err, events){
		let result = [];
		for(let index in events)
			result.push(eventInfoDetail(req.user, events[index], PERMISSION_SETTINGS_EVENT.LIST));
		res.status(200).json(result);
	});
});

// show created_events of self_user
// API GET localhost:3000/account/created_events
// permission: self_user
router.get('/created_events', authenticate, (req, res, next) => {
	let event_list = req.user.created_events.toObject();
	let result = [];
	Event.find({'_id': {$in:event_list}}, function(err, events){
		let result = [];
		for(let index in events)
			result.push(eventInfoDetail(req.user, events[index], PERMISSION_SETTINGS_EVENT.LIST));
		res.status(200).json(result);
	});
});

module.exports = router;