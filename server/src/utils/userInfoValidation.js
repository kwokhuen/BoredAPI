'use strict';

const validator = require('validator');
const {User} = require('db/models/User');
const {USER_INFO_CONST} = require('config/constants');

var userInfoValidation = (userInfo, next, update, callback) =>{
  //TODO: If we have a unique field, should check uniqueness here too
  // uniquely identify a user: cell?usercode?email?

  //update allows null values for required fields
  // verify the request body has all fields defined and are valid
  let haveError = false;
  const argError = new Error('Error(s) in userInfo data');
  argError.status = 400;
  argError.name = 'BadArgument';
  argError.target = 'userInfo';
  argError.details = [];

  var fieldValidation = function(field, fieldName, required, fieldType,
    badValueMessage, validateFunction){
    if(field === undefined || field === null){
      // check if value is null/undefined
      if(required)
        if(field === null || !update){
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
  const badDisplayName = 'Display name\'s length must be between '
    + USER_INFO_CONST.MIN_DISPLAYNAME_LENGTH + ' and '
    + USER_INFO_CONST.MAX_DISPLAYNAME_LENGTH;

  const badUserName = 'Username\'s length must be between '
    + USER_INFO_CONST.MIN_DISPLAYNAME_LENGTH + ' and '
    + USER_INFO_CONST.MAX_DISPLAYNAME_LENGTH;

  const badPassword = 'Password\'s length must be between '
    + USER_INFO_CONST.MIN_PASSWORD_LENGTH + ' and '
    + USER_INFO_CONST.MAX_PASSWORD_LENGTH;

  const badFirstName = 'First name\'s length must be between '
    + USER_INFO_CONST.MIN_NAME_LENGTH + ' and '
    + USER_INFO_CONST.MAX_NAME_LENGTH;

  const badLastName = 'Last name\'s length must be between '
    + USER_INFO_CONST.MIN_NAME_LENGTH + ' and '
    + USER_INFO_CONST.MAX_NAME_LENGTH;

  const badAge = 'Age must be between '
    + USER_INFO_CONST.MIN_AGE + ' and '
    + USER_INFO_CONST.MIN_AGE;

  const badGender = 'Gender must be a number (0 for female, 1 for male)';

  const badEmail = 'Not a valid email';

  const badProfilePic = 'Not a valid URL';

  //validate displayName
  fieldValidation(userInfo.displayName, 'displayName', true, 'string',
    badDisplayName, function(field){
      return (field.length>=USER_INFO_CONST.MIN_DISPLAYNAME_LENGTH
        && field.length <= USER_INFO_CONST.MAX_DISPLAYNAME_LENGTH);
  });

  //validate username
  fieldValidation(userInfo.username, 'username', true, 'string',
    badUserName, function(field){
      return (field.length>=USER_INFO_CONST.MIN_DISPLAYNAME_LENGTH
        && field.length <= USER_INFO_CONST.MAX_DISPLAYNAME_LENGTH);
  });

  //validate password
  fieldValidation(userInfo.password, 'password', true, 'string',
    badPassword, function(field){
      return (field.length>=USER_INFO_CONST.MIN_PASSWORD_LENGTH
        && field.length <= USER_INFO_CONST.MAX_PASSWORD_LENGTH);
  });

  //validate firstName
  fieldValidation(userInfo.firstName, 'firstName', true, 'string',
    badFirstName, function(field){
      return (field.length>=USER_INFO_CONST.MIN_NAME_LENGTH
        && field.length <= USER_INFO_CONST.MAX_NAME_LENGTH);
  });

  //validate lastName
  fieldValidation(userInfo.lastName, 'lastName', true, 'string',
    badLastName, function(field){
      return (field.length>=USER_INFO_CONST.MIN_NAME_LENGTH
        && field.length <= USER_INFO_CONST.MAX_NAME_LENGTH);
  });

  //validate age
  fieldValidation(userInfo.age, 'age', true, 'number',
    badAge, function(field){
      return (field >= USER_INFO_CONST.MIN_AGE
        && field <= USER_INFO_CONST.MAX_AGE);
  });

  //validate gender
  fieldValidation(userInfo.gender, 'gender', true, 'number',
    badGender, function(field){
      return (field === 1 || field === 0);
  });

  //validate email
  fieldValidation(userInfo.email, 'email', true, 'string',
    badEmail, function(field){
      return validator.isEmail(field);
  });

  //validate profilePic
  fieldValidation(userInfo.profilePic, 'profilePic', false, 'string',
    badProfilePic, function(field){
      return validator.isURL(field);
  });

  if(haveError)
    return next(argError);
  else
    callback();
}

module.exports = {userInfoValidation};
