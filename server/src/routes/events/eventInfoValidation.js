'use strict';

const validator = require('validator');
const {User} = require('../../../db/models/User');
const {Event} = require('../../../db/models/Event')
const {USER_INFO_CONST} = require('../../constants');
const {EVENT_INFO_CONST} = require('../../constants');

var eventInfoValidation = (eventInfo, next, partialUpdate, callback) =>{
  //partialUpdate allows null values for required fields
  // verify the request body has all fields defined and are valid

  var haveError = false;
  var argError = new Error('Error(s) in event info');
  argError.status = 400;
  argError.name = 'BadArgument';
  argError.target = 'eventInfo';
  argError.details = [];

  var fieldValidation = function(field, fieldName, required, fieldType,
    badValueMessage, validateFunction){
    if(field === undefined || field === null){
      // check if value is null/undefined
      if(required)
        if(field === null || !partialUpdate){
          haveError = true;
          const inputErr = new Error();
          inputErr.code = 'NullValue';
          inputErr.target = fieldName;
          inputErr.input = 'undefined';
          inputErr.message = fieldName + ' must not be null';
          argError.details.push(inputErr);
        }
    } else if(typeof(field)!==fieldType){
      // check if input type is correct
      haveError = true;
      const inputErr = new Error();
      inputErr.code = 'TypeError';
      inputErr.target = fieldName;
      inputErr.input = field;
      inputErr.message = fieldName+' must be a '+fieldType;
      argError.details.push(inputErr);
    } else if(!validateFunction(field)){
      // check if input is valid
      haveError = true;
      const inputErr = new Error();
      inputErr.code = 'BadValue';
      inputErr.target = fieldName;
      inputErr.input = field;
      inputErr.message = badValueMessage;
      argError.details.push(inputErr);
    }
  };

  // define bad value messages
  const badName = 'Event name\'s length must be between '
    + EVENT_INFO_CONST.MIN_NAME_LENGTH + ' and '
    + EVENT_INFO_CONST.MAX_NAME_LENGTH;

  const badDescription = 'Description\'s length must be between '
    + EVENT_INFO_CONST.MIN_DESCRIPTION_LENGTH + ' and '
    + EVENT_INFO_CONST.MAX_DESCRIPTION_LENGTH;

  //validate fields
  fieldValidation(eventInfo.name, 'name', true, 'string',
    badName, function(field){
      return (field.length>=EVENT_INFO_CONST.MIN_NAME_LENGTH
        && field.length <= EVENT_INFO_CONST.MAX_NAME_LENGTH);
  });

  fieldValidation(eventInfo.description, 'description', true, 'string',
    badDescription, function(field){
      return (field.length>=EVENT_INFO_CONST.MIN_DESCRIPTION_LENGTH
        && field.length <= EVENT_INFO_CONST.MAX_DESCRIPTION_LENGTH);
  });

  if(haveError)
    return next(argError);
  else
    callback();
}

module.exports = {eventInfoValidation};
