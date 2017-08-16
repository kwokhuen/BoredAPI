'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {PERMISSION_SETTINGS_USER} = require('config/constants');

const {User} = require('db/models/User');
const {Event} = require('db/models/Event');
const {Location} = require('db/models/Location');

const {userInfoValidation} = require('src/utils/userInfoValidation');
const authenticate = require('src/middlewares/authenticate');

const {userInfoDetail} = require('src/utils/userInfoDetail');

const cities = require('cities');

const {locationIdParam} = require('src/middlewares/param');


// param middleware
// whenever locationId is in param
// find the location from db based on locationId and assign it to res.locationId_location
router.param('locationId', locationIdParam);

//-------------------Routes-----------------------
// ------------------Location Collection--------------------

// show all locations
// API GET localhost:3000/location
router.get('/', (req,res,next) =>{
    Location.find({}, function(err, result){
        if(err) return err;
        res.status(200).json(result);
    });
});

// delete all locations
// API DELETE localhost:3000/location
router.delete('/', (req,res,next) =>{
    if(Location.collection.drop()){
        res.status(202).send();
    } else {
        res.status(500).json("Error");
    }
});

// add new location
// API: POST localhost:3000/location
// permission: all logged-in users
router.post('/', (req, res, next) => {

    let locationData = _.pick(req.body, ['name','type','lat','long','address']);

    let cityInfo = cities.gps_lookup(locationData.lat,locationData.long);

    // { zipcode: '94041',
    //   state_abbr: 'CA',
    //   latitude: '37.389490',
    //   longitude: '-122.07846',
    //   city: 'Mountain View',
    //   state: 'California',
    //   distance: 0.7260101806336009 }

    let coordinates = [locationData.long,locationData.lat];

    let newLocation = new Location({'name':locationData.name,
                                    'type':locationData.type,
                                    'coordinates':coordinates,
                                    'city':cityInfo.city,
                                    'state':cityInfo.state,
                                    'zipcode':cityInfo.zipcode,
                                    'address':locationData.address
    });

    newLocation.save(function(err,location){
        if(err) return next(err);
        res.status(202).json(location);
    });

});

// show all locations near by
// API POST localhost:3000/location/nearby
router.post('/nearby', (req,res,next) =>{
    let body = _.pick(req.body, ['lat','long','distance']);

    //3958.8 = radius of earth in miles
    const EARTH_RADIUS = 3958.8;
    let distance = body.distance/EARTH_RADIUS;

    Location.geoNear([body.long,body.lat],{maxDistance : distance, spherical : true, distanceMultiplier: EARTH_RADIUS},
        function(err, results, stats){
            if(err) return next(err);
            res.status(200).json(results);
        }
    );
});


// get a location info
// API GET localhost:3000/location/:locationId
// permission: all logged-in users
router.get('/:locationId', (req,res,next) =>{

    let result = res.locationId_location.toJSON();;
    result.upcoming_events = res.locationId_location.upcoming_events;
    result.past_events = res.locationId_location.past_events;
    res.status(200).json(result);
});

module.exports = router;

