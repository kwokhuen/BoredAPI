'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');
const {Location} = require('db/models/Location');

// ----------<for development use>-----------
// get all users
// API GET localhost:3000/dev
router.get('/showAllUsers', (req,res) =>{
	User.find({}, function(err, result){
		if(err) return next(err);
		res.status(200).json(result);
	});
});

// ----------<for development use>-----------
// delete all users
// API POST localhost:3000/dev/deleteAllUsers
router.post('/deleteAllUsers', (req,res) =>{
	if(User.collection.drop()){
		res.status(202).send();
	} else {
		res.status(500).json("Error");
	}
});

// ----------<for development use>-----------
// Create a list of seed users
// API POST localhost:3000/dev/createSeedUsers
router.post('/createSeedUsers', (req,res,next) =>{
    let user1 = new User({
        "_id": "599ccc508e709da3fcb00bd1",
        "displayName": "JoeLei",
        "firstName": "Joe",
        "lastName": "Lei",
        "age": 37,
        "gender": 1,
        "email": "joelei@gmail.com",
        "username": "joelei",
        "password": "$2a$10$NabnMC30DwTI5Pl3.ipqC.Eq9xdCc93a/lUV4vzmyn4LCvi1zO45S",
        "__v": 4,
        "attended_events": [
            "599cdb6a8e709da3fcb00bdd"
        ],
        "created_events": [
            "599cdb6a8e709da3fcb00bdd"
        ],
        "totalRating": 5,
        "rated_users": [
            "599cd1488e709da3fcb00bd7"
        ],
        "blocked_users": [],
        "friend_requests": [],
        "friends": [
            "599cd1488e709da3fcb00bd7"
        ],
        "tokens": [
            {
                "access": "auth",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljY2M1MDhlNzA5ZGEzZmNiMDBiZDEiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ4MTQ1fQ.-C4araCjLVNxR2oGFMlLNAyVOXgEg9hE0m2hjRq0x9o",
                "_id": "599ccc518e709da3fcb00bd2"
            }
        ]
    });
    let user2 = new User({
        "_id": "599cce8c8e709da3fcb00bd3",
        "displayName": "Raquel",
        "firstName": "Raquel",
        "lastName": "Carion",
        "age": 22,
        "gender": 0,
        "email": "raquelcarion@gmail.com",
        "username": "raquelcarion",
        "password": "$2a$10$J5BqRHRuogU/8MP.jQimdeeDaYikGT/z80vduzf/Bi78XFH.1tJZW",
        "__v": 6,
        "attended_events": [
            "599cdc098e709da3fcb00bde",
            "599cddb2a5816ea5394eb273",
            "599cdb6a8e709da3fcb00bdd",
            "599cfcd2a5816ea5394eb279"
        ],
        "created_events": [
            "599cdc098e709da3fcb00bde",
            "599cddb2a5816ea5394eb273"
        ],
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "friend_requests": [
            "599cd1488e709da3fcb00bd7"
        ],
        "friends": [],
        "tokens": [
            {
                "access": "auth",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljY2U4YzhlNzA5ZGEzZmNiMDBiZDMiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ4NzE3fQ.1BxYxyPzcwvP2Xvhy_bBsCkcicV2sJhDOprN7ShCxvo",
                "_id": "599cce8d8e709da3fcb00bd4"
            }
        ]
    });
    let user3 = new User({
        "_id": "599cceeb8e709da3fcb00bd5",
        "displayName": "Jaemin",
        "firstName": "Jaemin",
        "lastName": "Yoon",
        "age": 20,
        "gender": 1,
        "email": "jaemin@gmail.com",
        "username": "jaeminyoon",
        "password": "$2a$10$g0.HEFi6xPGXVmx5Fe8noO/EeSd74H4MozziDC24EfKSfbTtSN9wu",
        "__v": 3,
        "attended_events": [
            "599cdc098e709da3fcb00bde",
            "599cddb2a5816ea5394eb273"
        ],
        "created_events": [],
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "friend_requests": [],
        "friends": [],
        "tokens": [
            {
                "access": "auth",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljY2VlYjhlNzA5ZGEzZmNiMDBiZDUiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ4ODExfQ.deS-dqhWeieSrCVmIyIv5Ig6yH5jajG_qBEzHldrjYw",
                "_id": "599cceeb8e709da3fcb00bd6"
            }
        ]
    });
    let user4 = new User({
        "_id": "599cd1488e709da3fcb00bd7",
        "displayName": "Carrey Yip",
        "firstName": "Carrey",
        "lastName": "Yip",
        "age": 22,
        "gender": 0,
        "email": "carrey201@gmail.com",
        "username": "carreyyip",
        "password": "$2a$10$BSY/Cep8wQNemxHGI95HR.utUxaaFiR0N/x7UH6okh0ZraqyFDq3G",
        "__v": 5,
        "attended_events": [
            "599cfcd2a5816ea5394eb279",
            "599cdb6a8e709da3fcb00bdd"
        ],
        "created_events": [
            "599cfcd2a5816ea5394eb279"
        ],
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "friend_requests": [],
        "friends": [
            "599ccc508e709da3fcb00bd1"
        ],
        "tokens": [
            {
                "access": "auth",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTljZDE0ODhlNzA5ZGEzZmNiMDBiZDciLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTAzNDQ5NDE2fQ.KnmGgzm2o_Kn_mxotyQ0rx-YbNVkQoKPl3EcbevElG8",
                "_id": "599cd1488e709da3fcb00bd8"
            }
        ]
    });

	let seedUsers = [user1, user2, user3, user4];
	User.insertMany(seedUsers).then(()=>{
	   res.status(201).json("list of seed users created");
	}).catch(err=>{return next(err);})
});

