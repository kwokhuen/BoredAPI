
// --------------------permission middlewares------------------------

// --------------------sufficient authurization----------------------
// those permissions below are sufficient authurization, not necessary
// that means users with either one of the permits below are authurized
// to do the action requested.
// NOTE need to call checkPermission middleware at the end.

//grant permission if user is userId_user
const grantSelf = (req,res,next) => {
  //check if user is userId_user
  if(req.user.equals(res.userId_user))
    req.permitted = true;
  next();
}

//grant permission if user is eventId_event admin
const grantAdmin = (req,res,next) => {
  //check if user is admin
  if(res.eventId_event.isAdmin(req.user))
    req.permitted = true;
  next();
}

//grant permission if user is eventId_event attendee
const grantAttendee = (req,res,next) => {
  //check if user is admin
  if(res.eventId_event.isAttendee(req.user))
    req.permitted = true;
  next();
}

//call this to check if permission is granted
const checkPermission = (req,res,next) => {
  //check if req.permitted is flagged to true
  if(!req.permitted){
    let err = new Error('User is not authurized for this action.');
    err.status = 404;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }
  next();
}

//---------------------necessary conditions----------------------
// those permissions below are necessary authurization, not sufficient
// that means users have to pass through all of them
// in order to be authurized for the action requested.

//check if req.user is not blocked by res.userId_user
const checkNotBlockedByUser = (req,res,next) => {
  if(res.userId_user.hasBlocked(req.user)){
    let err = new Error('User ' + res.userId_user._id.toString() + ' has blocked you.');
    err.status = 404;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }
  next();
}

//check if req.user is res.userId_user
const checkSelf = (req,res,next) => {
  //check if user is userId_user
  if(!req.user.equals(res.userId_user)){
    let err = new Error('User is not authurized for this action.');
    err.status = 404;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }
  next();
}

//check if req.user is not res.userId_user
const checkNotSelf = (req,res,next) => {
  //check if user is userId_user
  if(req.user.equals(res.userId_user)){
    let err = new Error('User is not authurized for this action.');
    err.status = 404;
    err.name = 'Permission Denied';
    err.target = 'user';
    return next(err);
  }
  next();
}


module.exports = {
  grantSelf,
  grantAdmin,
  grantAttendee,
  checkPermission,
  checkNotBlockedByUser,
  checkSelf,
  checkNotSelf };
