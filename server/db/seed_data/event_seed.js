'use strict';

const _ = require('lodash');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');
const {Location} = require('db/models/Location');

const generateEventSeed = function(callback){
    Event.find().exec(function(err,events){
        if(events.length>0){
            console.log('events already exist');
            return;
        }

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
           callback();
        }).catch(err=>{console.error(err);});
    });
};

module.exports = generateEventSeed;
