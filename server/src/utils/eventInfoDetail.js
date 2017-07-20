'use strict';

const _ = require('lodash');

const eventInfoDetail = function(self_user, that_event, permission){
  let result = that_event.toJSON();

  result = _.pick(result,permission);

  result.hasRated = that_event.wasRatedBy(self_user);
  result.isAdmin = that_event.isAdmin(self_user);
  result.isAttendee = that_event.isAttendee(self_user);

  return result;
}

module.exports = {eventInfoDetail};