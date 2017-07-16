
// --------------------permission middlewares------------------------
// those permissions below are sufficient authurization, not necessary
// that means users with either one of the permits below are authurized
// to do the action requested.
// necessary authurization would be hard coded in the route

//grant permission if user is userId_user
const selfPermitted = (req,res,next) => {
  //check if user is userId_user
  if(req.user.equals(res.userId_user))
    req.permitted = true;
  next();
}

//grant permission if user is not userId_user
const notSelfPermitted = (req,res,next) => {
  //check if user is userId_user
  if(!req.user.equals(res.userId_user))
    req.permitted = true;
  next();
}

//grant permission if user is eventId_event admin
const adminPermitted = (req,res,next) => {
  //check if user is admin
  if(res.eventId_event.isAdmin(req.user))
    req.permitted = true;
  next();
}

//grant permission if user is eventId_event attendee
const attendeePermitted = (req,res,next) => {
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

module.exports = {
  selfPermitted,
  notSelfPermitted,
  adminPermitted,
  attendeePermitted,
  checkPermission };
