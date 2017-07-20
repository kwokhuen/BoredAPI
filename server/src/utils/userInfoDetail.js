'use strict';

const _ = require('lodash');

const userInfoDetail = function(self_user, that_user, permission){
  let result = that_user.toJSON();

  result = _.pick(result,permission);

  result.hasBlocked = self_user.hasBlocked(that_user);
  result.isFriend = self_user.isFriendWith(that_user);
  result.hasSentFriendRequest = that_user.hasReceivedFriendRequestFrom(self_user);
  result.hasRated = that_user.wasRatedBy(self_user);
  result.isSelf = that_user.equals(self_user);

  return result;
}

module.exports = {userInfoDetail};