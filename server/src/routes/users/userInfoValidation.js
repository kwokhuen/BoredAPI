'use strict';

const validator = require('validator');
const {User} = require('../../../db/models/User');
const {USER_INFO_CONST} = require('../../constants');

var userInfoValidation = (req, next, callback) =>{
  //TODO: If we have a unique field, should check uniqueness here too
  // uniquely identify a user: cell?username?email?

  // verify the request body has all fields defined and are valid
  var haveError = false;
  var argError = new Error('Error(s) in userInfo data');
  argError.name = 'BadArgument';
  argError.target = 'userInfo';
  argError.details = [];

  if(req.body.displayName === null){
    haveError = true;
    var dnError = new Error();
    dnError.name = 'NullValue';
    dnError.target = 'displayName';
    dnError.message = 'Display name must not be null';
    argError.details.push(dnError);
  } else if(req.body.displayName.length<USER_INFO_CONST.MIN_DISPLAYNAME_LENGTH
    || req.body.displayName.length > USER_INFO_CONST.MAX_DISPLAYNAME_LENGTH){
    haveError = true;
    var dnError = new Error();
    dnError.name = 'BadValue';
    dnError.target = 'displayName';
    dnError.message = 'Display name\'s length must be within '
      + USER_INFO_CONST.MIN_DISPLAYNAME_LENGTH + ' and '
      + USER_INFO_CONST.MAX_DISPLAYNAME_LENGTH;
    argError.details.push(dnError);
  }

  if(req.body.firstName === null){
    haveError = true;
    var fnError = new Error();
    fnError.name = 'NullValue';
    fnError.target = 'firstName';
    fnError.message = 'First name must not be null';
    argError.details.push(fnError);
  } else if(req.body.firstName.length<USER_INFO_CONST.MIN_NAME_LENGTH
    || req.body.firstName.length > USER_INFO_CONST.MAX_NAME_LENGTH){
    haveError = true;
    var fnError = new Error();
    fnError.name = 'BadValue';
    fnError.target = 'firstName';
    fnError.message = 'First name\'s length must be within '
      + USER_INFO_CONST.MIN_NAME_LENGTH + ' and '
      + USER_INFO_CONST.MAX_NAME_LENGTH;
    argError.details.push(fnError);
  }

  if(req.body.lastName === null){
    haveError = true;
    var lnError = new Error();
    lnError.name = 'NullValue';
    lnError.target = 'lastName';
    lnError.message = 'Last name must not be null';
    argError.details.push(lnError);
  } else if(req.body.lastName.length<USER_INFO_CONST.MIN_NAME_LENGTH
    || req.body.lastName.length > USER_INFO_CONST.MAX_NAME_LENGTH){
    haveError = true;
    var lnError = new Error();
    lnError.name = 'BadValue';
    lnError.target = 'lastName';
    lnError.message = 'Last name\'s length must be within '
      + USER_INFO_CONST.MIN_NAME_LENGTH + ' and '
      + USER_INFO_CONST.MAX_NAME_LENGTH;
    argError.details.push(lnError);
  }

  if(req.body.age === null){
    haveError = true;
    var ageError = new Error();
    ageError.name = 'NullValue';
    ageError.target = 'age';
    ageError.message = 'Age must not be null';
    argError.details.push(ageError);
  } else if(req.body.age<USER_INFO_CONST.MIN_AGE
    || req.body.age>USER_INFO_CONST.MAX_AGE){
    haveError = true;
    var ageError = new Error();
    ageError.name = 'BadValue';
    ageError.target = 'age';
    ageError.message = 'Age must be within '
      + USER_INFO_CONST.MIN_NAME_LENGTH + ' and '
      + USER_INFO_CONST.MAX_NAME_LENGTH;
    argError.details.push(ageError);
  }

  if(req.body.gender === null){
    haveError = true;
    var gdError = new Error();
    gdError.name = 'NullValue';
    gdError.target = 'gender';
    gdError.message = 'Gender must not be null';
    argError.details.push(gdError);
  } else if(req.body.gender!==0 && req.body.gender!==1){
    haveError = true;
    var gdError = new Error();
    gdError.name = 'BadValue';
    gdError.target = 'gender';
    gdError.message = 'Gender must be 0 or 1';
    argError.details.push(gdError);
  }

  if(req.body.email === null){
    haveError = true;
    var emailError = new Error();
    emailError.name = 'NullValue';
    emailError.target = 'email';
    emailError.message = 'Email must not be null';
    argError.details.push(emailError);
  } else if(!validator.isEmail(req.body.email)){
    haveError = true;
    var emailError = new Error();
    emailError.name = 'BadValue';
    emailError.target = 'email';
    emailError.message = req.body.email + ' is not a valid email';
    argError.details.push(emailError);
  }

  if(haveError)
    return next(argError);
  else
    callback();
}

module.exports = {userInfoValidation};
