'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('db/models/User');

// ----------<for development use>-----------
// get all users
// API GET localhost:3000/users/dev
router.get('/showAllUsers', (req,res) =>{
	User.find({}, function(err, result){
		if(err) return err;
		res.status(200).json(result);
	});
});

// ----------<for development use>-----------
// delete all users
// API DELETE localhost:3000/users/dev
router.post('/deleteAllUsers', (req,res) =>{
	if(User.collection.drop()){
		res.status(202).send();
	} else {
		res.status(500).json("Error");
	}
});

// ----------<for development use>-----------
// Create a list of fake users
// API DELETE localhost:3000/users/dev
router.post('/createFakeUsers', (req,res,next) =>{
	let user1 = new User({
		"_id": "596ae5deddaa262f7586e8db",
		"username": "MarAtt",
		"displayName": "MarAtt",
		"firstName": "Marlena",
		"lastName": "Atterberry",
		"age": 23,
		"gender": 1,
		"email": "marlenang@gmail.com",
		"password": "$2a$10$RRIXfLd9fbPO4/SqKHnS7.i7Y0kE8sTpVD8/RZGF5B.bw17XztUuq",
		"__v": 10,
		"blocked_users": [],
		"friend_requests": [],
		"friends": [],
		"tokens": [
			{
				"access": "auth",
				"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZhZTVkZWRkYWEyNjJmNzU4NmU4ZGIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAwMTc3ODg3fQ.mnilz-agOiLhBF8g4k24lN9x9AXNoHpB_KyZ8-fUNNo",
				"_id": "596ae5dfddaa262f7586e8dc"
			}
		]
	});

	let user2 = new User({
		"_id": "596ae629ddaa262f7586e8dd",
		"username": "AnOli",
		"displayName": "Andreas Olivieri",
		"firstName": "Andreas",
		"lastName": "Olivieri",
		"age": 20,
		"gender": 1,
		"email": "andreas@mail.com",
		"password": "$2a$10$tyH3NIxy0Jfmgpj5FqtzXeDPULYyBB3J3NuyUTRqaKBjJlHvHZKYe",
		"__v": 8,
		"blocked_users": [],
		"friend_requests": [],
		"friends": [],
		"tokens": [
			{
				"access": "auth",
				"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZhZTYyOWRkYWEyNjJmNzU4NmU4ZGQiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAwMTc3OTYxfQ.HuHGYekrhbmXxV2dkm2IooRFhSC20apT4bwr5GF7VyY",
				"_id": "596ae629ddaa262f7586e8de"
			}
		]
	});

	let user3 = new User({
        "_id": "596eb7dcebf9034e4123a592",
        "displayName": "Galileo Chiang",
        "firstName": "Chon Long",
        "lastName": "Chiang",
        "age": 23,
        "gender": 1,
        "email": "chiang@dmail.com",
        "username": "clchiang",
        "password": "$2a$10$A/iv7lUuzPCNcN08fhZ9serW7rf5wFPAF9KG9QEFnX0VPt.76YalK",
        "__v": 1,
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "friend_requests": [],
        "friends": [],
        "tokens": [
            {
                "access": "auth",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZlYjdkY2ViZjkwMzRlNDEyM2E1OTIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAwNDI4MjUyfQ.Gi99WBALelBc7xHNDqgKR_dOtAV1tTJ8_Dmc4drHJcA",
                "_id": "596eb7dcebf9034e4123a593"
            }
        ]
    });

	let fakeUsers = [user1, user2, user3];
	User.insertMany(fakeUsers).then(()=>{
	res.status(201).json("list of fake users created");
	}).catch(err=>{return next(err);})
});


// ----------<for development use>-----------
// get all events
// API GET localhost:3000/events/dev
router.get('/showAllEvents', (req,res,next) =>{
  Event.find({}, function(err, result){
    if(err) return err;
    res.status(200).json(result);
  });
});

// delete all events
// API DELETE localhost:3000/events/dev
router.post('/deleteAllUsers', (req,res,next) =>{
  if(Event.collection.drop()){
    res.status(202).send();
  } else {
    res.status(500).send("Error");
  }
});

module.exports = router;