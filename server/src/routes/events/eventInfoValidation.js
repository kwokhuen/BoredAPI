'use strict';

const validator = require('validator');
const {User} = require('../../../db/models/User');
const {Event} = require('../../../db/models/Event')
const {USER_INFO_CONST} = require('../../constants');
const {EVENT_INFO_CONST} = require('../../constants');

var eventInfoValidation = (req, next, callback) =>{
  //verify event info

  var haveError = false;
  var argError = new Error('Error(s) in event info');
  argError.status = 400;
  argError.name = 'BadArgument';
  argError.target = 'eventInfo';
  argError.details = [];



  if(haveError)
    return next(argError);
  else
    callback();
}

module.exports = {eventInfoValidation};
