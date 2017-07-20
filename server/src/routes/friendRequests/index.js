'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('db/models/User');
const authenticate = require('src/middlewares/authenticate');

const { userIdParam } = require('src/middlewares/param');

router.param('userId', userIdParam);

// View friend requests
// API GET localhost:3000/friendRequests
// permission: all logged-in users
router.get('/', authenticate, (req, res, next) => {
	User.findOne({ _id: req.user._id }).populate('friend_requests').exec(function(err,user){
		if(err) return next(err);
		let friend_request_list = user.friend_requests.toObject();
		let result = [];
		for (let i in friend_request_list){
			result.push(_.pick(blocked_list[i],['_id','displayName', 'firstName',
				'lastName', 'username','profilePic']));
		}
		res.status(200).json(result);
	})
});

// Accept friend request from userId_user
// API POST localhost:3000/friendRequests/:userId
// permission: all logged-in users
router.post('/:userId', authenticate, (req, res, next) => {
	//check if friend request is received
	if(!req.user.hasReceivedFriendRequestFrom(res.userId_user)){
		let err = new Error('No friend request was received.');
		err.status = 409;
		err.name = 'NotFound';
		err.target = 'friendRequest';
		return next(err);
	}
	req.user.friend_requests.pull(res.userId_user._id);
	req.user.friends.push(res.userId_user);
	res.userId_user.friends.push(req.user);
	req.user.save(function(err){
		if(err) return next(err);
			res.userId_user.save(function(err){
		  	if(err) return next(err);
		  	res.status(202).send();
		});
	});
});

// Ignore friend request from userId_user
// API DELETE localhost:3000/friendRequests/:userId
// permission: all logged-in users
router.delete('/:userId', authenticate, (req, res, next) => {
	//check if friend request is received
	if(!req.user.hasReceivedFriendRequestFrom(res.userId_user)){
		let err = new Error('No friend request was received.');
		err.status = 409;
		err.name = 'NotFound';
		err.target = 'friendRequest';
		return next(err);
	}
	// remove userId_user from req.user's friend_requests list
	req.user.friend_requests.pull(res.userId_user._id);
	req.user.save(function(err){
		if(err) return next(err);
		res.status(202).send();
	});
});

module.exports = router;