'use strict';

const _ = require('lodash');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');
const {Location} = require('db/models/Location');

const generateLocationSeed = function(callback){
    Location.find().exec(function(err,locations){
        if(locations.length>0){
            console.log('locations already exist');
            return;
        }

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

        let seedLocations = [location1, location2, location3, location4];
        Location.insertMany(seedLocations).then(()=>{
           callback();
        }).catch(err=>{console.error(err);});
    });
};

module.exports = generateLocationSeed;