// ----------<for development use>-----------
// Create a list of seed events
// API POST localhost:3000/dev/createSeedEvents
router.post('/createSeedEvents', (req,res,next) =>{

    let event1 = new Event({
        "_id": "599cdb6a8e709da3fcb00bdd",
        "name": "Bowling: Strik And Win",
        "description": "Let's go bowling tonight! anyone can join.",
        "max_attendees": 8,
        "location": "599cda008e709da3fcb00bdc",
        "start_time": "2017-08-28T04:00:00.000Z",
        "end_time": "2017-08-28T06:00:00.000Z",
        "__v": 2,
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "attendees": [
            "599ccc508e709da3fcb00bd1",
            "599cd1488e709da3fcb00bd7",
            "599cce8c8e709da3fcb00bd3"
        ],
        "admins": [
            "599ccc508e709da3fcb00bd1"
        ]
    });

    let event2 = new Event({
        "_id": "599cdc098e709da3fcb00bde",
        "name": "Party Night",
        "description": "Party tonight. lets go lets go.",
        "max_attendees": 40,
        "location": "599cd95c8e709da3fcb00bda",
        "start_time": "2017-08-27T06:00:00.000Z",
        "end_time": "2017-08-27T10:30:00.000Z",
        "__v": 1,
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "attendees": [
            "599cce8c8e709da3fcb00bd3",
            "599cceeb8e709da3fcb00bd5"
        ],
        "admins": [
            "599cce8c8e709da3fcb00bd3"
        ]
    });

    let event3 = new Event({
        "_id": "599cddb2a5816ea5394eb273",
        "name": "Skating evening",
        "description": "Anyone interested in skating this evening? skaters, scooters, bmx welcome.",
        "max_attendees": 10,
        "location": "599cdd41a5816ea5394eb272",
        "start_time": "2017-08-27T01:00:00.000Z",
        "end_time": "2017-08-27T05:00:00.000Z",
        "__v": 1,
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "attendees": [
            "599cce8c8e709da3fcb00bd3",
            "599cceeb8e709da3fcb00bd5"
        ],
        "admins": [
            "599cce8c8e709da3fcb00bd3"
        ]
    });
    
    let event4 = new Event({
        "_id": "599cfcd2a5816ea5394eb279",
        "name": "Small Concert",
        "description": "Im gonna have a small concert. please come support me.",
        "max_attendees": 30,
        "location": "599cd95c8e709da3fcb00bda",
        "start_time": "2017-08-27T01:00:00.000Z",
        "end_time": "2017-08-27T05:00:00.000Z",
        "__v": 1,
        "totalRating": 0,
        "rated_users": [],
        "blocked_users": [],
        "attendees": [
            "599cd1488e709da3fcb00bd7",
            "599cce8c8e709da3fcb00bd3"
        ],
        "admins": [
            "599cd1488e709da3fcb00bd7"
        ]
    });

    let seedEvents = [event1, event2, event3, event4];
    Event.insertMany(seedEvents).then(()=>{
        res.status(201).json("list of seed events created");
    }).catch(err=>{return next(err);})
});


