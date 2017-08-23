'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

const {PERMISSION_SETTINGS_USER} = require('config/constants');
const {LOCATION_CONST} = require('config/constants');

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

// add new location
// API: POST localhost:3000/location
// permission: all logged-in users
router.post('/', authenticate, (req, res, next) => {

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
// API GET localhost:3000/location/nearby
router.get('/nearby', authenticate, (req,res,next) =>{

    if(!req.query.lat || !req.query.long){
        var err = new Error('Latitude and longitude are not specified.');
        err.status = 404;
        err.name = 'Bad request';
        err.target = 'location';
        return next(err);
    }

    let queryInfo = {};

    queryInfo.lat = Number(req.query.lat);
    queryInfo.long = Number(req.query.long);
    queryInfo.distance = Number(req.query.distance);

    if(!queryInfo.distance)
        queryInfo.distance = LOCATION_CONST.DEFAULT_SEARCH_RADIUS;

    //calculate distance in miles
    let distance = queryInfo.distance/LOCATION_CONST.EARTH_RADIUS;

    Location.geoNear([queryInfo.long,queryInfo.lat],{maxDistance : distance, spherical : true, distanceMultiplier: LOCATION_CONST.EARTH_RADIUS}
        ,function(err, results, stats){
            if(err) return next(err);
            console.log(stats);
            res.status(200).json(results);
        });
});


// get a location info
// API GET localhost:3000/location/:locationId
// permission: all logged-in users
router.get('/:locationId', authenticate, (req,res,next) =>{

    let result = res.locationId_location.toJSON();;
    result.events = res.locationId_location.events;
    result.past_events = res.locationId_location.past_events;
    res.status(200).json(result);
});

module.exports = router;

