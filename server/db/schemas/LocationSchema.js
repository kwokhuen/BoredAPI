// import mongoose
const {mongoose} = require('../mongoose');
const Schema = mongoose.Schema;

// GeoJson data sample
// {
//   "location": {
//     "type": "Point",
//     "coordinates": [125.6, 10.1]
//   }
// }

// user schema
const LocationSchema = new Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
});

module.exports = {LocationSchema};
