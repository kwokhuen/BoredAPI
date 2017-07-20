//------------------------User routes----------------------------

// ------------------My Account/My info----------------------

// login route
// API POST localhost:3000/account/login
// permission: all users

// logout route
// API POST localhost:3000/account/logout
// permission: all logged-in users

// create a new user
// API POST localhost:3000/account
// permission: all users, not logged-in

// view self_user's profile
// API GET localhost:3000/account
// permission: self_user

// update self_user's profile
// API PUT localhost:3000/account
// permission: self_user

// show users blocked by self_user
// API GET localhost:3000/account/blockedList
// permission: self_user

// show friendList of self_user
// API GET localhost:3000/account/friendList
// permission: self_user

// -------------Interact with Other Users-----------------

//---get user's info---

// get userId_user's profile
// API GET localhost:3000/users/:userId
// permission: all logged-in users

// see userId_user's friendlist
// API GET localhost:3000/users/:userId/friendList
// permission: userId_user's friends

//-----do actions-----

// Send friend request to userId_user
// API POST localhost:3000/users/:userId/sendFriendRequest
// permission: all logged-in users

// Cancel friend request sent to userId_user
// API POST localhost:3000/users/:userId/cancelFriendRequest
// permission: all logged-in users

// Unfriend userId_user
// API POST localhost:3000/users/:userId/unfriend
// permission: userId_user's friend

// Block userId_user
// API POST localhost:3000/users/:userId/block
// permission: all logged-in users

// Unblock userId_user
// API POST localhost:3000/users/:userId/unblock
// permission: users who have blocked userId_user

// Rate userId_user
// API POST localhost:3000/users/:userId/rate
// permission: userId_user's friends

//-------------Friend requests received from other users-------------------

// View friend requests
// API GET localhost:3000/friendRequests
// permission: all logged-in users

// Accept friend request from userId_user
// API POST localhost:3000/friendRequests/:userId
// permission: all logged-in users

// Ignore friend request from userId_user
// API DELETE localhost:3000/friendRequests/:userId
// permission: all logged-in users

//------------------------Event routes----------------------------

// ------------------Event--------------------

// create an event
// API: POST localhost:3000/events
// permission: all logged-in users

// get an eventId_event info
// API GET localhost:3000/event/:eventId
// permission: all logged-in users

// update eventId_event info
// API: PUT localhost:3000/events/:eventId
// permission: event admins

// Delete eventId_event - the whole event will be terminated if the an admin decided to do so
// API: DELETE localhost:3000/events/:eventId
// permission: event admins

// Rate eventId_event
// API: POST localhost:3000/events/:eventId/rate
// permission: event attendees

//-------------------Event Attendee -------------------

// Get the whole list of attendees of eventId_event
// API: GET /events/:eventId/attendees
// permission: all logged-in users


// Add userId_user to the attendees list of eventId_event
// API: POST /events/:eventId/attendees/:userId
// permission: userId_user

// Remove userId_user from the attendee list of eventId_event
// API: DELETE /events/:eventId/attendees/:userId
// permission: userId_user, admin

//------------Event Admin -------------------
// /event/:eventId/admin

// Get the whole list of admins of eventId_event
// API: GET /events/:eventId/admins
// permission: all logged-in users

// Add userId_user from attendee list to the admin list
// API: POST /events/:eventId/admins/:userId
// permission: admin

// Remove user :userId from the admin list
// API: DELETE /events/:eventId/admins/:userId

//------------------Event Blocked users -------------------
// /event/:eventId/blockedList

// Get the whole list of blocked Users of that event
// API: GET /events/:eventId/blockedList
// permission: admin

// Add userId_user to the blocked_users list
// API: POST /events/:eventId/blockedList/:userId
// permission: admin

// Unblock userId_user list from the event
// API: DELETE /events/:eventId/blockedList/:userId
// permission: admin


//------------------Utils routes -------------------

// check username existance
// API GET localhost:3000/utils/usernameExist/:username
// permission: all users

// check email existance
// API GET localhost:3000/utils/emailExist/:email
// permission: all users
