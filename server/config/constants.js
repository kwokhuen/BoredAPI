module.exports = {
  USER_INFO_CONST: {
    MIN_NAME_LENGTH : 1,
    MAX_NAME_LENGTH : 30,
    MIN_DISPLAYNAME_LENGTH : 3,
    MAX_DISPLAYNAME_LENGTH : 20,
    MIN_PASSWORD_LENGTH : 10,
    MAX_PASSWORD_LENGTH : 20,
    MIN_AGE : 14,
    MAX_AGE : 100
  },
  EVENT_INFO_CONST:{
    MIN_NAME_LENGTH: 5,
    MAX_NAME_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 200
  },
  PERMISSION_SETTINGS_USER:{
    ALL_FIELDS:['_id', 'username', 'displayName', 'firstName','lastName','age',
      'gender','profilePic','friends','friend_requests','blocked_users',
      'rating', 'email'],
    SELF:['_id', 'username', 'displayName', 'firstName','lastName','age',
      'gender','profilePic','friends','friend_requests','blocked_users',
      'rating', 'email'],
    FRIENDS:['_id', 'username', 'displayName', 'firstName','lastName','age',
      'gender','profilePic','friends', 'rating'],
    USERS:['_id', 'username', 'displayName', 'firstName','lastName','age',
      'gender','profilePic','rating'],
    BLOCKED_USERS:['_id', 'username'],
    //what users info show on friend list
    LIST:['_id', 'username', 'displayName', 'firstName','lastName',
      'gender','profilePic']
  },
  PERMISSION_SETTINGS_EVENT:{
    ALL_FIELDS:['_id','name','description','admins','attendees','blocked_users',
      'num_attendees','num_admins','rating'],
    ADMINS:['_id','name','description','admins','attendees','blocked_users',
      'num_attendees','num_admins','rating'],
    ATTENDEES:['_id','name','description','admins','attendees','num_attendees',
      'num_admins','rating'],
    USERS:['_id','name','description','admins','attendees','num_attendees',
      'num_admins','rating'],
    BLOCKED_USERS:['_id','name'],
    //what event info show on list
    LIST:['_id','name','description','num_attendees','num_admins','rating']
  }
}
