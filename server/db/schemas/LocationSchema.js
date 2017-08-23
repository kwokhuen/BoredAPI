'use strict';

// import mongoose
const {mongoose} = require('../mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const LocationSchema = new Schema({
    name: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipcode: {
        type: Number,
    },
    address:{
        type: String
    },
    events: [{type:Schema.ObjectId, ref:"Event"}]
});

LocationSchema.index({ coordinates: "2dsphere" }); 
LocationSchema.virtual('num_events').get(function () {
  return this.events.length;
});

//override mongoose to only send needed info
LocationSchema.methods.toJSON = function() {
  let locationObject = this.toObject({virtuals:true});

  // locationObject = _.pick(locationObject,['name','city','state','zipcode','address','num_events','_id']);
  return locationObject;
}

module.exports = {LocationSchema};
