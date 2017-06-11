// import mongoose from 'mongoose'
const mongoose = require('mongoose');
// config mongoose to use Javascript Promise
mongoose.Promise = global.Promise;
// connect mongoose to local development db
// mondifiy the address
mongoose.connect('mongodb://localhost:27017/BoredApi');

module.exports = {mongoose};
