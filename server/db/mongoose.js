// import mongoose from 'mongoose'
const mongoose = require('mongoose');
// import db config
const {DB_CONFIG} = require('config/database');
// config mongoose to use Javascript Promise
mongoose.Promise = global.Promise;
// connect mongoose to local development db
// mondifiy the address
mongoose.connect(DB_CONFIG.DOMAIN);

module.exports = {mongoose};