// ----------<for development use>-----------
// show all events
// API GET localhost:3000/dev/showAllEvents
router.get('/showAllEvents', (req,res,next) =>{
    Event.find({}, function(err, result){
        if(err) return next(err);
        res.status(200).json(result);
    });
});

// ----------<for development use>-----------
// delete all events
// API POST localhost:3000/dev/deleteAllEvents
router.post('/deleteAllEvents', (req,res,next) =>{
    if(Event.collection.drop()){
        res.status(202).send();
    } else {
        res.status(500).send("Error");
    }
});

// ----------<for development use>-----------
// Create a list of seed locations
// API POST localhost:3000/dev/createSeedLocations
router.post('/createSeedLocations', (req,res,next) =>{

    let location1 = new Location({
        "_id": "599cd8c58e709da3fcb00bd9",
        "name": "Nasa Headquarter",
        "coordinates": [
            -122.06445693969727,
            37.40889176297184
        ],
        "city": "Mountain View",
        "state": "California",
        "zipcode": 94043,
        "__v": 0,
        "events": [],
        "type": "Point"
    });

    let location2 = new Location({
        "_id": "599cd95c8e709da3fcb00bda",
        "name": "Castro Street",
        "coordinates": [
            -122.07817210000002,
            37.3945401
        ],
        "city": "Mountain View",
        "state": "California",
        "zipcode": 94041,
        "__v": 2,
        "events": [
            "599cdc098e709da3fcb00bde",
            "599cfcd2a5816ea5394eb279"
        ],
        "type": "Point"
    });

    let location3 = new Location({
        "_id": "599cd9938e709da3fcb00bdb",
        "name": "Stanford Shopping Center",
        "coordinates": [
            -122.17157400000002,
            37.443126
        ],
        "city": "Menlo Park",
        "state": "California",
        "zipcode": 94025,
        "__v": 0,
        "events": [],
        "type": "Point"
    });

    let location4 = new Location({
        "_id": "599cda008e709da3fcb00bdc",
        "name": "Homestead Bowl",
        "coordinates": [
            -122.04015070000003,
            37.3363068
        ],
        "city": "Sunnyvale",
        "state": "California",
        "zipcode": 94087,
        "address": "20990 Homestead Rd",
        "__v": 1,
        "events": [
            "599cdb6a8e709da3fcb00bdd"
        ],
        "type": "Point"
    });

    let location5 = new Location({
        "_id": "599cdd41a5816ea5394eb272",
        "name": "Rengstorff skatepark",
        "coordinates": [
            -122.0972117,
            37.40240050000001
        ],
        "city": "Mountain View",
        "state": "California",
        "zipcode": 94043,
        "address": "2057 Crisanto Ave",
        "__v": 1,
        "events": [
            "599cddb2a5816ea5394eb273"
        ],
        "type": "Point"
    });

    let seedLocations = [location1, location2, location3, location4, location5];
    Location.insertMany(seedLocations).then(()=>{
        res.status(201).json("list of seed locations created");
    }).catch(err=>{return next(err);})
});


// ----------<for development use>-----------
// show all locations
// API GET localhost:3000/dev/showAllLocations
router.get('/showAllLocations', (req,res,next) =>{
    Location.find({}, function(err, result){
        if(err) return err;
        res.status(200).json(result);
    });
});

// ----------<for development use>-----------
// delete all locations
// API POST localhost:3000/dev/deleteAllLocations
router.post('/deleteAllLocations', (req,res,next) =>{
    if(Location.collection.drop()){
        res.status(202).send();
    } else {
        res.status(500).json("Error");
    }
});

module.exports = router;